const loginForm = document.getElementById('login');
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const userNameInput = document.getElementById('userName').value;
    const passwordInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = storedUsers.find(user => user.userName === userNameInput);
    if (!foundUser) {
        errorMsg.textContent = 'User Not Found.';
    } else if (foundUser.password !== passwordInput) {
        errorMsg.textContent = "The Password Is Incorrect.";
    } else {
        errorMsg.textContent = '';
        alert('You Have Successfully logged in !');
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
      
        if (typeof updateLoginLogoutButtons === 'function') {
            updateLoginLogoutButtons(); 
        }
        window.location.href = '../index.html'; 
}
});


const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault(); 

        localStorage.removeItem('currentUser');

        alert('You Have Successfully logged out!');

        
        if (typeof updateLoginLogoutButtons === 'function') {
            updateLoginLogoutButtons();
        }
        window.location.href = '../index.html';
    });
}