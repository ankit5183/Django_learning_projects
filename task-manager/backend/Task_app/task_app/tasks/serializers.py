from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'completed', 'category', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']