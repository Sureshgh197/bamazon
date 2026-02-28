from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductDetailSerializer


def is_admin(user):
    """Check if user is an admin"""
    return user.is_staff or user.is_superuser


# ==================== CATEGORY ENDPOINTS ====================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def category_list_create(request):
    """
    GET: List all categories (public)
    POST: Create a new category (admin only)
    """
    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if admin
        if not is_admin(request.user):
            return Response(
                {'error': 'You do not have permission to create categories.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def category_detail(request, category_id):
    """
    GET: Retrieve a specific category
    PUT: Update a category (admin only)
    DELETE: Delete a category (admin only)
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response(
            {'error': 'Category not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if admin
        if not is_admin(request.user):
            return Response(
                {'error': 'You do not have permission to update categories.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if admin
        if not is_admin(request.user):
            return Response(
                {'error': 'You do not have permission to delete categories.'},
                status=status.HTTP_403_FORBIDDEN
            )

        category.delete()
        return Response(
            {'message': 'Category deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )


# ==================== PRODUCT ENDPOINTS ====================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def product_list_create(request):
    """
    GET: List all products with optional category filter
    POST: Create a new product (admin only)
    Query params: category_id (optional)
    """
    if request.method == 'GET':
        category_id = request.query_params.get('category_id', None)
        
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
                products = Product.objects.filter(category=category)
            except Category.DoesNotExist:
                return Response(
                    {'error': 'Category not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            products = Product.objects.all()

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if admin
        if not is_admin(request.user):
            return Response(
                {'error': 'You do not have permission to create products.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def product_detail(request, product_id):
    """
    GET: Retrieve a specific product
    PUT: Update a product (admin only)
    DELETE: Delete a product (admin only)
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if admin
        if not is_admin(request.user):
            return Response(
                {'error': 'You do not have permission to update products.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if admin
        if not is_admin(request.user):
            return Response(
                {'error': 'You do not have permission to delete products.'},
                status=status.HTTP_403_FORBIDDEN
            )

        product.delete()
        return Response(
            {'message': 'Product deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
