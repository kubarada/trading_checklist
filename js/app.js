import { renderAuth } from './views/auth.js';
import { renderDirection } from './views/direction.js';
import { renderChecklist } from './views/checklist.js';
import { renderConfirmation } from './views/confirmation.js';

// ===== GLOBAL STATE =====
export const state = {
    direction: null,
    score: null
};

// ===== DOM =====
const app = document.getElementById('app');
const logoutBtn = document.getElementById('logoutBtn');

// ===== SUPABASE =====
const supabaseClient = window.supabase;

// ===== ROUTER =====
export function navigate(view) {
    if (view === 'auth') renderAuth(app);
    if (view === 'direction') renderDirection(app);
    if (view === 'checklist') renderChecklist(app);
    if (view === 'confirmation') renderConfirmation(app);
}

// ===== INIT UI =====
// zobraz auth hned (žádná prázdná stránka)
navigate('auth');

// ===== AUTH STATE HANDLING (JEDINÉ MÍSTO) =====
supabaseClient.auth.onAuthStateChange((event, session) => {

    // LOGOUT BUTTON VISIBILITY
    if (logoutBtn) {
        logoutBtn.style.display = session ? 'inline' : 'none';

        logoutBtn.onclick = async () => {
            await supabaseClient.auth.signOut();
        };
    }

    // ROUTING PODLE AUTH STAVU
    if (session) {
        navigate('direction');
    } else {
        navigate('auth');
    }
});