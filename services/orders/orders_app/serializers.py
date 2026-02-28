from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'price', 'subtotal']
        read_only_fields = ['subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'total_amount', 'tax_amount', 
                  'delivery_name', 'delivery_phone', 'delivery_address', 'delivery_city',
                  'delivery_state', 'delivery_postal_code', 'delivery_country',
                  'delivery_latitude', 'delivery_longitude',
                  'payment_method', 'created_at', 'updated_at', 'items']
        read_only_fields = ['order_number', 'created_at', 'updated_at']
