from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Product

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_stock(request, product_id):
    """Update product stock (for order service)"""
    try:
        product = Product.objects.get(id=product_id)
        new_stock = request.data.get('stock')
        
        if new_stock is None:
            return Response({'error': 'Stock value required'}, status=status.HTTP_400_BAD_REQUEST)
        
        product.stock = new_stock
        product.save()
        
        return Response({'message': 'Stock updated', 'stock': product.stock}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
