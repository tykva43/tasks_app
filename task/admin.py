from django.contrib import admin

from .models import TaskList, Task, Subtask, Group, Membership

admin.site.register(Task)
admin.site.register(Group)
admin.site.register(Membership)
admin.site.register(TaskList)
admin.site.register(Subtask)
