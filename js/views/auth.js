import { navigate } from '../app.js';

const supabaseClient = window.supabase;

/* =========================
   LOGIN VIEW
========================= */
export function renderAuth(app) {
    app.innerHTML = `
        <div class="box auth-box">
            <h2>Přihlášení</h2>

            <div class="auth-form">
                <input
                    id="loginEmail"
                    type="email"
                    placeholder="Email"
                    autocomplete="email"
                />

                <input
                    id="loginPassword"
                    type="password"
                    placeholder="Heslo"
                    autocomplete="current-password"
                />

                <button id="loginBtn" class="action-btn tradeBtn">
                    Přihlásit se
                </button>

                <button id="goRegisterBtn" class="auth-secondary">
                    Vytvořit účet
                </button>

                <p id="authMsg" class="auth-msg"></p>
            </div>
        </div>
    `;

    document.getElementById('loginBtn').onclick = login;
    document.getElementById('goRegisterBtn').onclick = () => {
        renderRegister(app);
    };
}

/* =========================
   REGISTER VIEW
========================= */
function renderRegister(app) {
    app.innerHTML = `
        <div class="box auth-box">
            <h2>Vytvoření účtu</h2>

            <div class="auth-form">
                <input
                    id="registerEmail"
                    type="email"
                    placeholder="Email"
                    autocomplete="email"
                />

                <input
                    id="registerPassword"
                    type="password"
                    placeholder="Heslo"
                    autocomplete="new-password"
                />

                <input
                    id="registerPasswordConfirm"
                    type="password"
                    placeholder="Potvrdit heslo"
                    autocomplete="new-password"
                />

                <button id="registerBtn" class="action-btn tradeBtn">
                    Vytvořit účet
                </button>

                <button id="backToLoginBtn" class="auth-secondary">
                    Zpět na přihlášení
                </button>

                <p id="registerMsg" class="auth-msg"></p>
            </div>
        </div>
    `;

    document.getElementById('registerBtn').onclick = register;
    document.getElementById('backToLoginBtn').onclick = () => {
        renderAuth(app);
    };
}

/* =========================
   LOGIN LOGIC
========================= */
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('authMsg');

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

/* =========================
   REGISTER LOGIC
========================= */
async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerPasswordConfirm').value;
    const msg = document.getElementById('registerMsg');

    msg.textContent = '';
    msg.classList.remove('auth-error', 'auth-bounce');

    if (!email || !password || !confirm) {
        msg.textContent = 'Vyplňte všechna pole';
        msg.classList.add('auth-error');
        return;
    }

    if (password !== confirm) {
        msg.textContent = 'Hesla se neshodují';
        msg.classList.add('auth-error');

        void msg.offsetWidth;
        msg.classList.add('auth-bounce');
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'https://kubarada.github.io/trading_checklist/'
        }
    });

    if (error) {
        msg.textContent = error.message;
        msg.classList.add('auth-error');
        return;
    }

    // ✅ SUCCESS MESSAGE – KLÍČOVÉ
    msg.textContent =
        '✅ Účet vytvořen. Ověřte svůj email a poté se vraťte zpět do aplikace.';
}
