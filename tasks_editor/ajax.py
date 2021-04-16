from django.contrib.auth.decorators import login_required
from django.db.models.functions import datetime
from django.http import JsonResponse
from django.core.validators import validate_email as django_email_validator
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.utils import timezone

from task.models import User, Task, Subtask


def validate_username(request):
    """Check username availability"""
    username = request.GET.get('username', None)

    response = {  # !!! Обращение к модели
        'is_valid': not User.objects.filter(username=username).exists() and len(username) > 0
    }
    return JsonResponse(response)


def is_email_valid(email):
    """Helper function that uses default django email validator"""
    try:
        django_email_validator(email)
        return True
    except ValidationError:
        return False


def validate_email(request):
    """Check email availability"""
    email = request.GET.get('email', None)

    response = {  # !!! Обращение к модели
        'is_valid': not User.objects.filter(email=email).exists() and is_email_valid(email)
    }
    return JsonResponse(response)


@login_required
def update_task_status(request, pk):
    """Update task status"""
    user_id = request.user.id
    is_successful = True
    try:
        status_for_update = request.POST.get('status') == 'true'
    except KeyError:
        is_successful = False
    else:
        # Updating the status of a task and the statuses of related subtasks.
        try:
            task = Task.objects.prefetch_related('subtasks').get(id=pk, group__users__id=user_id)
        except ObjectDoesNotExist:
            is_successful = False
        else:
            # Updating task status and datetime of completing.
            datetime_now = timezone.localtime(timezone.now())
            task.is_completed = status_for_update
            task.completed_at = datetime_now
            task.save(update_fields=["is_completed", "completed_at"])

            # Updating the statuses of related subtasks if task marked as completed.
            for subtask in task.subtasks.all():
                subtask.is_completed = status_for_update
                subtask.completed_at = datetime_now
            Subtask.objects.bulk_update(task.subtasks, ["is_completed", "completed_at"])
    finally:
        return JsonResponse({'is_successful': is_successful})


@login_required
def update_subtask_status(request, pk):
    """Update subtask status"""
    user_id = request.user.id
    is_successful = True
    is_task_toggled = False
    try:
        status_for_update = request.POST.get('status') == 'true'
    except KeyError:
        is_successful = False
    else:
        # Updating the status of a task and the statuses of related subtasks.
        try:
            subtask = Subtask.objects.get(id=pk, task__group__users__id=user_id)
        except ObjectDoesNotExist:
            is_successful = False
        else:
            # print(subtask)
            # Updating subtask status value.
            datetime_now = timezone.localtime(timezone.now())

            subtask.is_completed = status_for_update
            subtask.completed_at = datetime_now
            subtask.save(update_fields=["is_completed", "completed_at"])

            # todo: check if all subtasks is completed - then complete task
            # for subtask in subtask.task.subtasks.all():
            #     print(subtask.id)
            #     print(subtask.is_completed)
            # Subtask.objects.bulk_update(task.subtasks, ["is_completed", "completed_at"])

    finally:
        return JsonResponse({'is_successful': is_successful, 'is_task_toggled': is_task_toggled})
