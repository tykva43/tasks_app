from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.auth.views import PasswordResetView
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy, reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.generic import ListView, CreateView, DetailView, UpdateView, DeleteView
from django.core import serializers

from task.models import Group, TaskList, User
from .forms import RegistrationForm, GroupForm, TaskListForm, TaskForm

HOST_ADDRESS = "192.168.0.102:8080"


def redirect_main(request):
    return HttpResponseRedirect(reverse('list_group'))


class RegistrationView(UserPassesTestMixin, CreateView):
    model = User
    template_name = 'registration/registration.html'
    form_class = RegistrationForm
    success_url = reverse_lazy('login')

    def test_func(self):
        return self.request.user.is_anonymous

    def form_valid(self, form):
        valid = super().form_valid(form)
        return valid


@login_required
def user_profile(request):
    # todo: use user_profile template
    user = get_object_or_404(User, id=request.user.id)
    return JsonResponse({'user': serializers.serialize('json', [user], fields=('username', 'first_name', 'last_name',
                                                                               'email'))})


# ******** Groups ********
@method_decorator(login_required, name='dispatch')
class AddGroup(CreateView):
    form_class = GroupForm
    template_name = 'group/add_group.html'

    def get_success_url(self, **kwargs):
        if kwargs is not None:
            return reverse_lazy('detail_group', kwargs={'group_pk': self.object.id})


@method_decorator(login_required, name='dispatch')
class DetailGroup(DetailView):
    model = Group
    template_name = 'group/detail_group.html'
    context_object_name = "group"

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Tasklists'
        group_pk = self.kwargs.get('group_pk')
        context['task_form'] = TaskForm(user=self.request.user.id, group=group_pk)
        context['tasklists'] = TaskList.objects.filter(group_id=group_pk).prefetch_related('tasks'). \
            prefetch_related('tasks__subtasks')
        return context

    def get_object(self):
        return get_object_or_404(self.model, pk=self.kwargs['group_pk'], users=self.request.user.id)


@method_decorator(login_required, name='dispatch')
class UpdateGroup(UpdateView):
    model = Group


@method_decorator(login_required, name='dispatch')
class DeleteGroup(DeleteView):
    model = Group
    success_url = reverse_lazy('')


@method_decorator(login_required, name='dispatch')
class GroupView(ListView):
    model = Group
    template_name = "group/groups.html"
    context_object_name = "groups"

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Your Groups'
        return context

    def get_queryset(self):
        return Group.objects.filter(users=self.request.user.id)


# ********* Password Reset *********
class MyPasswordResetView(PasswordResetView):
    redirect_to = '/'

    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        if self.request.user.is_authenticated:
            return HttpResponseRedirect(self.redirect_to)
        return super().dispatch(*args, **kwargs)


def password_reset_done(request):
    return render(request, "registration/password_reset_done.html")


def password_reset_confirm(request):
    return render(request, "registration/password_reset_confirm.html")


def password_reset_complete(request):
    return render(request, "registration/password_reset_complete.html")


# ********* TaskList *********
@method_decorator(login_required, name='dispatch')
class CreateTaskList(CreateView):
    form_class = TaskListForm
    template_name = 'tasklist/add_tasklist.html'
    context_object_name = "tasklist"

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Tasklist Creation'
        context['group_pk'] = self.kwargs['group_pk']
        return context

    def form_valid(self, form):
        self.object = form.save(commit=False)
        group = Group.objects.get(id=self.kwargs['group_pk'])
        form.instance.group = group
        self.object.save()
        return super(CreateTaskList, self).form_valid(form)

    def get_success_url(self, **kwargs):
        if kwargs is not None:
            return reverse_lazy('detail_tasklist',
                                kwargs={'group_pk': self.kwargs['group_pk'], 'tasklist_pk': self.object.id})


@method_decorator(login_required, name='dispatch')
class DetailTaskList(DetailView):
    model = TaskList
    template_name = 'tasklist/detail_tasklist.html'
    context_object_name = "tasklist"
    extra_context = {'title': 'TaskList'}

    def get_object(self):
        return get_object_or_404(self.model, pk=self.kwargs['tasklist_pk'], group=self.kwargs['group_pk'],
                                 group__users__id=self.request.user.id)
