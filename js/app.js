import { renderAuth } from './views/auth.js';
import { renderDashboard } from './views/dashboard.js';
import { renderDirection } from './views/direction.js';
import { renderChecklist } from './views/checklist.js';
import { renderConfirmation } from './views/confirmation.js';

/* ===== GLOBAL STATE ===== */
export const state = {
    direction: null,
    score: null,
    isLive: true
};


/* ===== DOM ===== */
const app = document.getElementById('app');
const logoutBtn = document.getElementById('logoutBtn');

/* ===== SUPABASE ===== */
const supabaseClient = window.supabase;

/* ===== ROUTER ===== */
export function navigate(view) {
    switch (view) {
        case 'auth':
            renderAuth(app);
            break;

        case 'dashboard':
            renderDashboard(app);
            break;

        case 'direction':
            renderDirection(app);
            break;

        case 'checklist':
            renderChecklist(app);
            break;

        case 'confirmation':
            renderConfirmation(app);
            break;

        /* PLACEHOLDERS */
        case 'stats':
            app.innerHTML = `
                <div class="box">
                    <h2>📊 Statistiky</h2>
                    <p style="color: var(--muted); margin-top: 12px;">
                        Připravujeme…
                    </p>
                </div>
            `;
            break;

        case 'history':
            app.innerHTML = `
                <div class="box">
                    <h2>🕘 Historie tradů</h2>
                    <p style="color: var(--muted); margin-top: 12px;">
                        Připravujeme…
                    </p>
                </div>
            `;
            break;

        default:
            renderAuth(app);
    }
}

/* ===== INIT UI ===== */
// vždy něco renderuj (žádná prázdná obrazovka)
navigate('auth');

/* ===== AUTH STATE HANDLING (JEDINÉ MÍSTO) ===== */
supabaseClient.auth.onAuthStateChange((event, session) => {

    /* LOGOUT BUTTON */
    if (logoutBtn) {
        logoutBtn.style.display = session ? 'inline' : 'none';

        logoutBtn.onclick = async () => {
            await supabaseClient.auth.signOut();
        };
    }

    /* ROUTING PODLE AUTH STAVU */
    if (session) {
        navigate('dashboard');
    } else {
        navigate('auth');
    }
});
