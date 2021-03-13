from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from .models import Task
from .serializers import TaskSerializer


class TaskView(APIView):

    def get(self, request, task_id=None):
        if not task_id:
            user_id = request.GET.get("user_id", None)
            if not user_id:
                tasks = Task.objects.all()
            else:
                try:
                    tasks = Task.objects.filter(user_id=user_id)
                except Task.DoesNotExist:
                    return Response({}, status.HTTP_400_BAD_REQUEST)
            return Response(TaskSerializer(tasks, many=True).data, status.HTTP_200_OK)
        else:
            user_id = request.GET.get("user_id", None)
            try:
                tasks = Task.objects.filter(id=task_id, user_id=user_id)
            except Task.DoesNotExist:
                return Response({}, status.HTTP_400_BAD_REQUEST)
            else:
                return Response(TaskSerializer(tasks).data, status.HTTP_200_OK)

    def post(self, request):
        task = request.data.get('task')
        serializer = TaskSerializer(data=task)
        if serializer.is_valid(raise_exception=True):
            task_saved = serializer.save()
            return Response({"message": "Task '{}' created successfully".format(task_saved.title)},
                            status.HTTP_201_CREATED)
        return Response({"message": "Task wasn't been saved"}, status.HTTP_400_BAD_REQUEST)

    def put(self, request, task_id):
        data_for_saving = request.data.get('task')
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"message": "Task can't be updated"}, status.HTTP_400_BAD_REQUEST)
        serializer = TaskSerializer(instance=task, data=data_for_saving, partial=True)
        if serializer.is_valid(raise_exception=True):
            task = serializer.save()
            return Response({"message": "Task '{}' updated successfully".format(task.title)}, status.HTTP_200_OK)
        return Response({"message": "Task wasn't been updated"}, status.HTTP_400_BAD_REQUEST)

    def delete(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"message": "Task wasn't been deleted"}, status.HTTP_400_BAD_REQUEST)
        else:
            task.delete()
            return Response({"message": "Task with id `{}` has been deleted.".format(id)}, status.HTTP_200_OK)
