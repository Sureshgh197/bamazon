from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie

from .serializers import UserSerializer, UserRegistrationSerializer, LoginSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    User registration endpoint
    POST /api/auth/register/
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'token': token.key,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    User login endpoint
    POST /api/auth/login/
    Requires: username, password
    Returns: user data and authentication token
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'token': token.key,
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    User logout endpoint
    POST /api/auth/logout/
    Requires: Authentication token in header
    """
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    GET /api/auth/profile/
    Requires: Authentication token in header
    """
    serializer = UserSerializer(request.user)
    return Response({
        'user': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update current user profile
    PUT /api/auth/profile/
    Requires: Authentication token in header
    """
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    """
    Get user details by ID (admin or self)
    GET /api/users/<user_id>/
    """
    if not request.user.is_staff and request.user.id != user_id:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# Template Views
@require_http_methods(["GET"])
def index(request):
    """Home page"""
    return render(request, 'index.html')


@ensure_csrf_cookie
@require_http_methods(["GET"])
def login_page(request):
    """Login page"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'login.html')


@require_http_methods(["GET"])
def register_page(request):
    """Register page"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'register.html')


@require_http_methods(["GET"])
def dashboard(request):
    """Dashboard page"""
    return render(request, 'dashboard.html')


# ==================== PRODUCT PAGE VIEWS ====================

@require_http_methods(["GET"])
def products_page(request):
    """Browse products page"""
    return render(request, 'products.html')


@require_http_methods(["GET"])
def manage_products_page(request):
    """Manage products page (admin only)"""
    return render(request, 'manage.html')


@require_http_methods(["GET"])
def cart_page(request):
    """Shopping cart page"""
    return render(request, 'cart.html')


@require_http_methods(["GET"])
def orders_page(request):
    """Orders page"""
    return render(request, 'orders.html')


@require_http_methods(["GET"])
def manage_orders_page(request):
    """Manage orders page (admin only)"""
    return render(request, 'manage_orders.html')


@require_http_methods(["GET"])
def checkout_page(request):
    """Checkout page"""
    return render(request, 'checkout.html')
