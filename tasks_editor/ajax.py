from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.core.validators import validate_email as django_email_validator
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.utils import timezone
from django.core import serializers

from task.models import User, Task, Subtask
from tasks_editor.forms import TaskForm


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
def update_task_status(request, task_pk):
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
            task = Task.objects.prefetch_related('subtasks').get(id=task_pk, group__users__id=user_id)
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
            subtask.task.subtasks.update(is_completed=status_for_update, completed_at=datetime_now)
    finally:
        return JsonResponse({'is_successful': is_successful})


@login_required
def update_subtask_status(request, subtask_pk):
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
            subtask = Subtask.objects.prefetch_related('task__subtasks', 'task').get(id=subtask_pk,
                                                                                     task__group__users__id=user_id)
        except ObjectDoesNotExist:
            is_successful = False
        else:
            # Updating subtask status value.
            datetime_now = timezone.localtime(timezone.now())
            subtask.is_completed = status_for_update
            subtask.completed_at = datetime_now
            subtask.save(update_fields=["is_completed", "completed_at"])

            # Check if all subtasks is completed - then complete task
            subtasks_count = subtask.task.subtasks.count()
            # Since the data of the used table (subtask.task.subtasks) is not updated,
            # the new status of the current subtask is taken into account here in advance.
            completed_subtasks = 1 if status_for_update else -1
            is_task_completed = subtask.task.is_completed

            # Count the number of completed subtasks
            for s in subtask.task.subtasks.all():
                completed_subtasks += 1 if s.is_completed else 0
            if (is_task_completed and completed_subtasks < subtasks_count) or \
                    (not is_task_completed and completed_subtasks == subtasks_count):
                subtask.task.is_completed = status_for_update
                subtask.task.completed_at = datetime_now
                subtask.task.save(update_fields=["is_completed", "completed_at"])
                is_task_toggled = True

    finally:
        return JsonResponse({'is_successful': is_successful, 'is_task_toggled': is_task_toggled})


def add_task(request, group_pk):
    is_successful = False
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = TaskForm(request.user.id, group_pk, request.POST)
        # check whether it's valid:
        if form.is_valid():
            instance = form.save(commit=False)
            instance.group_id = group_pk
            instance.save()
            is_successful = True
            serialized_task = serializers.serialize('json', [instance])
            print(serialized_task)
            return JsonResponse({'is_successful': is_successful, 'new_task': serialized_task})
        else:
            print(form.errors)
    else:
        ...
    return JsonResponse({'is_successful': is_successful})


def get_task_info_form(request, task_pk):
    user_id = request.user.id
    print(user_id)
    task = Task.objects.get(id=task_pk, group__users__id=user_id)
    print(task)
    task_form = TaskForm(user_id, task)
    print(task_form.as_p)
    return HttpResponse(task_form.renderer)
    # return JsonResponse({'task': 'task'})
