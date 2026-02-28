// Checkout Page JavaScript with Google Maps Integration

let map;
let marker;
let autocomplete;
let selectedPlace = null;
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

function initMap() {
    // Default to a central location
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false
    });
    
    marker = new google.maps.Marker({
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
    });
    
    // Initialize autocomplete
    const input = document.getElementById('address-search');
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    
    // When user selects an address from dropdown
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
            showNotification('No details available for this address', 'error');
            return;
        }
        
        updateMapLocation(place);
    });
    
    // When user drags the marker
    marker.addListener('dragend', () => {
        const position = marker.getPosition();
        reverseGeocode(position.lat(), position.lng());
    });
    
    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                marker.setPosition(pos);
                reverseGeocode(pos.lat, pos.lng);
            },
            () => {
                // Geolocation failed, keep default location
            }
        );
    }
}

function updateMapLocation(place) {
    selectedPlace = place;
    
    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
    }
    
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    
    displayAddressDetails(place);
}

function reverseGeocode(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: lat, lng: lng };
    
    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
            selectedPlace = results[0];
            document.getElementById('address-search').value = results[0].formatted_address;
            displayAddressDetails(results[0]);
        }
    });
}

function displayAddressDetails(place) {
    const detailsDiv = document.getElementById('address-details');
    const formattedAddress = document.getElementById('formatted-address');
    const componentsDiv = document.getElementById('address-components');
    
    formattedAddress.textContent = place.formatted_address;
    
    // Extract address components
    let street = '', city = '', state = '', postalCode = '', country = '';
    
    if (place.address_components) {
        place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number') || types.includes('route')) {
                street += component.long_name + ' ';
            }
            if (types.includes('locality')) {
                city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
            }
            if (types.includes('postal_code')) {
                postalCode = component.long_name;
            }
            if (types.includes('country')) {
                country = component.long_name;
            }
        });
    }
    
    componentsDiv.innerHTML = `
        <small>City: ${city || 'N/A'} | State: ${state || 'N/A'} | ZIP: ${postalCode || 'N/A'}</small>
    `;
    
    detailsDiv.style.display = 'block';
}

async function loadOrderSummary() {
    const items = await getCart(true);
    
    if (items.length === 0) {
        showNotification('Your cart is empty', 'error');
        window.location.href = '/cart';
        return;
    }
    
    const orderItemsDiv = document.getElementById('order-items');
    orderItemsDiv.innerHTML = '';
    
    let subtotal = 0;
    
    for (const item of items) {
        const product = await fetchProductDetails(item.product_id);
        const total = parseFloat(item.price) * item.quantity;
        subtotal += total;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <div>
                <div class="item-name">${product.name}</div>
                <div class="item-quantity">Qty: ${item.quantity} × $${parseFloat(item.price).toFixed(2)}</div>
            </div>
            <div>$${total.toFixed(2)}</div>
        `;
        orderItemsDiv.appendChild(itemDiv);
    }
    
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('tax').textContent = tax.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

async function placeOrder() {
    const name = document.getElementById('delivery-name').value.trim();
    const phone = document.getElementById('delivery-phone').value.trim();
    const paymentMethod = document.getElementById('payment-method').value;
    
    if (!name) {
        showNotification('Please enter your full name', 'error');
        return;
    }
    
    if (!phone) {
        showNotification('Please enter your phone number', 'error');
        return;
    }
    
    if (!selectedPlace) {
        showNotification('Please select a delivery address', 'error');
        return;
    }
    
    // Extract address components
    let street = '', city = '', state = '', postalCode = '', country = '';
    
    if (selectedPlace.address_components) {
        selectedPlace.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number') || types.includes('route')) {
                street += component.long_name + ' ';
            }
            if (types.includes('locality')) {
                city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
            }
            if (types.includes('postal_code')) {
                postalCode = component.long_name;
            }
            if (types.includes('country')) {
                country = component.long_name;
            }
        });
    }
    
    const lat = selectedPlace.geometry.location.lat();
    const lng = selectedPlace.geometry.location.lng();
    
    const orderData = {
        delivery_name: name,
        delivery_phone: phone,
        delivery_address: street.trim() || selectedPlace.formatted_address,
        delivery_city: city,
        delivery_state: state,
        delivery_postal_code: postalCode,
        delivery_country: country,
        delivery_latitude: lat,
        delivery_longitude: lng,
        payment_method: paymentMethod
    };
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing Order...';
    
    const response = await createOrder(orderData);
    
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
    
    if (response.success) {
        window.location.href = '/orders';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = '/login';
        return;
    }
    
    // Autofill user's name
    const profileResult = await getUserProfile();
    if (profileResult.success) {
        const user = profileResult.data.user;
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
        document.getElementById('delivery-name').value = fullName;
    }
    
    loadOrderSummary();
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
});
