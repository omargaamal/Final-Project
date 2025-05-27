window.updateLoginSignupLogoutButtons = () => {
    const offcanvasContainer = document.getElementById('loginSignupLogoutContainer');
    const loginButtonNav = document.getElementById('loginButtonContainer');
    const logoutButtonNav = document.getElementById('logoutButtonContainer');
    const currentUser = localStorage.getItem('currentUser');

    const handleLogout = (e) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to log out?')) return;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart'); 
        window.updateCartCount();   
        const currentPathname = window.location.pathname;
        const goToHome = currentPathname.includes('/Home/') ||  currentPathname.includes('/products/') || currentPathname.includes('/cart/') || currentPathname.includes('/My-Orders/')
            ? '../Home/Home.html'
            : 'Home.html';

        window.location.href = goToHome;
    };

    if (offcanvasContainer) {
        if (currentUser) {
            offcanvasContainer.innerHTML = `
                <a href="#" id="offcanvasLogoutButton" class="btn btn-dark-outline btn-lg logout">Logout</a>
            `;
            document.getElementById('offcanvasLogoutButton')?.addEventListener('click', handleLogout);
        } else {
            offcanvasContainer.innerHTML = `
                <ul class="form-register">
                    <li><a href="../login/login.html" class="btn btn-dark-outline btn-lg">Login</a></li>
                    <li><a href="../Sign Up.html" class="btn btn-dark-outline btn-lg">Sign Up</a></li>
                </ul>
            `;
        }
    }

    if (loginButtonNav && logoutButtonNav) {
        if (currentUser) {
            loginButtonNav.classList.add('d-none');
            logoutButtonNav.classList.remove('d-none');
            document.getElementById('logoutButton')?.addEventListener('click', handleLogout);
        } else {
            loginButtonNav.classList.remove('d-none');
            logoutButtonNav.classList.add('d-none');
        }
    }
};

window.updateCartCount = () => {
    const cartCountSpan = document.querySelector('.cart-count');
    if (!cartCountSpan) {
        console.warn('Cart count span not found.');
        return;
    }
        
    const cartItems = JSON.parse(localStorage.getItem('cart')) || {}; 
    let totalItems = Object.values(cartItems).reduce((sum, count) => sum + count, 0);
    cartCountSpan.textContent = totalItems;
};

window.getDetails = (id) => {
    localStorage.setItem('productId', id);
    window.location.href = '../products/Product.html';
};

window.addToCart = (id) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert(`Product added to cart!`);
};

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching product details for ID ${productId}:`, error);
        return null;
    }
}

window.checkout = async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const currentUser = localStorage.getItem('currentUser');

    if (Object.keys(cart).length === 0) {
        alert('Your cart is empty. Nothing to checkout!');
        return;
    }

    if (!currentUser) {
        alert('Please log in to complete your purchase.');
        const currentPathname = window.location.pathname;
        const loginPagePath = currentPathname.includes('/my-orders/') || currentPathname.includes('/products/') || currentPathname.includes('/cart/' || currentPathname.includes('/order-confirmation/'))
            ? '../login/login.html'
            : 'login/login.html';

        window.location.href = loginPagePath;
        return;
    }

    let currentUsername = 'Guest';
    try {
        const userData = JSON.parse(currentUser);
        currentUsername = userData.username || 'Guest';
    } catch (e) {
        console.error('Error parsing currentUser from localStorage:', e);
    }

    const productIdsInCart = Object.keys(cart);
    const productDetailsPromises = productIdsInCart.map(id => fetchProductDetails(id));
    const products = await Promise.all(productDetailsPromises);
    const validProducts = products.filter(p => p !== null);

    let orderTotal = 0;
    const orderItems = validProducts.map(product => {
        const quantity = cart[product.id];
        const itemPrice = product.price * quantity;
        orderTotal += itemPrice;
        return {
            productId: product.id,
            name: product.title,
            price: product.price,
            quantity: quantity,
            subtotal: itemPrice,
            image: product.image
        };
    });

    const order = {
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: currentUsername,
        timestamp: new Date().toISOString(),
        items: orderItems,
        totalAmount: orderTotal.toFixed(2),
        status: 'Pending'
    };

    let allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    allOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(allOrders));

    localStorage.removeItem('cart');
    window.updateCartCount();

    alert('Checkout successful! Your order has been placed.');
    localStorage.setItem('lastOrderId', order.orderId);

    
    const currentPathname = window.location.pathname;
    const orderConfirmationPagePath =currentPathname.includes('/cart/') 
        ? '../order-confirmation/order-confirmation.html' 
        : 'order-confirmation.html';  

    window.location.href = orderConfirmationPagePath;
};

document.addEventListener('DOMContentLoaded', () => {
   

    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.common-navbar .navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href')?.split('/').pop();

        if ((currentPath === '' || currentPath === 'Sign Up.html' || currentPath === 'Home.html') && linkPath === 'Home.html') {
            link.classList.add('active');
        } else if (linkPath && linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    window.updateCartCount();
    window.updateLoginSignupLogoutButtons();

    const createProductCardHtml = (product) => `
        <div class="col-6 col-sm-4 col-md-3 mb-4 div-product">
            <div class="product-card-small" id="product-${product.id}" style="height: 100%; text-align: center;">
                <img src="${product.image}" alt="${product.title}" class="img-fluid" style="height: 250px; object-fit: contain;">
                <div class="card-content">
                    <p class="product-name">${product.title}</p>
                    <p class="product-price">$ ${product.price.toFixed(2)}</p>
                    <i class="fa-solid fa-cart-shopping add-to-cart-btn btn-product" data-product-id="${product.id}"></i>
                </div>
            </div>
        </div>
    `;

    const fetchAndDisplayProducts = async () => {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            const allProducts = await response.json();
            const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());

            const newCollectionImagesContainer = document.getElementById('newCollectionImages');
            if (newCollectionImagesContainer) {
                const products = shuffledProducts.slice(0, 2);
                newCollectionImagesContainer.innerHTML = products.map(p =>
                    `<div class="col-6 text-center"><img src="${p.image}" class="img-fluid" style="height: 250px; object-fit: contain;" alt="${p.title}"></div>`
                ).join('');
            }

            const newThisWeekContainer = document.getElementById('newThisWeekProducts');
            if (newThisWeekContainer) {
                const womensClothing = allProducts.filter(p => p.category === "women's clothing").slice(0, 8);
                newThisWeekContainer.innerHTML = womensClothing.map(createProductCardHtml).join('');
            }

            const xivCollectionContainer = document.getElementById('xivCollectionProducts');
            if (xivCollectionContainer) {
                const mensClothing = allProducts.filter(p => p.category === "men's clothing").slice(0, 8);
                xivCollectionContainer.innerHTML = mensClothing.map(createProductCardHtml).join('');
            }

            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = button.dataset.productId;
                    window.addToCart(productId);
                });
            });

            document.querySelectorAll('.product-card-small').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('add-to-cart-btn')) {
                        const productId = card.id.split('-')[1];
                        window.getDetails(productId);
                    }
                });
            });

        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
    };

    if (document.getElementById('newCollectionImages') || document.getElementById('newThisWeekProducts') || document.getElementById('xivCollectionProducts')) {
        fetchAndDisplayProducts();
    }
});


   