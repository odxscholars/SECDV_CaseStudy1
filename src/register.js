const passwordInput = document.getElementById('passwordInput');
const checkLength = document.getElementById('check-length');
const checkUppercase = document.getElementById('check-uppercase');
const checkLowercase = document.getElementById('check-lowercase');
const checkNumber = document.getElementById('check-number');
const checkSpecial = document.getElementById('check-special');

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;

    updateChecklist(checkLength, password.length >= 8);
    updateChecklist(checkUppercase, /[A-Z]/.test(password));
    updateChecklist(checkLowercase, /[a-z]/.test(password));
    updateChecklist(checkNumber, /[0-9]/.test(password));
    updateChecklist(checkSpecial, /[\W_]/.test(password));
});

function updateChecklist(element, valid) {
    if (valid) {
        element.textContent = '✅ ' + element.textContent.slice(2);
        element.classList.add('valid');
        element.classList.remove('invalid');
    } else {
        element.textContent = '❌ ' + element.textContent.slice(2);
        element.classList.add('invalid');
        element.classList.remove('valid');
    }
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    const minLength = 8;

    // Individual checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber    = /[0-9]/.test(password);
    const hasSpecial   = /[\W_]/.test(password);

    const missing = [];

    if (password.length < minLength) {
        missing.push(`at least ${minLength} characters`);
    }
    if (!hasUppercase) missing.push('an uppercase letter');
    if (!hasLowercase) missing.push('a lowercase letter');
    if (!hasNumber)    missing.push('a number');
    if (!hasSpecial)   missing.push('a special character');

    if (missing.length > 0) {
        alert(`Password must include ${missing.join(', ')}.`);
        return;
    }

    // Continue if valid
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