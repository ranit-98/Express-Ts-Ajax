
// =======================> Global Functions <=======================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'toast-' + Date.now();
    
    const bgClass = type === 'success' ? 'bg-success' : 
                    type === 'error' ? 'bg-danger' : 
                    type === 'warning' ? 'bg-warning' : 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = new bootstrap.Toast(document.getElementById(toastId));
    toastElement.show();
    
    // Remove toast element after it's hidden
    document.getElementById(toastId).addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

/**
 * Logout function
 */
async function logout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = result.data.redirectUrl;
            }, 1000);
        } else {
            showToast('Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        showToast('An error occurred during logout.', 'error');
    }
}

/**
 * Generic AJAX request function
 */
async function makeRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// =======================> Product Management <=======================

/**
 * Delete product
 */
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    const result = await makeRequest(`/products/api/products/${productId}`, {
        method: 'DELETE'
    });
    
    if (result.success) {
        showToast('Product deleted successfully!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        showToast(result.data?.message || 'Failed to delete product', 'error');
    }
}

/**
 * Handle product form submission
 */
function initProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Convert price and stock to numbers
        data.price = parseFloat(data.price);
        data.stock = parseInt(data.stock);
        
        const productId = form.dataset.productId;
        const url = productId ? 
            `/products/api/products/${productId}` : 
            '/products/api/products';
        const method = productId ? 'PUT' : 'POST';
        
        const result = await makeRequest(url, {
            method,
            body: JSON.stringify(data)
        });
        
        if (result.success) {
            showToast(
                productId ? 'Product updated successfully!' : 'Product created successfully!', 
                'success'
            );
            setTimeout(() => {
                window.location.href = '/products';
            }, 1000);
        } else {
            showToast(result.data?.message || 'Failed to save product', 'error');
        }
        
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// =======================> User Management <=======================

/**
 * Delete user
 */
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    const result = await makeRequest(`/admin/api/users/${userId}`, {
        method: 'DELETE'
    });
    
    if (result.success) {
        showToast('User deleted successfully!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        showToast(result.data?.message || 'Failed to delete user', 'error');
    }
}

/**
 * Toggle user status
 */
async function toggleUserStatus(userId, currentStatus) {
    const newStatus = !currentStatus;
    
    const result = await makeRequest(`/admin/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: newStatus })
    });
    
    if (result.success) {
        showToast(
            `User ${newStatus ? 'activated' : 'deactivated'} successfully!`, 
            'success'
        );
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        showToast(result.data?.message || 'Failed to update user status', 'error');
    }
}

// =======================> Search and Filter <=======================

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            if (query.length > 2) {
                performSearch(query);
            }
        }, 500);
    });
}

/**
 * Perform search
 */
async function performSearch(query) {
    const result = await makeRequest(`/products/api/search?q=${encodeURIComponent(query)}`);
    
    if (result.success) {
        displaySearchResults(result.data.data);
    } else {
        showToast('Search failed', 'error');
    }
}

/**
 * Display search results
 */
function displaySearchResults(products) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    if (products.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted text-center">No products found</p>';
        return;
    }
    
    const html = products.map(product => `
        <div class="col-md-4 mb-3">
            <div class="card">
                <img src="${product.image || '/images/placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h6 class="card-title">${product.name}</h6>
                    <p class="card-text text-truncate">${product.description}</p>
                    <p class="card-text"><strong>${product.price}</strong></p>
                </div>
            </div>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = html;
}

// =======================> Initialize Functions <=======================

/**
 * Initialize all admin functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initProductForm();
    initSearch();
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});


