// API Configuration and Helper Functions

const API_BASE_URL = 'http://localhost:8001';
const AUTH_TOKEN = localStorage.getItem('access_token') || null;

// API Headers
const getHeaders = (includeAuth = false) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (includeAuth && AUTH_TOKEN) {
        headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }
    return headers;
};

// Generic API Call Function
async function apiCall(endpoint, method = 'GET', data = null, includeAuth = false) {
    try {
        const options = {
            method,
            headers: getHeaders(includeAuth),
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (response.status === 204) {
            return { success: true, data: null };
        }

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || responseData.message || 'API Error');
        }

        return { success: true, data: responseData };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Category API Functions
async function getCategories() {
    return apiCall('/api/products/category', 'GET');
}

async function createCategory(data) {
    return apiCall('/api/products/category', 'POST', data, true);
}

async function updateCategory(categoryId, data) {
    return apiCall(`/api/products/category/${categoryId}`, 'PUT', data, true);
}

async function deleteCategory(categoryId) {
    return apiCall(`/api/products/category/${categoryId}`, 'DELETE', null, true);
}

// Product API Functions
async function getProducts(categoryId = null) {
    const endpoint = categoryId 
        ? `/api/products/product?category_id=${categoryId}`
        : '/api/products/product';
    return apiCall(endpoint, 'GET');
}

async function getProductById(productId) {
    return apiCall(`/api/products/product/${productId}`, 'GET');
}

async function createProduct(data) {
    return apiCall('/api/products/product', 'POST', data, true);
}

async function updateProduct(productId, data) {
    return apiCall(`/api/products/product/${productId}`, 'PUT', data, true);
}

async function deleteProduct(productId) {
    return apiCall(`/api/products/product/${productId}`, 'DELETE', null, true);
}

// Cart Functions (Local Storage)
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : {};
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId, productName, productPrice, quantity = 1) {
    const cart = getCart();
    
    if (cart[productId]) {
        cart[productId].quantity += quantity;
    } else {
        cart[productId] = {
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            quantity: quantity,
        };
    }
    
    saveCart(cart);
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    const cart = getCart();
    delete cart[productId];
    saveCart(cart);
    showNotification('Product removed from cart', 'info');
}

function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    if (cart[productId]) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            cart[productId].quantity = quantity;
            saveCart(cart);
        }
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = Object.keys(cart).length;
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// Notification Function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(notification, container.firstChild);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
