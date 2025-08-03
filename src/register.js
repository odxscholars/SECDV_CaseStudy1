document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.token);
        switch (data.role) {
            case 'admin':
                window.location.href = '/admin.html';
                break;
            case 'manager':
                window.location.href = '/manager.html';
                break;
            default:
                window.location.href = '/employee.html';
        }
    } else {
        alert(data.message);
    }
});
