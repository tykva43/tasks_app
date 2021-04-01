import requests
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import PasswordResetView
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.generic import ListView, CreateView, DetailView, UpdateView, DeleteView
from rest_framework.views import APIView

from task.models import Task, Group, TaskList
from .forms import TaskForm, RegistrationForm, GroupForm, TaskListForm

HOST_ADDRESS = "192.168.0.102:8080"


@method_decorator(login_required, name='dispatch')
class TasksEditorView(APIView):

    def post(self, request, group_id):
        task_form = TaskForm(request.POST)
        if task_form.is_valid():
            task = task_form.save(commit=False)
            task.user_id = request.user.id
            task.group_id = group_id
            task.save()
        tasks = Task.objects.filter(user_id=request.user.id)            #!!! Обращение к модели
        return render(request, "add.html", context={"tasks": tasks, "form": TaskForm()})

    def get(self, request, task_id=None, group_id=None):
        context = {}
        template = ""
        if task_id:
            response = requests.get('http://{}/api/tasks/{}/?user_id={}'.format(HOST_ADDRESS, str(task_id),
                                                                                str(request.user.id)))
            chosen_task = response.json()
            response = requests.get('http://{}/api/tasks/?user_id={}'.format(HOST_ADDRESS, str(request.user.id)))
            all_tasks = response.json()
            template = "groups.html"
            context = {"tasks": all_tasks, "chosen_task": chosen_task}
        else:
            private_groups = Group.objects.filter(users__id=request.user.id, type="pri")        #!!! Обращение к модели
            public_groups = Group.objects.filter(users__id=request.user.id, type="pub")
            tasks = Task.objects.filter(user_id=request.user.id)
            template = "groups.html"
            context = {"tasks": tasks, "private_groups": private_groups, "public_groups": public_groups}
        if group_id:
            response = requests.get('http://{}/api/tasks/?user_id={}'.format(HOST_ADDRESS, str(request.user.id)))
            tasks = response.json()
            template = "add.html"
            context = {"tasks": tasks, "form": TaskForm()}
        print(template)
        print(context)
        return render(request, "groups.html", context=context)

    def put(self, request, task_id):
        response = requests.put('http://{}/api/tasks/{}/'.format(HOST_ADDRESS, str(task_id)), request)
        # todo: send put data
        return JsonResponse(data=response.GET.get('message'), status=response.status_code)

    def delete(self, request, task_id):
        response = requests.delete('http://{}/api/tasks/{}/'.format(HOST_ADDRESS, str(task_id)))
        return JsonResponse(data=response.GET.get('message'), status=response.status_code)


# @login_required
# def view_all_tasks(request):
#     private_groups = Group.objects.filter(users__id=request.user.id, type="pri")
#     public_groups = Group.objects.filter(users__id=request.user.id, type="pub")
#     tasks = Task.objects.filter(user_id=request.user.id)
#     return render(request, "main.html", context={"tasks": tasks, "tasks_count": len(tasks),
#                   "private_groups": private_groups, "public_groups": public_groups})


# @login_required     # DELETE, PUT, GET
# def view_chosen_task(request, task_id):
#     if 'DELETE' in request.method:
#         response = requests.delete('http://{}/api/tasks/{}/'.format(HOST_ADDRESS, str(task_id)))
#         return JsonResponse(data=response.GET.get('message'), status=response.status_code)
# elif 'PUT' in request.method:
#     response = requests.put('http://{}/api/tasks/{}/'.format(HOST_ADDRESS, str(task_id)), request)
#     ...

# elif 'GET' in request.method:
#     response = requests.get('http://{}/api/tasks/{}/'.format(HOST_ADDRESS, str(task_id)))
#     chosen_task = response.json()
#     response = requests.get('http://{}/api/tasks/?user_id={}'.format(HOST_ADDRESS, str(request.user.id)))
#     all_tasks = response.json()
#     # return JsonResponse(data={"chosen_task": chosen_task})
#     return render(request, "main.html", context={"tasks": all_tasks, "tasks_count": len(all_tasks),
#                                                  "chosen_task": chosen_task})


# @login_required
# def add(request, group_id=None):
#     task_form = TaskForm(request.POST)
#     if 'POST' in request.method:
#         if task_form.is_valid():
#             task = task_form.save(commit=False)
#             task.user_id = request.user.id
#             if group_id:
#                 task.group_id = group_id
#             task.save()
#     tasks = Task.objects.filter(user_id=request.user.id)
#     return render(request, "add.html", context={"tasks": tasks, "tasks_count": len(tasks), "form": TaskForm()})

#
# @login_required
# def edit(request):
#     ...


def registration(request):
    if request.user.is_authenticated and request.user.is_active:
        return HttpResponseRedirect(reverse_lazy('list_group'))
    else:
        context = {}
        if request.method == 'POST':
            form = RegistrationForm(request.POST)
            if form.is_valid():
                form.save()
                context['form'] = RegistrationForm()
                context['info'] = "You successfully registered."
                return render(request, 'registration/registration.html', context=context)
            else:
                context['form'] = form
                context['warning'] = "Incorrect data. Please fill in registration form with correct data."
                return render(request, 'registration/registration.html', context=context)
        else:
            context['form'] = RegistrationForm()
            return render(request, 'registration/registration.html', context=context)


def login(request):
    ...


@login_required
def user_profile(request):
    ...


# ******** Groups ********
@method_decorator(login_required, name='dispatch')
class AddGroup(CreateView):
    form_class = GroupForm
    template_name = 'group/add_group.html'

    def get_success_url(self, **kwargs):
        if kwargs is not None:
            return reverse_lazy('detail_group', kwargs={'group_pk': self.object.id})
    # success_url = reverse_lazy('detail_group', kwargs={'pk': self.appointment_id})

    # def get_context_data(self, *, object_list=None, **kwargs):
    #     context = super().get_context_data(**kwargs)
    #     context['title'] = 'Group Creation'
    #     return context


# Страница с подробностями конкретной группы
@method_decorator(login_required, name='dispatch')
class DetailGroup(DetailView):
    model = Group
    template_name = 'group/detail_group.html'
    context_object_name = "group"

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Your Groups'
    # !!! Обращение к модели
        context['tasklists'] = TaskList.objects.filter(id=self.kwargs['group_pk'], users__id=self.request.user.id)
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
    template_name = "groups.html"
    context_object_name = "groups"

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Your Groups'
        return context

    def get_queryset(self):
        return Group.objects.filter(users=self.request.user.id)  #!!! Обращение к модели


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
        print(context)
        context['title'] = 'Tasklist Creation'
        context['group_pk'] = self.kwargs['group_pk']
        return context

    def form_valid(self, form):
        self.object = form.save(commit=False)
        group = Group.objects.get(id=self.kwargs['group_pk'])           #!!! Обращение к модели
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
