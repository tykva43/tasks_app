"""tasks_app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView, PasswordResetConfirmView
from django.urls import path, include, reverse_lazy
from django.views.generic import RedirectView

from tasks_editor import views
from tasks_editor.views import TasksEditorView, MyPasswordResetView

urlpatterns = [
    # path('tasks/', views.main, name='main'),
    # path('tasks/<int:t_id>/', views.main, name='main'),
    # path('login/', LoginView.as_view(), name='login page'),
    # path('tasks/', views.main, name='main'),
    # path('api/', include('rest_framework.urls', namespace='rest_framework')),
    #

    # path('', include('django.contrib.auth.urls')),
    # path('tasks/', views.view_all_tasks, name='all_tasks'),
    # path('tasks/<int:task_id>/', views.view_chosen_task, name='chosen_task'),
    # path('tasks/add/', views.add, name='add'),
    # path('tasks/{{task.id}}/edit/', views.edit, name='edit'),
    # path('', RedirectView.as_view(url='tasks/')),
    path('tasks/<int:task_pk>/', TasksEditorView.as_view(), name='chosen_task'),
    path('groups/<int:group_pk>/tasks/add/', TasksEditorView.as_view(), name='add_task'),
    # path('tasks/add/<int:group_id>/', TasksEditorView.as_view(), name='add_task'),
    path('tasks/<int:task_pk>/edit/', TasksEditorView.as_view(), name='edit_task'),

    # path('groups/add/', views.add_group, name='add_group'),
    path('groups/', views.GroupView.as_view(), name='list_group'),
    path('group/add/', views.AddGroup.as_view(), name='add_group'),
    path('group/<int:group_pk>/', views.DetailGroup.as_view(), name='detail_group'),
    path('group/update', views.UpdateGroup.as_view(), name='update_group'),
    path('group/<int:group_pk>/delete/', views.DeleteGroup.as_view(), name='delete_group'),
    # path('groups/updating/', views, name='update_group'),

    path('group/<int:group_pk>/tasklist/add/', views.CreateTaskList.as_view(), name='add_tasklist'),
    path('group/<int:group_pk>/tasklist/<int:tasklist_pk>/', views.DetailTaskList.as_view(), name='detail_tasklist'),

    path('admin/', admin.site.urls),
    path('profile/', views.user_profile, name='user_profile'),
    path('registration/', views.registration, name='registration'),
    path('login/', LoginView.as_view(redirect_authenticated_user=True, success_url=reverse_lazy('list_group')), name='login'),
    path('logout/', LogoutView.as_view(template_name="registration/logout.html"), name='logout'),

    path('password_reset/', MyPasswordResetView.as_view(template_name="registration/password_reset.html"),
         name='password_reset'),
    path('password_reset/done/', views.password_reset_done, name='password_reset_done'),
    path('password_reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password_reset/complete/', views.password_reset_complete, name='password_reset_complete'),

    path('api/', include('task.urls')),
]
