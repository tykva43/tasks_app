# Generated by Django 3.1.6 on 2021-03-18 09:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('task', '0004_auto_20210312_0736'),
    ]

    operations = [
        migrations.RenameField(
            model_name='task',
            old_name='content',
            new_name='desription',
        ),
    ]
