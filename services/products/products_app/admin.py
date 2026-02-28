from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at', 'updated_at']
    search_fields = ['name']
    ordering = ['-created_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'stock', 'created_at']
    search_fields = ['name', 'category__name']
    list_filter = ['category', 'created_at']
    ordering = ['-created_at']
