from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Task, Category
from .serializers import TaskSerializer
from .forms import TaskForm


# =========================
# WEB VIEWS
# =========================

@login_required
def home(request):
    query = request.GET.get('q', '')

    tasks = Task.objects.filter(
        user=request.user
    ).order_by('-created_at')

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

    return render(
        request,
        'AddTask.html',
        {'form': form}
    )


@login_required
def edit_task(request, task_id):
    task = get_object_or_404(
        Task,
        id=task_id,
        user=request.user
    )

    if request.method == 'POST':
        form = TaskForm(
            request.POST,
            instance=task
        )

        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = TaskForm(instance=task)

    return render(
        request,
        'EditTask.html',
        {'form': form}
    )


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
    category = get_object_or_404(
        Category,
        id=category_id
    )

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


# =========================
# AUTHENTICATION
# =========================

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

        return render(
            request,
            'login.html',
            {
                'error': 'Invalid username or password'
            }
        )

    return render(request, 'login.html')


@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {
                'error': 'Username and password are required'
            },
            status=400
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {
                'error': 'Username already exists'
            },
            status=400
        )

    User.objects.create_user(
        username=username,
        password=password
    )

    return Response(
        {
            'message': 'Registration successful'
        },
        status=201
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is not None:
        login(request, user)

        return Response({
            'message': 'Login successful',
            'username': user.username
        })

    return Response(
        {
            'error': 'Invalid username or password'
        },
        status=400
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    logout(request)

    return Response({
        'message': 'Logout successful'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_api(request):
    return Response({
        'csrfToken': get_token(request)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_api(request):
    return Response({
        'username': request.user.username
    })


# =========================
# TASK API
# =========================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_api(request):

    if request.method == 'GET':
        tasks = Task.objects.filter(
            user=request.user
        ).order_by('-created_at')

        serializer = TaskSerializer(
            tasks,
            many=True
        )

        return Response(serializer.data)

    serializer = TaskSerializer(
        data=request.data
    )

    if serializer.is_valid():
        serializer.save(
            user=request.user
        )

        return Response(
            serializer.data,
            status=201
        )

    return Response(
        serializer.errors,
        status=400
    )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def task_update_api(request, pk):
    task = get_object_or_404(
        Task,
        pk=pk,
        user=request.user
    )

    serializer = TaskSerializer(
        task,
        data=request.data,
        partial=(request.method == 'PATCH')
    )

    if serializer.is_valid():
        serializer.save()

        return Response(
            serializer.data
        )

    return Response(
        serializer.errors,
        status=400
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def task_delete_api(request, pk):
    task = get_object_or_404(
        Task,
        pk=pk,
        user=request.user
    )

    task.delete()

    return Response(
        {
            'message': 'Task deleted successfully'
        },
        status=200
    )
