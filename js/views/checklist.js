import { state, navigate } from '../app.js';
import { questions } from '../data/questions.js';

export function renderChecklist(app) {
    const qs = questions[state.direction];

    const modeLabel = state.isLive ? '🟢 LIVE TRADING' : '🟡 BACKTEST';
    const instrumentLabel = state.instrument ?? '—';

    app.innerHTML = `
        <div class="box">

            <!-- HEADER -->
            <div class="checklist-header">
            <h2>
                    ${state.direction === 'long' ? '📈 LONG' : '📉 SHORT'} Checklist
            </h2>

                <div class="checklist-meta">
                    <span class="meta-badge">${instrumentLabel}</span>
                    <span class="meta-badge ${state.isLive ? 'live' : 'backtest'}">
                        ${modeLabel}
                    </span>
                </div>

                
            </div>

            <!-- PROGRESS BAR -->
            <div class="progress-wrapper">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">0 %</div>
            </div>

            <!-- QUESTIONS -->
            <div class="checklist" id="items"></div>
            <div id="result" class="result"></div>

            <!-- ACTIONS -->
            <button id="confirmBtn" class="action-btn tradeBtn" disabled>
                Vzít trade
            </button>
            <button class="action-btn backBtn" id="backBtn">
                Zpět
            </button>
        </div>
    `;

    /* ===== QUESTIONS ===== */
    const items = document.getElementById('items');
    qs.forEach(q => {
        items.innerHTML += `
            <label>
                <input type="checkbox"> ${q}
            </label>
        `;
    });

    const checkboxes = items.querySelectorAll('input');
    const confirmBtn = document.getElementById('confirmBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    function update() {
        const total = checkboxes.length;
        const checked = [...checkboxes].filter(c => c.checked).length;
        const percent = Math.round((checked / total) * 100);

        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${percent} %`;

        confirmBtn.disabled = percent < 80;
    }

    checkboxes.forEach(cb => cb.onchange = update);

    /* ===== ACTIONS ===== */
    document.getElementById('backBtn').onclick = () => {
        navigate('direction');
    };

    confirmBtn.onclick = () => {
        const total = checkboxes.length;
        const checked = [...checkboxes].filter(c => c.checked).length;

        state.score = Math.round((checked / total) * 100);
        navigate('confirmation');
    };
}
