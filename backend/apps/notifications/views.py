from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from rest_framework import serializers

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=None,
        responses={200: inline_serializer(name='MarkReadResponse', fields={'status': serializers.CharField()}), 404: None},
        description="Mark a specific notification as read."
    )
    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({"status": "success"}, status=status.HTTP_200_OK)

class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=None,
        responses={200: inline_serializer(name='MarkAllReadResponse', fields={'status': serializers.CharField()})},
        description="Mark all unread notifications as read for the authenticated user."
    )
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "success"}, status=status.HTTP_200_OK)
