import { state, navigate } from '../app.js';

export function renderConfirmation(app) {
    app.innerHTML = `
        <div class="box">
            <h2>Adekvatně si trade zhodnotil a nevypadá to úplně v pítši. Ale ty máš stejně v pítši, víš co...</h2>
            <p>Směr: ${state.direction.toUpperCase()}</p>
            <button class="action-btn tradeBtn" id="resetBtn">Nový trade</button>
        </div>
    `;

    document.getElementById('resetBtn').onclick = () => {
        state.direction = null;
        navigate('direction');
    };
}
