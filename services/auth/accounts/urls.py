from django.urls import path
from . import views

urlpatterns = [
    # Template views
    path('', views.index, name='index'),
    path('login/', views.login_page, name='login'),
    path('register/', views.register_page, name='register'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('products/', views.products_page, name='products'),
    path('products/manage/', views.manage_products_page, name='manage_products'),
    path('cart/', views.cart_page, name='cart'),
    path('checkout/', views.checkout_page, name='checkout'),
    path('orders/', views.orders_page, name='orders'),
    path('orders/manage/', views.manage_orders_page, name='manage_orders'),
    
    # API endpoints - Auth
    path('api/auth/register/', views.register, name='api_register'),
    path('api/auth/login/', views.login, name='api_login'),
    path('api/auth/logout/', views.logout, name='api_logout'),
    path('api/auth/profile/', views.user_profile, name='api_user_profile'),
    path('api/auth/profile/update/', views.update_profile, name='api_update_profile'),
    path('api/users/<int:user_id>/', views.get_user_by_id, name='api_get_user'),
]
