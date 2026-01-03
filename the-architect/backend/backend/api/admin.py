"""
Django Admin configuration for DevBrain.
Provides web UI for managing projects, nodes, and knowledge base.
"""

from django.contrib import admin
from .models import Project, Node, Edge, KnowledgeBase, ChatMessage


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'node_count', 'created_at']
    list_filter = ['created_at', 'owner']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']

    def node_count(self, obj):
        return obj.nodes.count()
    node_count.short_description = 'Nodes'

    fieldsets = (
        ('Project Info', {
            'fields': ('id', 'name', 'description', 'owner')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class ChildrenInline(admin.TabularInline):
    """Inline editing of child nodes."""
    model = Node
    extra = 1
    fields = ['label', 'status', 'owner']


@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = ['label', 'project', 'status', 'owner', 'parent', 'created_at']
    list_filter = ['status', 'project', 'created_at']
    search_fields = ['label', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [ChildrenInline]

    fieldsets = (
        ('Node Details', {
            'fields': ('id', 'label', 'description', 'project')
        }),
        ('Status & Ownership', {
            'fields': ('status', 'owner')
        }),
        ('Hierarchy', {
            'fields': ('parent',)
        }),
        ('Position', {
            'fields': ('position_x', 'position_y'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Edge)
class EdgeAdmin(admin.ModelAdmin):
    list_display = ['source', 'target', 'project', 'created_at']
    list_filter = ['project', 'created_at']
    search_fields = ['source__label', 'target__label']
    readonly_fields = ['id', 'created_at']


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ['title', 'file_type', 'project', 'uploaded_by', 'created_at']
    list_filter = ['file_type', 'project', 'created_at']
    search_fields = ['title', 'content_preview', 'full_text']
    readonly_fields = ['id', 'created_at']

    fieldsets = (
        ('File Info', {
            'fields': ('id', 'title', 'file', 'file_type', 'project')
        }),
        ('Content', {
            'fields': ('content_preview', 'full_text'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['role', 'node', 'source', 'created_at', 'preview']
    list_filter = ['role', 'source', 'created_at']
    search_fields = ['message', 'node__label']
    readonly_fields = ['id', 'created_at']

    fieldsets = (
        ('Message', {
            'fields': ('id', 'node', 'role', 'message')
        }),
        ('Metadata', {
            'fields': ('source', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    def preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    preview.short_description = 'Preview'
