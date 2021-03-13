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


class Task(models.Model):
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.title
