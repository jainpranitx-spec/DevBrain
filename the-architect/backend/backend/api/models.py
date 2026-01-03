"""
Django models for DevBrain backend.
Mirrors the frontend Zustand store structure.
"""

from django.db import models
from django.contrib.auth.models import User
import uuid


class Project(models.Model):
    """Root project/mind map container."""
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Node(models.Model):
    """Mind map node - mirrors frontend node structure."""
    
    STATUS_CHOICES = [
        ('not-started', 'Not Started'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='nodes')
    label = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not-started')
    owner = models.CharField(max_length=255, blank=True, null=True)
    
    # Hierarchy
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        related_name='children',
        blank=True,
        null=True
    )
    
    # Position tracking for visual layout
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['project', 'parent']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.label} ({self.status})"

    def get_children(self):
        """Get all direct children."""
        return self.children.all()

    def get_descendants(self):
        """Get all descendant nodes recursively."""
        descendants = list(self.children.all())
        for child in descendants:
            descendants.extend(child.get_descendants())
        return descendants


class Edge(models.Model):
    """Connections between nodes (parent → child relationships)."""
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='edges')
    source = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='outgoing_edges')
    target = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='incoming_edges')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('source', 'target')
        indexes = [
            models.Index(fields=['project']),
            models.Index(fields=['source', 'target']),
        ]

    def __str__(self):
        return f"{self.source.label} → {self.target.label}"


class KnowledgeBase(models.Model):
    """Uploaded knowledge files (PDFs, docs, notes)."""
    
    FILE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('txt', 'Text'),
        ('md', 'Markdown'),
        ('docx', 'Word Document'),
    ]

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='knowledge_bases')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='knowledge_files/')
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    content_preview = models.TextField(blank=True)  # First 500 chars for quick reference
    
    # Vector embeddings for semantic search (for future use with embeddings)
    full_text = models.TextField(blank=True)  # Extracted/processed content
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.file_type})"


class ChatMessage(models.Model):
    """Chat history per node - mirrors frontend chatHistory structure."""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI Assistant'),
    ]

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    message = models.TextField()
    
    # Metadata
    source = models.CharField(max_length=50, default='user')  # 'real-api' or 'mock'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['node', 'created_at']),
        ]

    def __str__(self):
        return f"{self.role}: {self.message[:50]}..."
