import { navigate, state } from '../app.js';

export function renderDirection(app) {
    app.innerHTML = `
        <div class="box">
            <button class="direction-btn long" id="longBtn">LONG</button>
            <button class="direction-btn short" id="shortBtn">SHORT</button>
        </div>
    `;

    document.getElementById('longBtn').onclick = () => {
        state.direction = 'long';
        navigate('checklist');
    };

    document.getElementById('shortBtn').onclick = () => {
        state.direction = 'short';
        navigate('checklist');
    };
}
