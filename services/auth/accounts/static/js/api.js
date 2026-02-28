// API Configuration - loaded from config.js

// Helper function to get access token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to set access token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Helper function to remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return getToken() !== null;
}

// Generic API call function
async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = false, baseUrl = API_BASE_URL) {
    const url = `${baseUrl}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (requiresAuth) {
        const token = getToken();
        if (token && token.trim()) {
            options.headers['Authorization'] = `Token ${token.trim()}`;
        }
    }

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return {
            status: response.status,
            success: response.ok,
            data: result
        };
    } catch (error) {
        return {
            status: 0,
            success: false,
            data: { error: error.message }
        };
    }
}

// Register API
async function register(username, email, password, password2, firstName, lastName) {
    return apiCall('/api/auth/register/', 'POST', {
        username: username,
        email: email,
        password: password,
        password2: password2,
        first_name: firstName,
        last_name: lastName
    });
}

// Login API
async function login(username, password) {
    return apiCall('/api/auth/login/', 'POST', {
        username: username,
        password: password
    });
}

// Logout API
async function logout() {
    return apiCall('/api/auth/logout/', 'POST', {}, true);
}

// Get user profile
async function getUserProfile() {
    return apiCall('/api/auth/profile/', 'GET', null, true);
}

// Update user profile
async function updateProfile(data) {
    return apiCall('/api/auth/profile/update/', 'PUT', data, true);
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Show success message
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Redirect to dashboard
function goToDashboard() {
    setTimeout(() => {
        window.location.href = '/dashboard/';
    }, 1500);
}

// Redirect to login
function goToLogin() {
    setTimeout(() => {
        window.location.href = '/login/';
    }, 1500);
}

// Redirect to home
function goToHome() {
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// ==================== PRODUCT API FUNCTIONS ====================

const AUTH_TOKEN = getToken();

// Categories API
async function getCategories() {
    const response = await apiCall('/api/products/category', 'GET', null, false, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to load categories'
    };
}

async function createCategory(data) {
    const response = await apiCall('/api/products/category', 'POST', data, true, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to create category'
    };
}

async function updateCategory(categoryId, data) {
    const response = await apiCall(`/api/products/category/${categoryId}`, 'PUT', data, true, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to update category'
    };
}

async function deleteCategory(categoryId) {
    const response = await apiCall(`/api/products/category/${categoryId}`, 'DELETE', null, true, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to delete category'
    };
}

// Products API
async function getProducts(categoryId = null) {
    let endpoint = '/api/products/product';
    if (categoryId) {
        endpoint += `?category_id=${categoryId}`;
    }
    const response = await apiCall(endpoint, 'GET', null, false, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to load products'
    };
}

async function getProductById(productId) {
    const response = await apiCall(`/api/products/product/${productId}`, 'GET', null, false, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to load product'
    };
}

async function createProduct(data) {
    const response = await apiCall('/api/products/product', 'POST', data, true, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to create product'
    };
}

async function updateProduct(productId, data) {
    const response = await apiCall(`/api/products/product/${productId}`, 'PUT', data, true, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to update product'
    };
}

async function deleteProduct(productId) {
    const response = await apiCall(`/api/products/product/${productId}`, 'DELETE', null, true, PRODUCTS_API_URL);
    return {
        success: response.success,
        data: response.data,
        error: response.data.error || 'Failed to delete product'
    };
}

// ==================== CART FUNCTIONS ====================

async function getCart(skipCountUpdate = false) {
    const token = getToken();
    if (!token) {
        return [];
    }
    
    const response = await apiCall('/api/cart', 'GET', null, true, CART_API_URL);
    if (response.success) {
        const items = response.data.items || [];
        if (!skipCountUpdate) {
            updateCartCountFromItems(items);
        }
        return items;
    }
    return [];
}

function updateCartCountFromItems(items) {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

async function addToCart(productId, productName, productPrice, quantity) {
    const response = await apiCall('/api/cart/add', 'POST', {
        product_id: productId,
        quantity: quantity,
        price: productPrice
    }, true, CART_API_URL);
    
    if (response.success) {
        showNotification(`${productName} added to cart!`, 'success');
        await getCart();
    } else {
        showNotification('Failed to add to cart', 'error');
    }
    return response;
}

async function updateCartItemQuantity(itemId, quantity) {
    const response = await apiCall(`/api/cart/items/${itemId}`, 'PUT', { quantity }, true, CART_API_URL);
    return response;
}

async function removeFromCart(itemId) {
    const response = await apiCall(`/api/cart/items/${itemId}/remove`, 'DELETE', null, true, CART_API_URL);
    if (response.success) {
        showNotification('Item removed from cart', 'info');
        await getCart();
    }
    return response;
}

async function clearCart() {
    const response = await apiCall('/api/cart/clear', 'DELETE', null, true, CART_API_URL);
    if (response.success) {
        await getCart();
    }
    return response;
}

// ==================== NOTIFICATION SYSTEM ====================

function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize cart count on page load (only once)
let cartCountInitialized = false;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!cartCountInitialized && getToken()) {
            cartCountInitialized = true;
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                getCart();
            }
        }
    });
} else {
    if (!cartCountInitialized && getToken()) {
        cartCountInitialized = true;
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            getCart();
        }
    }
}

// ==================== ORDER FUNCTIONS ====================

// ORDERS_API_URL loaded from config.js

async function createOrder(orderData) {
    const response = await apiCall('/api/orders/create', 'POST', orderData, true, ORDERS_API_URL);
    
    if (response.success) {
        showNotification('Order placed successfully!', 'success');
    } else {
        showNotification(response.data.error || 'Failed to place order', 'error');
    }
    return response;
}

async function getOrders() {
    const response = await apiCall('/api/orders', 'GET', null, true, ORDERS_API_URL);
    return response;
}

async function getOrderDetail(orderId) {
    const response = await apiCall(`/api/orders/${orderId}`, 'GET', null, true, ORDERS_API_URL);
    return response;
}

async function cancelOrder(orderId) {
    const response = await apiCall(`/api/orders/${orderId}/cancel`, 'PUT', {}, true, ORDERS_API_URL);
    if (response.success) {
        showNotification('Order cancelled successfully', 'success');
    }
    return response;
}

async function getAllOrders() {
    const response = await apiCall('/api/orders/all', 'GET', null, true, ORDERS_API_URL);
    return response;
}

async function updateOrderStatus(orderId, status) {
    const response = await apiCall(`/api/orders/${orderId}/status`, 'PUT', { status }, true, ORDERS_API_URL);
    return response;
}
