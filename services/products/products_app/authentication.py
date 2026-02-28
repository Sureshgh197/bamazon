import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class RemoteUser:
    def __init__(self, data):
        self.id = data['id']
        self.username = data['username']
        self.email = data['email']
        self.is_staff = data.get('is_staff', False)
        self.is_superuser = data.get('is_superuser', False)
        self.is_authenticated = True
        self.is_active = True


class RemoteTokenAuthentication(TokenAuthentication):
    """Authenticate against auth service using token with caching"""
    
    def authenticate_credentials(self, key):
        cache_key = f'auth_token_{key}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return (RemoteUser(cached_data), key)
        
        try:
            response = requests.get(
                f'{settings.AUTH_SERVICE_URL}/api/auth/profile/',
                headers={'Authorization': f'Token {key}'},
                timeout=2
            )
            
            if response.status_code == 200:
                user_data = response.json()['user']
                cache.set(cache_key, user_data, 300)
                return (RemoteUser(user_data), key)
            else:
                raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
