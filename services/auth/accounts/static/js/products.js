// Products Browse Page JavaScript

let currentCategoryId = null;

async function loadCategories() {
    const result = await getCategories();
    
    if (result.success) {
        const categoryList = document.getElementById('category-list');
        const categories = result.data;
        
        // Clear existing buttons
        categoryList.innerHTML = '';
        
        // Add "All Products" button
        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn active';
        allBtn.textContent = 'All Products';
        allBtn.dataset.categoryId = '';
        allBtn.addEventListener('click', () => selectCategory(null));
        categoryList.appendChild(allBtn);
        
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
    
    const isOutOfStock = product.stock === 0;
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width:100%; max-height:100%;">` : 'No Image'}
        </div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
        <div class="product-description">${product.description || 'No description available'}</div>
        ${isOutOfStock ? 
            '<div class="out-of-stock">NO STOCK</div>' :
            `<div class="product-actions">
                <div class="qty-control">
                    <button class="qty-minus" onclick="decreaseQuantity(this, ${product.id})">-</button>
                    <input type="number" class="qty-input" value="0" min="0" max="${product.stock}" readonly>
                    <button class="qty-plus" onclick="increaseQuantity(this, ${product.id}, ${product.stock})">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="addProductToCart(${product.id}, '${product.name}', ${product.price})">Add</button>
            </div>`
        }
    `;
    
    return card;
}

function increaseQuantity(button, productId, maxStock) {
    const input = button.previousElementSibling;
    let quantity = parseInt(input.value) || 0;
    if (quantity < maxStock) {
        quantity++;
        input.value = quantity;
    } else {
        showNotification(`Maximum stock available: ${maxStock}`, 'info');
    }
}

function decreaseQuantity(button, productId) {
    const input = button.nextElementSibling;
    let quantity = parseInt(input.value) || 0;
    if (quantity > 0) {
        quantity--;
    }
    input.value = quantity;
}

async function addProductToCart(productId, productName, productPrice) {
    const card = event.target.closest('.product-card');
    const qtyInput = card.querySelector('.qty-input');
    const quantity = parseInt(qtyInput.value) || 0;
    
    if (quantity <= 0) {
        showNotification('Please select a quantity', 'info');
        return;
    }
    
    await addToCart(productId, productName, productPrice, quantity);
    qtyInput.value = 0;
}

function selectCategory(categoryId) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedBtn = categoryId === null || categoryId === '' 
        ? document.querySelector('[data-category-id=""]')
        : document.querySelector(`[data-category-id="${categoryId}"]`);
    
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    currentCategoryId = categoryId || null;
    loadProducts(currentCategoryId);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});
