import { renderDirection } from './views/direction.js';
import { renderChecklist } from './views/checklist.js';
import { renderConfirmation } from './views/confirmation.js';

export const state = {
    view: 'direction',
    direction: null
};

export function navigate(view) {
    state.view = view;
    render();
}

function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    if (state.view === 'direction') {
        renderDirection(app);
    }

    if (state.view === 'checklist') {
        renderChecklist(app);
    }

    if (state.view === 'confirmation') {
        renderConfirmation(app);
    }
}

render();
