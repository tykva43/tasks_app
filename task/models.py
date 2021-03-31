from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse


class Group(models.Model):
    GROUP_TYPES = (
        ('pub', 'Public Group'),
        ('pri', 'Private Group')
    )
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=3, choices=GROUP_TYPES)
    users = models.ManyToManyField(User, through='Membership')
    icon_color = models.CharField(max_length=7, default='#9E579D')

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('group_detail', kwargs={'pk': self.pk})


class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)


class TaskList(models.Model):
    title = models.CharField(max_length=100)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True)       # todo: null=false


class Task(models.Model):
    NOTIFICATION_TYPES = (
        ('no', 'Don\'t remind me'),
        ('before', 'Remind me in advance'),
        ('on_time', 'Remind me on time')
    )
    PRIORITIES = (
        ('no', 'No priority'),
        ('high', 'High priority'),
        ('medium', 'Medium priority'),
        ('low', 'Low priority')
    )

    title = models.CharField(max_length=100)
    description = models.CharField(max_length=300, null=True)
    deadline = models.DateTimeField(null=True)
    notification = models.CharField(max_length=7, choices=NOTIFICATION_TYPES, default='no')
    priority = models.CharField(max_length=6, choices=PRIORITIES, default='no')
    is_favorite = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)

    tasklist = models.ForeignKey('TaskList', on_delete=models.CASCADE, null=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Subtask(models.Model):
    title = models.CharField(max_length=100)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
