import { state, navigate } from '../app.js';
import { questions } from '../data/questions.js';

/* ===== SESSION LOGIC ===== */
function getSessionLabel(datetime) {
    if (!datetime) return { label: '—', className: '' };

    const hour = new Date(datetime).getHours();

    if (hour >= 2 && hour < 6) {
        return { label: 'ASIA SESSION', className: 'asia' };
    }

    if (hour >= 9 && hour < 14) {
        return { label: 'LONDON SESSION', className: 'london' };
    }

    if (hour >= 14 && hour < 22) {
        return { label: 'NY SESSION', className: 'ny' };
    }

    return { label: 'OFF SESSION', className: 'off' };
}

export function renderChecklist(app) {
    const checklist = questions[state.direction];
    const session = getSessionLabel(state.tradeDatetime);

    app.innerHTML = `
        <div class="box wide">

            <!-- HEADER -->
            <div class="checklist-header">
                <div class="checklist-meta">
                    <span class="meta-badge">${state.instrument}</span>

                    <span class="meta-badge ${state.isLive ? 'live' : 'backtest'}">
                        ${state.isLive ? 'LIVE TRADING' : 'BACKTEST'}
                    </span>

                    <span class="meta-badge session ${session.className}">
                        ${session.label}
                    </span>
                </div>

                <h2>
                    ${state.direction === 'long' ? '📈 LONG' : '📉 SHORT'} Checklist
                </h2>
            </div>

            <!-- PROGRESS -->
            <div class="progress-wrapper">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">0 %</div>
            </div>

            <!-- CHECKLIST GRID -->
            <div class="checklist-grid" id="checklistGrid"></div>

            <!-- ACTIONS -->
            <button id="confirmBtn" class="action-btn tradeBtn" disabled>
                Vzít trade
            </button>
            <button class="action-btn backBtn" id="backBtn">
                Zpět
            </button>
        </div>
    `;

    /* ===== RENDER CHECKLIST COLUMNS ===== */
    const grid = document.getElementById('checklistGrid');

    Object.values(checklist).forEach(section => {
        const col = document.createElement('div');
        col.className = 'checklist-column';

        col.innerHTML = `
            <h3 class="checklist-title">${section.title}</h3>
            ${section.items
                .map(
                    q => `
                <label>
                    <input
                        type="checkbox"
                        data-id="${q.id}"
                    >
                    ${q.text}
                </label>
            `
                )
                .join('')}
        `;

        grid.appendChild(col);
    });

    /* ===== CHECKLIST LOGIC ===== */
    const checkboxes = grid.querySelectorAll('input[type="checkbox"]');
    const confirmBtn = document.getElementById('confirmBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    function update() {
        const total = checkboxes.length;
        const checked = [...checkboxes].filter(cb => cb.checked).length;
        const percent = Math.round((checked / total) * 100);

        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${percent} %`;

        confirmBtn.disabled = percent < 1;
    }

    checkboxes.forEach(cb => {
        cb.onchange = update;
    });

    /* ===== ACTIONS ===== */
    document.getElementById('backBtn').onclick = () => {
        navigate('direction');
    };

    confirmBtn.onclick = () => {
        const total = checkboxes.length;
        const checked = [...checkboxes].filter(cb => cb.checked);

        state.score = Math.round((checked.length / total) * 100);

        // ✅ ULOŽENÍ ZAŠKRTNUTÝCH QUESTIONS (ID)
        state.checkedQuestions = checked.map(cb => cb.dataset.id);

        navigate('confirmation');
    };
}
