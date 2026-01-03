"""
URL configuration for DevBrain backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api.views import (
    ProjectViewSet, NodeViewSet, EdgeViewSet,
    KnowledgeBaseViewSet, ChatViewSet,
    ChatNodeView, SearchKnowledgeView
)

# REST Framework router for viewsets
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'nodes', NodeViewSet, basename='node')
router.register(r'edges', EdgeViewSet, basename='edge')
router.register(r'knowledge', KnowledgeBaseViewSet, basename='knowledge')
router.register(r'chat-history', ChatViewSet, basename='chat')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Special endpoints
    path('api/chat/node/<str:node_id>/', ChatNodeView.as_view(), name='chat-node'),
    path('api/search/knowledge/', SearchKnowledgeView.as_view(), name='search-knowledge'),
    
    # API Auth (optional - for token-based auth)
    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
