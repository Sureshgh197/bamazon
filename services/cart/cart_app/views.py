from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """Get user's cart"""
    cart, created = Cart.objects.get_or_create(user_id=request.user.id)
    serializer = CartSerializer(cart)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """Add item to cart"""
    cart, created = Cart.objects.get_or_create(user_id=request.user.id)
    
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    price = request.data.get('price')
    
    if not product_id or not price:
        return Response(
            {'error': 'product_id and price are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product_id=product_id,
        defaults={'quantity': quantity, 'price': price}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """Update cart item quantity"""
    try:
        cart = Cart.objects.get(user_id=request.user.id)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    quantity = request.data.get('quantity')
    if quantity is None or quantity < 1:
        return Response(
            {'error': 'Valid quantity is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    cart_item.quantity = quantity
    cart_item.save()
    
    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    """Remove item from cart"""
    try:
        cart = Cart.objects.get(user_id=request.user.id)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.delete()
        return Response(
            {'message': 'Item removed from cart'},
            status=status.HTTP_204_NO_CONTENT
        )
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """Clear all items from cart"""
    try:
        cart = Cart.objects.get(user_id=request.user.id)
        cart.items.all().delete()
        return Response(
            {'message': 'Cart cleared'},
            status=status.HTTP_204_NO_CONTENT
        )
    except Cart.DoesNotExist:
        return Response(
            {'message': 'Cart is already empty'},
            status=status.HTTP_200_OK
        )
