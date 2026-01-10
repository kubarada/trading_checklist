import { navigate } from '../app.js';

const supabaseClient = window.supabase;

export function renderAuth(app) {
    app.innerHTML = `
        <div class="box">
            <h2>Přihlášení / Registrace</h2>

            <input id="email" type="email" placeholder="Email" />
            <input id="password" type="password" placeholder="Heslo" />

            <button id="loginBtn" class="action-btn tradeBtn">
                Přihlásit
            </button>

            <button id="registerBtn" class="action-btn backBtn">
                Registrovat
            </button>

            <p id="authMsg"></p>
        </div>
    `;

    document.getElementById('loginBtn').onclick = login;
    document.getElementById('registerBtn').onclick = register;
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('authMsg');

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        msg.textContent = error.message;
    } else {
        navigate('direction');
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
        : '✅ Registrace hotová, můžeš se přihlásit';
}
