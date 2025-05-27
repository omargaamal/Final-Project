

document.addEventListener('DOMContentLoaded', () => {
   
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    }

    const ordersContainer = document.getElementById('ordersList'); 

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
       
        alert('Please log in to view your orders.');
        window.location.href = '../login/login.html'; 
        return;
    }

    let currentUsername = 'Guest';
    try {
        const userData = JSON.parse(currentUser);
        currentUsername = userData.username || 'Guest';
    } catch (e) {
        console.error('Error parsing currentUser from localStorage:', e);
      
    }

    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];

    const userOrders = allOrders.filter(order => order.userId === currentUsername);

    if (userOrders.length === 0) {
        ordersContainer.innerHTML = '<p class="text-center py-5">You have no orders yet.</p>';
        return;
    }

   
    let ordersHtml = '<div class="list-group">'; 

    userOrders.forEach(order => {
       
        const orderDate = new Date(order.timestamp).toLocaleString();

        let itemsHtml = '<ul class="list-unstyled mb-2">';
        order.items.forEach(item => {
            itemsHtml += `
                <li class="d-flex align-items-center mb-2">
                    <img src="${item.image}" alt="${item.name}" class="img-thumbnail me-3" style="width: 70px; height: 70px; object-fit: contain;">
                    <div>
                        <strong>${item.name}</strong><br>
                        <span>Quantity: ${item.quantity} | Price: $${item.price.toFixed(2)}</span>
                    </div>
                </li>
            `;
        });
        itemsHtml += '</ul>';

        ordersHtml += `
            <div class="list-group-item list-group-item-action flex-column align-items-start mb-3 shadow-sm rounded">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Order ID: ${order.orderId}</h5>
                    <small class="text-muted">Date: ${orderDate}</small>
                </div>
                <p class="mb-1"><strong>Status:</strong> <span class="badge bg-primary">${order.status}</span></p>
                <p class="mb-2"><strong>Total Amount:</strong> <span class="fw-bold fs-5">$${order.totalAmount}</span></p>
                <h6 class="mt-3 mb-2">Items:</h6>
                ${itemsHtml}
            </div>
        `;
    });

    ordersHtml += '</div>';
    ordersContainer.innerHTML = ordersHtml;
});