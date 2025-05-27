const signUpForm = document.getElementById('signUp');
signUpForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;
    const userData = {
        name,
        userName,
        email,
        password
    };
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.userName === userName || user.email === email);
    if (userExists) {
        alert('Username or email already exists. Please choose another one.');
        return;
    }
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Redirecting to login page.');
    window.location.href = 'login/login.html';
});
