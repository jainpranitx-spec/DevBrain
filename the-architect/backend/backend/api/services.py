"""
AI Service - Handles Gemini API integration and knowledge retrieval.
"""

import os
from django.conf import settings
from .models import Node, KnowledgeBase, ChatMessage
import re

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class KnowledgeSearchService:
    """Search and retrieve relevant knowledge for a node context."""

    @staticmethod
    def search_relevant_knowledge(node: Node, query: str = None, top_k: int = 3):
        """
        Find knowledge base entries relevant to the given node.
        
        Strategy:
        1. Search by node label/description keywords
        2. Search by user query if provided
        3. Return top_k most relevant results
        """
        if not node.project:
            return []

        knowledge_bases = node.project.knowledge_bases.all()
        if not knowledge_bases.exists():
            return []

        search_text = query or f"{node.label} {node.description}".lower()
        keywords = re.findall(r'\w+', search_text.lower())

        scored_bases = []
        for kb in knowledge_bases:
            # Simple keyword matching score
            score = 0
            full_text = (kb.full_text or kb.content_preview or "").lower()
            for keyword in keywords:
                score += full_text.count(keyword)
            
            if score > 0:
                scored_bases.append((kb, score))

        # Sort by score descending and return top K
        scored_bases.sort(key=lambda x: x[1], reverse=True)
        return [kb for kb, _ in scored_bases[:top_k]]

    @staticmethod
    def format_knowledge_context(knowledge_bases: list) -> str:
        """Format knowledge base content into a contextual prompt."""
        if not knowledge_bases:
            return ""

        context = "## Relevant Knowledge Base:\n\n"
        for kb in knowledge_bases:
            preview = kb.content_preview or kb.full_text[:300]
            context += f"**{kb.title}** ({kb.file_type}):\n{preview}\n\n"
        return context


class GeminiAIService:
    """Handle AI responses using Google Gemini API."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL

        # --- ADD THESE LINES FOR DEBUGGING ---
        print(f"DEBUG: GENAI_AVAILABLE = {GENAI_AVAILABLE}")
        print(f"DEBUG: API KEY is default? = {self.api_key == 'INSERT API KEY'}")
        
        if GENAI_AVAILABLE and self.api_key != "INSERT API KEY":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.available = True
        else:
            self.available = False

    def generate_response(self, user_message: str, node: Node, use_knowledge: bool = True) -> dict:
        """
        Generate AI response for a node's chat.
        
        Process:
        1. Search relevant knowledge from uploads
        2. Build context-aware prompt
        3. Call Gemini API (or fallback to mock)
        4. Return response with metadata
        """
        
        # Search relevant knowledge
        knowledge_bases = []
        knowledge_context = ""
        if use_knowledge:
            knowledge_bases = KnowledgeSearchService.search_relevant_knowledge(node, user_message)
            knowledge_context = KnowledgeSearchService.format_knowledge_context(knowledge_bases)

        # Build prompt
        system_prompt = f"""You are an intelligent assistant for DevBrain, a mind-mapping tool for project planning.
The user is working on: **{node.label}**
Description: {node.description or 'No description provided'}
Status: {node.get_status_display()}

{knowledge_context}

Guidelines:
- Keep responses concise and actionable (2-3 sentences)
- Ground answers in the provided knowledge base when possible
- If asked to break down work, suggest concrete subtasks
- Maintain focus on the current node's scope
- Be helpful without unnecessary elaboration"""

        full_prompt = f"{system_prompt}\n\nUser: {user_message}"

        if self.available:
            return self._gemini_response(full_prompt, user_message, knowledge_bases)
        else:
            return self._mock_response(user_message, node, knowledge_bases)

    def _gemini_response(self, prompt: str, user_message: str, knowledge_bases: list) -> dict:
        """Call Gemini API and return response."""
        try:
            response = self.model.generate_content(prompt)
            return {
                'message': response.text,
                'role': 'ai',
                'source': 'gemini-api',
                'knowledge_used': len(knowledge_bases) > 0,
                'knowledge_sources': [kb.title for kb in knowledge_bases],
            }
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fallback to mock
            return self._mock_response(user_message, None, knowledge_bases)

    @staticmethod
    def _mock_response(user_message: str, node: Node = None, knowledge_bases: list = None) -> dict:
        """Fallback mock response when API unavailable."""
        lower_msg = user_message.lower()
        knowledge_context = f"\n\n📚 **Using knowledge from:**\n- " + "\n- ".join([kb.title for kb in (knowledge_bases or [])]) if knowledge_bases else ""

        if any(word in lower_msg for word in ['break', 'task', 'sub', 'decompose']):
            return {
                'message': f"""**Breaking this down into subtasks:**

1. 📋 **Analyze Requirements** - Understand scope and constraints
2. 🏗️ **Design Solution** - Sketch architecture or approach  
3. 🔨 **Implement Core** - Build minimum viable piece
4. 🧪 **Test & Refine** - Verify and improve quality
5. 📝 **Document** - Capture learnings and decisions

Would you like to create these as sub-nodes?{knowledge_context}""",
                'role': 'ai',
                'source': 'mock',
                'knowledge_used': len(knowledge_bases or []) > 0,
                'knowledge_sources': [kb.title for kb in (knowledge_bases or [])],
            }

        if any(word in lower_msg for word in ['context', 'search', 'what', 'explain']):
            return {
                'message': f"""I'm analyzing the context for this node.

Based on your question, here are relevant patterns and approaches:
- Consider breaking this into smaller, testable components
- Focus on clear interfaces between sections
- Document assumptions as you go{knowledge_context}""",
                'role': 'ai',
                'source': 'mock',
                'knowledge_used': len(knowledge_bases or []) > 0,
                'knowledge_sources': [kb.title for kb in (knowledge_bases or [])],
            }

        return {
            'message': f"""I'm here to help with **{node.label if node else 'this task'}**.

I can assist with:
- 🔨 Breaking work into smaller subtasks
- 📚 Finding relevant information in your knowledge base
- 💡 Suggesting next steps
- 📝 Generating documentation

What would you like help with?{knowledge_context}""",
            'role': 'ai',
            'source': 'mock',
            'knowledge_used': len(knowledge_bases or []) > 0,
            'knowledge_sources': [kb.title for kb in (knowledge_bases or [])],
        }

    @staticmethod
    def save_chat_message(node: Node, role: str, message: str, source: str = 'user') -> ChatMessage:
        """Save a chat message to the database."""
        return ChatMessage.objects.create(
            node=node,
            role=role,
            message=message,
            source=source
        )
