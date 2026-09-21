from django.shortcuts import render, redirect, get_object_or_404
from .models import Task, Category
from .forms import TaskForm
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

@login_required
def home(request):
    query = request.GET.get('q', '')
    tasks = Task.objects.filter(user=request.user).order_by('-created_at')
    categories = Category.objects.all()

    if query:
        tasks = tasks.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query)
        )
    return render(
        request,
        'Home.html',
        {
            'tasks': tasks,
            'categories': categories,
            'query': query
        }
    )
@login_required
def add_task(request):

    if request.method == 'POST':

        form = TaskForm(request.POST)

        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.save()

            return redirect('home')

    else:

        form = TaskForm()

    return render(request, 'AddTask.html', {'form': form})
@login_required
def edit_task(request, task_id):

    task = get_object_or_404(
        Task,
        id=task_id,
        user=request.user
    )

    if request.method == 'POST':

        form = TaskForm(request.POST, instance=task)

        if form.is_valid():
            form.save()

            return redirect('home')

    else:

        form = TaskForm(instance=task)

    return render(request, 'EditTask.html', {'form': form})

@login_required
def delete_task(request, task_id):

    task = get_object_or_404(
        Task,
        id=task_id,
        user=request.user
    )

    if request.method == 'POST':
        task.delete()

    return redirect('home')

@login_required
def toggle_task(request, task_id):

    task = get_object_or_404(
        Task,
        id=task_id,
        user=request.user
    )

    if request.method == 'POST':
        task.completed = not task.completed
        task.save()

    return redirect('home')
@login_required
def category_tasks(request, category_id):
    category = get_object_or_404(Category, id=category_id)

    tasks = Task.objects.filter(
        category=category,
        user=request.user
    ).order_by('-created_at')

    return render(
        request,
        'Home.html',
        {
            'tasks': tasks,
            'selected_category': category
        }
    )


def login_view(request):

    if request.method == 'POST':

        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            login(request, user)
            return redirect('home')

        else:
            return render(
                request,
                'login.html',
                {'error': 'Invalid username or password'}
            )

    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

def register_view(request):

    if request.method == 'POST':

        username = request.POST.get('username')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        if password != confirm_password:
            return render(
                request,
                'register.html',
                {'error': 'Passwords do not match'}
            )

        if User.objects.filter(username=username).exists():
            return render(
                request,
                'register.html',
                {'error': 'Username already exists'}
            )

        User.objects.create_user(
            username=username,
            password=password
        )

        return redirect('login')

    return render(request, 'register.html')