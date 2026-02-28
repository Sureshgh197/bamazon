// Admin Management Page JavaScript

async function loadCategories() {
    const result = await getCategories();
    
    if (result.success) {
        const categoriesList = document.getElementById('categories-list');
        categoriesList.innerHTML = '';
        
        result.data.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editCategory(${category.id}, '${category.name}', '${category.description || ''}')">Edit</button>
                        <button class="delete-btn" onclick="deleteCategoryItem(${category.id})">Delete</button>
                    </div>
                </td>
            `;
            categoriesList.appendChild(row);
        });
    }
}

async function loadProducts() {
    const result = await getProducts();
    
    if (result.success) {
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '';
        
        result.data.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category_name}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteProductItem(${product.id})">Delete</button>
                    </div>
                </td>
            `;
            productsList.appendChild(row);
        });
    }
}

async function loadCategorySelect() {
    const result = await getCategories();
    
    if (result.success) {
        const select = document.getElementById('product-category');
        select.innerHTML = '<option value="">Select a category...</option>';
        
        result.data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }
}

// Category Management Functions
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const data = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value,
    };
    
    let result;
    if (categoryId) {
        result = await updateCategory(categoryId, data);
    } else {
        result = await createCategory(data);
    }
    
    if (result.success) {
        showNotification(categoryId ? 'Category updated!' : 'Category created!', 'success');
        resetCategoryForm();
        loadCategories();
        loadCategorySelect();
    } else {
        showNotification(result.error, 'error');
    }
}

function editCategory(categoryId, name, description) {
    document.getElementById('category-id').value = categoryId;
    document.getElementById('category-name').value = name;
    document.getElementById('category-description').value = description;
    document.getElementById('category-form').scrollIntoView({ behavior: 'smooth' });
}

function resetCategoryForm() {
    document.getElementById('category-id').value = '';
    document.getElementById('category-form').reset();
}

async function deleteCategoryItem(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        const result = await deleteCategory(categoryId);
        if (result.success) {
            showNotification('Category deleted!', 'success');
            loadCategories();
        } else {
            showNotification(result.error, 'error');
        }
    }
}

// Product Management Functions
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const data = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: parseInt(document.getElementById('product-category').value),
        stock: parseInt(document.getElementById('product-stock').value),
    };
    
    let result;
    if (productId) {
        result = await updateProduct(productId, data);
    } else {
        result = await createProduct(data);
    }
    
    if (result.success) {
        showNotification(productId ? 'Product updated!' : 'Product created!', 'success');
        resetProductForm();
        loadProducts();
    } else {
        showNotification(result.error, 'error');
    }
}

async function editProduct(productId) {
    const result = await getProductById(productId);
    
    if (result.success) {
        const product = result.data;
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
    }
}

function resetProductForm() {
    document.getElementById('product-id').value = '';
    document.getElementById('product-form').reset();
}

async function deleteProductItem(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const result = await deleteProduct(productId);
        if (result.success) {
            showNotification('Product deleted!', 'success');
            loadProducts();
        } else {
            showNotification(result.error, 'error');
        }
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login/';
}

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    const token = getToken();
    if (!token) {
        window.location.href = '/login/';
        return;
    }
    
    // Check if user is admin
    const profileResult = await getUserProfile();
    if (!profileResult.success) {
        alert('Authentication failed');
        window.location.href = '/login/';
        return;
    }
    
    const user = profileResult.data.user;
    if (!user.is_staff && !user.is_superuser) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/dashboard/';
        return;
    }
    
    // Setup form handlers
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Load initial data
    loadCategories();
    loadProducts();
    loadCategorySelect();
});
