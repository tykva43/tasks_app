from rest_framework import serializers

from .models import Task, User, Group


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name', 'type', 'users')


class UserSerializer(serializers.ModelSerializer):
    # groups = GroupSerializer(many=True, read_only=True, source='groups')

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')

