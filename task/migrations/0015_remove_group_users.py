# Generated by Django 3.1.6 on 2021-04-01 18:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('task', '0014_auto_20210402_0055'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='group',
            name='users',
        ),
    ]
