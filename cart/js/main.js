
async function fetchProductDetails(productId) {
    const cached = sessionStorage.getItem(`product_${productId}`);
    if (cached) {
        return JSON.parse(cached);
    }

    try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        sessionStorage.setItem(`product_${productId}`, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error(`Error fetching product details for ID ${productId}:`, error);
        return null;
    }
}


async function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const cartTotalSpan = document.getElementById('cartTotal');
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    let tempHtml = '';
    let subtotal = 0;

    
    const productIdsInCart = Object.keys(cart);

    if (productIdsInCart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-message">Your cart is empty. Start shopping now!</p>';
        cartSubtotalSpan.textContent = '$0.00';
        cartTotalSpan.textContent = '$0.00';
        return;
    }

   
    const productDetailsPromises = productIdsInCart.map(id => fetchProductDetails(id));
    const products = await Promise.all(productDetailsPromises);

    
    const validProducts = products.filter(p => p !== null);

    validProducts.forEach(product => {
        const quantity = cart[product.id];
        const itemPrice = product.price * quantity;
        subtotal += itemPrice;

        tempHtml += `
            <div class="cart-item-card" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.title}">
                <div class="cart-item-details">
                    <h5>${product.title}</h5>
                    <p>Price: $${product.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="btn btn-outline-secondary btn-sm decrease-qty-btn">-</button>
                        <input type="number" class="form-control form-control-sm item-qty" value="${quantity}" min="1">
                        <button class="btn btn-outline-secondary btn-sm increase-qty-btn">+</button>
                    </div>
                </div>
                <div class="ms-auto text-end">
                    <p class="fw-bold mb-1">$${itemPrice.toFixed(2)}</p>
                    <button class="btn btn-danger btn-sm remove-item-btn">Remove</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = tempHtml;
    cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalSpan.textContent = `$${subtotal.toFixed(2)}`;

    addCartItemEventListeners();
}


function addCartItemEventListeners() {
    document.querySelectorAll('.cart-item-card').forEach(card => {
        const productId = card.dataset.productId;
        const quantityInput = card.querySelector('.item-qty');
        const decreaseBtn = card.querySelector('.decrease-qty-btn');
        const increaseBtn = card.querySelector('.increase-qty-btn');
        const removeBtn = card.querySelector('.remove-item-btn');

        decreaseBtn.addEventListener('click', () => updateQuantity(productId, -1));
        increaseBtn.addEventListener('click', () => updateQuantity(productId, 1));
        quantityInput.addEventListener('change', (e) => updateQuantity(productId, 0, parseInt(e.target.value)));
        removeBtn.addEventListener('click', () => removeItem(productId));
    });
}


function updateQuantity(productId, change, newValue = null) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (cart[productId]) {
        let currentQuantity = cart[productId];
        let newQuantity = newValue !== null ? newValue : currentQuantity + change;

        if (newQuantity < 1) {
            newQuantity = 1; 
        }
        
        cart[productId] = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems(); 
        window.updateCartCount(); 
    }
}

function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        delete cart[productId];
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems(); 
        window.updateCartCount(); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
    
            let cart = JSON.parse(localStorage.getItem('cart')) || {};
            if (Object.keys(cart).length === 0) {
                alert('Your cart is empty. Please add items before checking out.');
                return;
            }

            if (typeof window.checkout === 'function') {
                window.checkout();
            }
        });
    }

    displayCartItems();
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    }
   
});