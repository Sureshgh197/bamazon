from django.urls import path
from . import views, stock_views

app_name = 'products_app'

urlpatterns = [
    # API Endpoints
    # Categories
    path('api/products/category', views.category_list_create, name='category_list_create'),
    path('api/products/category/<int:category_id>', views.category_detail, name='category_detail'),
    
    # Products
    path('api/products/product', views.product_list_create, name='product_list_create'),
    path('api/products/product/<int:product_id>', views.product_detail, name='product_detail'),
    
    # Stock management
    path('api/products/product/<int:product_id>/stock', stock_views.update_stock, name='update_stock'),
]
