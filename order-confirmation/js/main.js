

document.addEventListener('DOMContentLoaded', () => {
 

    const countdownElement = document.getElementById('countdown');
    let countdown = 5;

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
        if (countdown <= 0) {
            clearInterval(countdownInterval); 
            
         
            const currentPathname = window.location.pathname;
            const goToHome = currentPathname.includes('/order-confirmation.html')
                ? '../Home/Home.html' 
                : 'Home.html';  
            window.location.href = goToHome;
        }
    }, 1000); 
    window.updateCartCount();
    window.updateLoginSignupLogoutButtons();
});