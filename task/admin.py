from django.contrib import admin

from .models import Task, Group, Membership

admin.site.register(Task)
admin.site.register(Group)
admin.site.register(Membership)
