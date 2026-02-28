from django.contrib import admin
from .models import Cart, CartItem


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'created_at', 'updated_at']
    search_fields = ['user_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart', 'product_id', 'quantity', 'price', 'total']
    list_filter = ['cart']
    search_fields = ['product_id']
    readonly_fields = ['created_at', 'updated_at']
