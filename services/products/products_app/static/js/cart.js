// Shopping Cart Page JavaScript

async function loadCart() {
    const cart = getCart();
    const emptyMessage = document.getElementById('empty-cart-message');
    const itemsContainer = document.getElementById('cart-items-container');
    
    if (Object.keys(cart).length === 0) {
        emptyMessage.style.display = 'block';
        itemsContainer.style.display = 'none';
        return;
    }
    
    emptyMessage.style.display = 'none';
    itemsContainer.style.display = 'grid';
    
    const cartList = document.getElementById('cart-items-list');
    cartList.innerHTML = '';
    
    let subtotal = 0;
    
    Object.values(cart).forEach(item => {
        const total = item.price * item.quantity;
        subtotal += total;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
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
    });
    
    // Calculate totals
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('tax').textContent = tax.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

function updateQuantity(productId, quantity) {
    quantity = parseInt(quantity);
    
    if (isNaN(quantity) || quantity < 0) {
        showNotification('Invalid quantity', 'error');
        loadCart();
        return;
    }
    
    if (quantity === 0) {
        removeItem(productId);
    } else {
        updateCartItemQuantity(productId, quantity);
        loadCart();
    }
}

function removeItem(productId) {
    if (confirm('Are you sure you want to remove this item?')) {
        removeFromCart(productId);
        loadCart();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Checkout functionality coming soon!');
        });
    }
});
