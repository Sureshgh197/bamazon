import requests
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Order, OrderItem
from .serializers import OrderSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create order from cart with stock verification"""
    try:
        # Get cart items
        cart_response = requests.get(
            f'{settings.CART_SERVICE_URL}/api/cart',
            headers={'Authorization': request.headers.get('Authorization')},
            timeout=5
        )
        
        if cart_response.status_code != 200:
            return Response({'error': 'Failed to fetch cart'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_items = cart_response.json().get('items', [])
        
        if not cart_items:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify stock and get product details
        order_items_data = []
        products_stock = {}
        
        for item in cart_items:
            product_response = requests.get(
                f'{settings.PRODUCTS_SERVICE_URL}/api/products/product/{item["product_id"]}',
                timeout=5
            )
            
            if product_response.status_code != 200:
                return Response(
                    {'error': f'Product {item["product_id"]} not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product = product_response.json()
            products_stock[item['product_id']] = product['stock']
            
            # Check stock
            if product['stock'] < item['quantity']:
                return Response(
                    {'error': f'{product["name"]} has insufficient stock. Available: {product["stock"]}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order_items_data.append({
                'product_id': item['product_id'],
                'product_name': product['name'],
                'quantity': item['quantity'],
                'price': float(item['price']),
            })
        
        # Calculate totals
        subtotal = sum(item['price'] * item['quantity'] for item in order_items_data)
        tax = subtotal * 0.10
        total = subtotal + tax
        
        # Create order
        order = Order.objects.create(
            user_id=request.user.id,
            total_amount=total,
            tax_amount=tax,
            delivery_name=request.data.get('delivery_name', ''),
            delivery_phone=request.data.get('delivery_phone', ''),
            delivery_address=request.data.get('delivery_address', ''),
            delivery_city=request.data.get('delivery_city', ''),
            delivery_state=request.data.get('delivery_state', ''),
            delivery_postal_code=request.data.get('delivery_postal_code', ''),
            delivery_country=request.data.get('delivery_country', 'India'),
            delivery_latitude=request.data.get('delivery_latitude'),
            delivery_longitude=request.data.get('delivery_longitude'),
            payment_method=request.data.get('payment_method', 'COD')
        )
        
        # Create order items and update product stock
        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)
            
            # Update product stock using dedicated endpoint
            new_stock = products_stock[item_data['product_id']] - item_data['quantity']
            stock_response = requests.put(
                f'{settings.PRODUCTS_SERVICE_URL}/api/products/product/{item_data["product_id"]}/stock',
                json={'stock': new_stock},
                headers={'Authorization': request.headers.get('Authorization')},
                timeout=5
            )
            
            if stock_response.status_code not in [200, 201]:
                # Log error but don't fail the order
                print(f'Failed to update stock for product {item_data["product_id"]}: {stock_response.text}')
        
        # Clear cart
        requests.delete(
            f'{settings.CART_SERVICE_URL}/api/cart/clear',
            headers={'Authorization': request.headers.get('Authorization')},
            timeout=5
        )
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """Get user's orders"""
    orders = Order.objects.filter(user_id=request.user.id)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, order_id):
    """Get order details"""
    try:
        order = Order.objects.get(id=order_id, user_id=request.user.id)
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """Cancel order"""
    try:
        order = Order.objects.get(id=order_id, user_id=request.user.id)
        
        if order.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Order cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Restore stock for cancelled order
        for item in order.items.all():
            product_response = requests.get(
                f'{settings.PRODUCTS_SERVICE_URL}/api/products/product/{item.product_id}',
                timeout=5
            )
            
            if product_response.status_code == 200:
                product = product_response.json()
                new_stock = product['stock'] + item.quantity
                requests.put(
                    f'{settings.PRODUCTS_SERVICE_URL}/api/products/product/{item.product_id}/stock',
                    json={'stock': new_stock},
                    headers={'Authorization': request.headers.get('Authorization')},
                    timeout=5
                )
        
        order.status = 'cancelled'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_orders(request):
    """Get all orders (admin only)"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """Update order status (admin only)"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        old_status = order.status
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If changing to cancelled, restore stock
        if new_status == 'cancelled' and old_status != 'cancelled':
            for item in order.items.all():
                product_response = requests.get(
                    f'{settings.PRODUCTS_SERVICE_URL}/api/products/product/{item.product_id}',
                    timeout=5
                )
                
                if product_response.status_code == 200:
                    product = product_response.json()
                    new_stock = product['stock'] + item.quantity
                    requests.put(
                        f'{settings.PRODUCTS_SERVICE_URL}/api/products/product/{item.product_id}/stock',
                        json={'stock': new_stock},
                        headers={'Authorization': request.headers.get('Authorization')},
                        timeout=5
                    )
        
        order.status = new_status
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
