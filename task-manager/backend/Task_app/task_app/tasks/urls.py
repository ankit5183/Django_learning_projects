from django.urls import path
from . import views


urlpatterns = [

    path('', views.home, name='home'),
    path('api/csrf/', views.csrf_api),
    path('api/login/', views.login_api),
    path('login/', views.login_view, name='login'),
    path('api/logout/', views.logout_api, name='logout'),
    path('api/register/', views.register_api, name='register'),
    path('add-task/', views.add_task, name='add_task'),

    path('edit-task/<int:task_id>/', views.edit_task, name='edit_task'),

    path('delete-task/<int:task_id>/', views.delete_task, name='delete_task'),

    path('toggle-task/<int:task_id>/', views.toggle_task, name='toggle_task'),

    path(
        'category/<int:category_id>/',
        views.category_tasks,
        name='category_tasks'
    ),
    path(
        'api/current-user/',
        views.current_user_api
    ),
    path('api/tasks/', views.task_list_api),
    path('api/tasks/<int:pk>/', views.task_update_api),
    path('api/tasks/<int:pk>/delete/', views.task_delete_api),
]