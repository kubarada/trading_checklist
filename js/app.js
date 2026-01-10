import { renderAuth } from './views/auth.js';
import { renderDirection } from './views/direction.js';
import { renderChecklist } from './views/checklist.js';
import { renderConfirmation } from './views/confirmation.js';


export const state = {
    direction: null
};

const app = document.getElementById('app');
const supabaseClient = window.supabase;

export function navigate(view) {
    if (view === 'auth') renderAuth(app);
    if (view === 'direction') renderDirection(app);
    if (view === 'checklist') renderChecklist(app);
    if (view === 'confirmation') renderConfirmation(app);
}


(async () => {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        navigate('auth');
    } else {
        navigate('direction');
    }
})();
