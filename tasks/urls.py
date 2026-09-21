from django.urls import path
from . import views


urlpatterns = [

    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('add-task/', views.add_task, name='add_task'),

    path('edit-task/<int:task_id>/', views.edit_task, name='edit_task'),

    path('delete-task/<int:task_id>/', views.delete_task, name='delete_task'),

    path('toggle-task/<int:task_id>/', views.toggle_task, name='toggle_task'),

    path(
        'category/<int:category_id>/',
        views.category_tasks,
        name='category_tasks'
    ),
]