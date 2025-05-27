

document.addEventListener('DOMContentLoaded', async () => {
    const productId = localStorage.getItem('productId');
    const productDetailsContainer = document.getElementById('productDetailsContainer');

   
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount(); 
    
    }

   
   
    if (!productId) {
        productDetailsContainer.innerHTML = '<p class="text-center col-12">Product ID not found. Please navigate from the products page.</p>';
        return;
    }

    try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();

     
        productDetailsContainer.innerHTML = '';

        const productHtml = `
            <div class="col-md-6 mb-4 mb-md-0">
                <img src="${product.image}" alt="${product.title}" class="img-fluid rounded shadow-sm">
            </div>
            <div class="col-md-6">
                <h1 class="display-5 fw-bold">${product.title}</h1>
                <p class="text-muted lead">${product.category}</p>
                <h3 class="text-primary my-3">$ ${product.price.toFixed(2)}</h3>
                <p class="mb-4">${product.description}</p>
                <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                    <button class="btn btn-dark btn-lg px-4 me-md-2 add-to-cart-btn" data-product-id="${product.id}" type="button">
                        <i class="fas fa-shopping-cart me-2"></i> Add to Cart
                    </button>
                </div>
                <div class="mt-4">
                    <h4 class="fw-bold">Rating:</h4>
                    <p>${product.rating.rate} <span class="text-warning">(${product.rating.count} reviews)</span></p>
                </div>
            </div>
        `;

        productDetailsContainer.innerHTML = productHtml;

        const addToCartButton = productDetailsContainer.querySelector('.add-to-cart-btn');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', function() {
                
                if (typeof window.addToCart === 'function') {
                    window.addToCart(product.id);
                } else {
                    console.error('addToCart function not found in main.js. Ensure main.js is loaded first.');
                }
            });
        }

    } catch (error) {
        console.error('Error fetching product details:', error);
    }
});