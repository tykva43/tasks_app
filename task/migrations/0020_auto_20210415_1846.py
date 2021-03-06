# Generated by Django 3.1.6 on 2021-04-15 11:46

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('task', '0019_auto_20210405_1605'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='commentaire',
            options={'default_related_name': 'commentaires'},
        ),
        migrations.AlterModelOptions(
            name='subtask',
            options={'default_related_name': 'subtasks'},
        ),
        migrations.AlterModelOptions(
            name='task',
            options={'default_related_name': 'tasks'},
        ),
        migrations.AlterModelOptions(
            name='tasklist',
            options={'default_related_name': 'tasklists'},
        ),
        migrations.RemoveField(
            model_name='task',
            name='status',
        ),
        migrations.AlterField(
            model_name='commentaire',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commentaires', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='commentaire',
            name='task',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commentaires', to='task.task'),
        ),
        migrations.AlterField(
            model_name='subtask',
            name='task',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subtasks', to='task.task'),
        ),
        migrations.AlterField(
            model_name='task',
            name='group',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='task.group'),
        ),
        migrations.AlterField(
            model_name='task',
            name='tasklist',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='task.tasklist'),
        ),
        migrations.AlterField(
            model_name='tasklist',
            name='group',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tasklists', to='task.group'),
        ),
    ]
