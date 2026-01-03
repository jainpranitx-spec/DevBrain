"""
DRF Serializers for DevBrain API.
"""

from rest_framework import serializers
from .models import Project, Node, Edge, KnowledgeBase, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'message', 'source', 'created_at']
        read_only_fields = ['id', 'created_at']


class NodeSerializer(serializers.ModelSerializer):
    position = serializers.SerializerMethodField()
    parentId = serializers.CharField(source='parent.id', read_only=True, allow_null=True)
    children = serializers.SerializerMethodField()
    chat_messages = ChatMessageSerializer(many=True, read_only=True, source='chat_messages')

    class Meta:
        model = Node
        fields = [
            'id', 'label', 'description', 'status', 'owner',
            'parentId', 'position', 'created_at', 'updated_at',
            'children', 'chat_messages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_position(self, obj):
        return {'x': obj.position_x, 'y': obj.position_y}

    def get_children(self, obj):
        children = obj.get_children()
        return NodeSerializer(children, many=True).data


class EdgeSerializer(serializers.ModelSerializer):
    source_label = serializers.CharField(source='source.label', read_only=True)
    target_label = serializers.CharField(source='target.label', read_only=True)

    class Meta:
        model = Edge
        fields = ['id', 'source', 'target', 'source_label', 'target_label', 'created_at']
        read_only_fields = ['id', 'created_at']


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBase
        fields = ['id', 'title', 'file_type', 'content_preview', 'created_at', 'file']
        read_only_fields = ['id', 'created_at', 'content_preview']


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Full project with nested nodes and edges."""
    nodes = NodeSerializer(many=True, read_only=True)
    edges = EdgeSerializer(many=True, read_only=True)
    knowledge_bases = KnowledgeBaseSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'owner',
            'created_at', 'updated_at', 'nodes', 'edges', 'knowledge_bases'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight project listing."""
    node_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_at', 'node_count']

    def get_node_count(self, obj):
        return obj.nodes.count()


class CreateNodeSerializer(serializers.ModelSerializer):
    """Input serializer for node creation."""
    parent_id = serializers.CharField(required=False, allow_blank=True, write_only=True)
    position = serializers.JSONField(required=False, write_only=True)

    class Meta:
        model = Node
        fields = ['label', 'description', 'status', 'owner', 'parent_id', 'position']

    def create(self, validated_data):
        position = validated_data.pop('position', {'x': 0, 'y': 0})
        parent_id = validated_data.pop('parent_id', None)
        
        node = Node.objects.create(
            position_x=position.get('x', 0),
            position_y=position.get('y', 0),
            **validated_data
        )
        
        if parent_id:
            parent = Node.objects.get(id=parent_id)
            node.parent = parent
            node.save()
            # Auto-create edge
            Edge.objects.get_or_create(
                project=node.project,
                source=parent,
                target=node
            )
        
        return node
