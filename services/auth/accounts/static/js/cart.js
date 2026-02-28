// Shopping Cart Page JavaScript

let productsCache = {};

async function fetchProductDetails(productId) {
    if (productsCache[productId]) {
        return productsCache[productId];
    }
    
    const result = await getProductById(productId);
    if (result.success) {
        productsCache[productId] = result.data;
        return result.data;
    }
    return { name: `Product ${productId}`, price: 0 };
}

async function loadCart() {
    const items = await getCart(true);
    const emptyMessage = document.getElementById('empty-cart-message');
    const itemsContainer = document.getElementById('cart-items-container');
    
    if (items.length === 0) {
        emptyMessage.style.display = 'block';
        itemsContainer.style.display = 'none';
        return;
    }
    
    emptyMessage.style.display = 'none';
    itemsContainer.style.display = 'grid';
    
    const cartList = document.getElementById('cart-items-list');
    cartList.innerHTML = '';
    
    let subtotal = 0;
    
    for (const item of items) {
        const product = await fetchProductDetails(item.product_id);
        const total = parseFloat(item.price) * item.quantity;
        subtotal += total;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" 
                    onchange="updateQuantity(${item.id}, this.value)">
            </td>
            <td>$${total.toFixed(2)}</td>
            <td>
                <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
            </td>
        `;
        cartList.appendChild(row);
    }
    
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('tax').textContent = tax.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

async function updateQuantity(itemId, quantity) {
    quantity = parseInt(quantity);
    
    if (isNaN(quantity) || quantity < 1) {
        showNotification('Invalid quantity', 'error');
        loadCart();
        return;
    }
    
    await updateCartItemQuantity(itemId, quantity);
    loadCart();
}

async function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        await removeFromCart(itemId);
        loadCart();
    }
}

async function proceedToCheckout() {
    const items = await getCart(true);
    
    if (items.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    window.location.href = '/checkout';
}

// Initialize
let cartPageInitialized = false;
document.addEventListener('DOMContentLoaded', () => {
    if (cartPageInitialized) return;
    cartPageInitialized = true;
    
    if (getToken()) {
        loadCart();
    }
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});
