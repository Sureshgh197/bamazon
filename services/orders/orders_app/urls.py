from django.urls import path
from . import views

app_name = 'orders_app'

urlpatterns = [
    path('api/orders/create', views.create_order, name='create_order'),
    path('api/orders/all', views.get_all_orders, name='get_all_orders'),
    path('api/orders/<int:order_id>/cancel', views.cancel_order, name='cancel_order'),
    path('api/orders/<int:order_id>/status', views.update_order_status, name='update_order_status'),
    path('api/orders/<int:order_id>', views.get_order_detail, name='get_order_detail'),
    path('api/orders', views.get_orders, name='get_orders'),
]
