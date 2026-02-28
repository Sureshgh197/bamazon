// Manage Orders Page JavaScript (Admin)

let allOrders = [];
let usersCache = {};

async function checkAdminAccess() {
    const result = await getUserProfile();
    if (!result.success || !result.data.user.is_staff) {
        alert('Admin access required');
        window.location.href = '/products/';
    }
}

async function fetchUsername(userId) {
    if (usersCache[userId]) {
        return usersCache[userId];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            headers: {
                'Authorization': `Token ${getToken()}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            usersCache[userId] = data.username;
            return data.username;
        }
    } catch (error) {
        console.error('Failed to fetch username:', error);
    }
    return `User ${userId}`;
}

function createAddressLink(order) {
    if (order.delivery_latitude && order.delivery_longitude) {
        const mapsUrl = `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`;
        const address = order.delivery_address || 'View Location';
        return `<a href="${mapsUrl}" target="_blank" style="color: #ff9900; text-decoration: none;">${address}</a>`;
    }
    
    if (order.delivery_address) {
        return order.delivery_address;
    }
    
    return 'N/A';
}

async function loadAllOrders(statusFilter = '') {
    const response = await getAllOrders();
    const ordersList = document.getElementById('orders-list');
    
    if (!response.success) {
        ordersList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Failed to load orders</p>';
        return;
    }
    
    allOrders = response.data;
    
    // Filter by status
    let filteredOrders = allOrders;
    if (statusFilter) {
        filteredOrders = allOrders.filter(order => order.status === statusFilter);
    }
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No orders found</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    for (const order of filteredOrders) {
        const username = await fetchUsername(order.user_id);
        const addressLink = createAddressLink(order);
        
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const statusClass = order.status.toLowerCase();
        const itemsCount = order.items.length;
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Order #${order.order_number}</h3>
                    <p class="order-date">${new Date(order.created_at).toLocaleDateString()} - ${username}</p>
                </div>
                <div class="order-status-control">
                    <select class="status-select" onchange="handleStatusChange(${order.id}, this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>
            <div class="order-body">
                <p><strong>Customer:</strong> ${order.delivery_name || username}</p>
                <p><strong>Phone:</strong> ${order.delivery_phone || 'N/A'}</p>
                <p><strong>Items:</strong> ${itemsCount}</p>
                <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                <p><strong>Payment:</strong> ${order.payment_method}</p>
                <p><strong>Address:</strong> ${addressLink}</p>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.product_name} x ${item.quantity}</span>
                        <span>$${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    }
}

async function handleStatusChange(orderId, newStatus) {
    if (!confirm(`Change order status to ${newStatus}?`)) {
        loadAllOrders(document.getElementById('status-filter').value);
        return;
    }
    
    const response = await updateOrderStatus(orderId, newStatus);
    if (response.success) {
        showNotification('Order status updated', 'success');
        loadAllOrders(document.getElementById('status-filter').value);
    } else {
        showNotification('Failed to update status', 'error');
        loadAllOrders(document.getElementById('status-filter').value);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = '/login/';
        return;
    }
    
    await checkAdminAccess();
    loadAllOrders();
    
    document.getElementById('status-filter').addEventListener('change', (e) => {
        loadAllOrders(e.target.value);
    });
});
