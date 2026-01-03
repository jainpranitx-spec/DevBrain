"""
REST API Views for DevBrain.
Provides endpoints for mind map CRUD, chat, knowledge base uploads, and AI assistance.
"""

from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Project, Node, Edge, KnowledgeBase, ChatMessage
from .serializers import (
    ProjectDetailSerializer, ProjectListSerializer,
    NodeSerializer, EdgeSerializer, KnowledgeBaseSerializer,
    ChatMessageSerializer, CreateNodeSerializer
)
from .services import GeminiAIService, KnowledgeSearchService


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for project management.
    
    Endpoints:
    - GET /api/projects/ - List all user projects
    - POST /api/projects/ - Create new project
    - GET /api/projects/{id}/ - Get project with nodes/edges
    - PUT/PATCH /api/projects/{id}/ - Update project
    - DELETE /api/projects/{id}/ - Delete project
    """
    
    queryset = Project.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectDetailSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Project.objects.filter(owner=self.request.user)
        else:
            # For development, show projects from default user
            default_user, created = User.objects.get_or_create(
                username='default_user',
                defaults={
                    'email': 'default@devbrain.com',
                    'first_name': 'Default',
                    'last_name': 'User'
                }
            )
            return Project.objects.filter(owner=default_user)
    
    def perform_create(self, serializer):
        # Handle anonymous users for development
        if self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
        else:
            # Create or get a default user for development
            default_user, created = User.objects.get_or_create(
                username='default_user',
                defaults={
                    'email': 'default@devbrain.com',
                    'first_name': 'Default',
                    'last_name': 'User'
                }
            )
            serializer.save(owner=default_user)
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Export project as JSON."""
        project = self.get_object()
        serializer = ProjectDetailSerializer(project)
        return Response(serializer.data)


class NodeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for node management within a project.
    
    Endpoints:
    - GET /api/nodes/?project={id} - List nodes
    - POST /api/nodes/ - Create node
    - GET /api/nodes/{id}/ - Get node details
    - PUT/PATCH /api/nodes/{id}/ - Update node
    - DELETE /api/nodes/{id}/ - Delete node (cascades to children)
    - POST /api/nodes/{id}/move/ - Move node to new position
    """
    
    serializer_class = NodeSerializer
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Node.objects.filter(project_id=project_id)
        return Node.objects.all()
    
    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        project = get_object_or_404(Project, id=project_id)
        serializer.save(project=project)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Update node position."""
        node = self.get_object()
        position = request.data.get('position', {})
        node.position_x = position.get('x', node.position_x)
        node.position_y = position.get('y', node.position_y)
        node.save()
        return Response(NodeSerializer(node).data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Quick update for node status."""
        node = self.get_object()
        status = request.data.get('status')
        if status in ['not-started', 'in-progress', 'completed']:
            node.status = status
            node.save()
            return Response({'status': 'success', 'node': NodeSerializer(node).data})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        """Get direct children of this node."""
        node = self.get_object()
        children = node.get_children()
        return Response(NodeSerializer(children, many=True).data)


class EdgeViewSet(viewsets.ModelViewSet):
    """API endpoint for edge management (connections between nodes)."""
    
    serializer_class = EdgeSerializer
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Edge.objects.filter(project_id=project_id)
        return Edge.objects.all()
    
    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        project = get_object_or_404(Project, id=project_id)
        serializer.save(project=project)


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for knowledge base file uploads.
    
    Supports: PDF, TXT, MD, DOCX
    Files are processed and indexed for semantic search.
    """
    
    serializer_class = KnowledgeBaseSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return KnowledgeBase.objects.filter(project_id=project_id)
        return KnowledgeBase.objects.all()
    
    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        project = get_object_or_404(Project, id=project_id)
        file_obj = self.request.FILES.get('file')
        
        # Extract content for indexing
        content = self._extract_file_content(file_obj)
        
        # Handle anonymous users
        uploaded_by = self.request.user if self.request.user.is_authenticated else None
        
        serializer.save(
            project=project,
            uploaded_by=uploaded_by,
            full_text=content,
            content_preview=content[:500]
        )
    
    @staticmethod
    def _extract_file_content(file_obj) -> str:
        """Extract text content from uploaded file."""
        try:
            file_name = file_obj.name.lower()
            
            if file_name.endswith('.txt') or file_name.endswith('.md'):
                return file_obj.read().decode('utf-8', errors='ignore')
            
            elif file_name.endswith('.pdf'):
                try:
                    import PyPDF2
                    pdf_reader = PyPDF2.PdfReader(file_obj)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text()
                    return text
                except ImportError:
                    return "[PDF content extraction requires PyPDF2]"
            
            elif file_name.endswith('.docx'):
                try:
                    from docx import Document
                    doc = Document(file_obj)
                    return "\n".join([para.text for para in doc.paragraphs])
                except ImportError:
                    return "[DOCX content extraction requires python-docx]"
        
        except Exception as e:
            return f"[Error extracting content: {str(e)}]"
        
        return "[Unsupported file type]"
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search knowledge base by query."""
        query = request.query_params.get('q', '')
        project_id = request.query_params.get('project')
        
        if not query or not project_id:
            return Response({'error': 'Missing query or project'}, status=status.HTTP_400_BAD_REQUEST)
        
        knowledge_bases = KnowledgeBase.objects.filter(project_id=project_id)
        scored_results = []
        
        for kb in knowledge_bases:
            full_text = (kb.full_text or "").lower()
            query_lower = query.lower()
            
            # Simple keyword match scoring
            score = full_text.count(query_lower)
            if score > 0:
                scored_results.append((kb, score))
        
        scored_results.sort(key=lambda x: x[1], reverse=True)
        results = [kb for kb, _ in scored_results[:10]]
        
        return Response(KnowledgeBaseSerializer(results, many=True).data)


class ChatViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing chat history."""
    
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        node_id = self.request.query_params.get('node')
        if node_id:
            return ChatMessage.objects.filter(node_id=node_id)
        return ChatMessage.objects.all()


class ChatNodeView(views.APIView):
    """
    POST /api/chat/node/{id}/
    Send a message to the AI for a specific node.
    """
    
    def post(self, request, node_id):
        try:
            node = get_object_or_404(Node, id=node_id)
            user_message = request.data.get('message')
            use_knowledge = request.data.get('use_knowledge', True)
            
            if not user_message:
                return Response(
                    {'error': 'Message required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save user message
            user_msg_obj = GeminiAIService.save_chat_message(
                node, 'user', user_message, 'user'
            )
            
            # Generate AI response
            ai_service = GeminiAIService()
            response_data = ai_service.generate_response(
                user_message, node, use_knowledge=use_knowledge
            )
            
            # Save AI response
            ai_msg_obj = GeminiAIService.save_chat_message(
                node,
                response_data['role'],
                response_data['message'],
                response_data['source']
            )
            
            return Response({
                'user_message': ChatMessageSerializer(user_msg_obj).data,
                'ai_response': ChatMessageSerializer(ai_msg_obj).data,
                'metadata': {
                    'source': response_data['source'],
                    'knowledge_used': response_data.get('knowledge_used', False),
                    'knowledge_sources': response_data.get('knowledge_sources', []),
                }
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SearchKnowledgeView(views.APIView):
    """
    GET /api/search/knowledge/?node={id}&query={q}
    Find relevant knowledge for a node.
    """
    
    def get(self, request):
        node_id = request.query_params.get('node')
        query = request.query_params.get('query')
        
        if not node_id:
            return Response(
                {'error': 'Node ID required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        node = get_object_or_404(Node, id=node_id)
        knowledge = KnowledgeSearchService.search_relevant_knowledge(
            node, query or None, top_k=5
        )
        
        return Response({
            'node': node_id,
            'knowledge': KnowledgeBaseSerializer(knowledge, many=True).data,
            'count': len(knowledge)
        })
