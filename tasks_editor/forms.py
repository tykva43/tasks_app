from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from task.models import Task, Group, TaskList


#class TaskForm(forms.Form):
    #title = forms.CharField(max_length=100, help_text='100 characters max.')
    #content = forms.CharField(max_length=500, help_text='500 characters max.')
    #task_group = forms.ChoiceField()

class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        exclude = ('group', 'user')

#class TaskForm(forms.Form):
#    title = forms.CharField(max_length=100)
#    content = forms.CharField(widget=forms.Textarea)
#    user = forms.IntegerField()


class GroupForm(forms.ModelForm):

    class Meta:
        model = Group
        fields = ('name', 'users', 'type')


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='This field is required')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2',)


class TaskListForm(forms.ModelForm):

    class Meta:
        model = TaskList
        fields = ('title',)
