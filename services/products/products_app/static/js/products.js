// Products Browse Page JavaScript

let currentCategoryId = null;

async function loadCategories() {
    const result = await getCategories();
    
    if (result.success) {
        const categoryList = document.getElementById('category-list');
        const categories = result.data;
        
        // Clear existing buttons except "All Products"
        categoryList.innerHTML = '<button class="category-btn active" data-category-id="">All Products</button>';
        
        // Add category buttons
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = category.name;
            btn.dataset.categoryId = category.id;
            btn.addEventListener('click', () => selectCategory(category.id));
            categoryList.appendChild(btn);
        });
    }
}

async function loadProducts(categoryId = null) {
    const result = await getProducts(categoryId);
    
    if (result.success) {
        const productsGrid = document.getElementById('products-grid');
        const products = result.data;
        
        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No products available</p>';
            return;
        }
        
        productsGrid.innerHTML = '';
        
        // Group products by category for display (max 4 per row)
        products.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    } else {
        showNotification('Error loading products', 'error');
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const cart = getCart();
    const quantity = cart[product.id]?.quantity || 0;
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? `<img src="${product.image}" alt="${product.name}">` : 'No Image'}
        </div>
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-description">${product.description || 'No description available'}</div>
            <div class="product-actions">
                <div class="qty-control">
                    <button class="qty-minus" onclick="decreaseQuantity(this, ${product.id})">-</button>
                    <input type="number" class="qty-input" value="${quantity}" min="0" max="999" readonly>
                    <button class="qty-plus" onclick="increaseQuantity(this, ${product.id})">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="addProductToCart(${product.id}, '${product.name}', ${product.price})">Add</button>
            </div>
        </div>
    `;
    
    return card;
}

function increaseQuantity(button, productId) {
    const input = button.previousElementSibling;
    let quantity = parseInt(input.value) || 0;
    quantity++;
    input.value = quantity;
}

function decreaseQuantity(button, productId) {
    const input = button.nextElementSibling;
    let quantity = parseInt(input.value) || 0;
    if (quantity > 0) {
        quantity--;
    }
    input.value = quantity;
}

function addProductToCart(productId, productName, productPrice) {
    const card = event.target.closest('.product-card');
    const qtyInput = card.querySelector('.qty-input');
    const quantity = parseInt(qtyInput.value) || 0;
    
    if (quantity <= 0) {
        showNotification('Please select a quantity', 'info');
        return;
    }
    
    addToCart(productId, productName, productPrice, quantity);
    qtyInput.value = 0;
}

function selectCategory(categoryId) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    currentCategoryId = categoryId || null;
    loadProducts(categoryId || null);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Handle "All Products" button
    const allProductsBtn = document.querySelector('[data-category-id=""]');
    if (allProductsBtn) {
        allProductsBtn.addEventListener('click', () => selectCategory(null));
    }
    
    loadCategories();
    loadProducts();
});
