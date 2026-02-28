// Orders Page JavaScript

async function loadOrders() {
    const response = await getOrders();
    const ordersList = document.getElementById('orders-list');
    
    if (!response.success || response.data.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No orders found</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    response.data.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const statusClass = order.status.toLowerCase();
        const itemsCount = order.items.length;
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Order #${order.order_number}</h3>
                    <p class="order-date">${new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span class="order-status status-${statusClass}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-body">
                <p><strong>Items:</strong> ${itemsCount}</p>
                <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                <p><strong>Payment:</strong> ${order.payment_method}</p>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.product_name} x ${item.quantity}</span>
                        <span>$${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            ${order.status === 'pending' || order.status === 'confirmed' ? 
                `<button class="btn btn-danger" onclick="handleCancelOrder(${order.id})">Cancel Order</button>` : 
                ''}
        `;
        
        ordersList.appendChild(orderCard);
    });
}

async function handleCancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    const response = await cancelOrder(orderId);
    if (response.success) {
        loadOrders();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (getToken()) {
        loadOrders();
    } else {
        window.location.href = '/login/';
    }
});
