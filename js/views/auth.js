import { navigate } from '../app.js';

const supabaseClient = window.supabase;

export function renderAuth(app) {
    app.innerHTML = `
        <div class="box auth-box">
            <div class="auth-form">
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    autocomplete="email"
                />

                <input
                    id="password"
                    type="password"
                    placeholder="Heslo"
                    autocomplete="current-password"
                />
            

                <button id="loginBtn" class="action-btn tradeBtn">
                    Přihlásit se
                </button>

                <button id="registerBtn" class="auth-secondary">
                    Vytvořit účet
                </button>

                <p id="authMsg" class="auth-msg"></p>
            </div>
        </div>
    `;

    document.getElementById('loginBtn').onclick = login;
    document.getElementById('registerBtn').onclick = register;
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('authMsg');

    // reset
    msg.textContent = '';
    msg.classList.remove('auth-error', 'auth-bounce');

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        msg.textContent = error.message;
        msg.classList.add('auth-error');

        // restart animation
        void msg.offsetWidth;
        msg.classList.add('auth-bounce');
    }
}


async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('authMsg');

    const { error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    msg.textContent = error
        ? error.message
        : '✅ Účet vytvořen, potvrďte registraci na vašem emailu!';
}