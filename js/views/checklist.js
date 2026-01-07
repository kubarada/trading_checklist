import { state, navigate } from '../app.js';
import { questions } from '../data/questions.js';

export function renderChecklist(app) {
    const qs = questions[state.direction];

    app.innerHTML = `
        <div class="box">
            <h2>${state.direction === 'long' ? '📈 LONG' : '📉 SHORT'} Checklist</h2>
            <div class="checklist" id="items"></div>
            <div id="result"></div>
            <button id="confirmBtn" class="action-btn tradeBtn" disabled>Vzít trade</button>
            <button class="action-btn backBtn" id="backBtn">Zpět</button>
        </div>
    `;

    const items = document.getElementById('items');
    qs.forEach(q => {
        items.innerHTML += `<label><input type="checkbox"> ${q}</label>`;
    });

    const checkboxes = items.querySelectorAll('input');
    const result = document.getElementById('result');
    const confirmBtn = document.getElementById('confirmBtn');

    function update() {
        const checked = [...checkboxes].filter(c => c.checked).length;
        result.textContent = `Splněno: ${checked} / ${checkboxes.length}`;
        confirmBtn.disabled = checked < (checkboxes.length-2);
    }

    checkboxes.forEach(cb => cb.onchange = update);

    document.getElementById('backBtn').onclick = () => navigate('direction');
    confirmBtn.onclick = () => navigate('confirmation');
}
