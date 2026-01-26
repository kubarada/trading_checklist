import { state, navigate } from '../app.js';
import { questions } from '../data/questions.js';

const supabase = window.supabase;

/* ===== INSTRUMENTS ===== */
const INSTRUMENTS = [
    { value: 'EURUSD', label: 'EUR / USD' },
    { value: 'XAUUSD', label: 'XAU / USD (Gold)' },
    { value: 'BTCUSD', label: 'BTC / USD' }
];

/* ===== SESSION LOGIC ===== */
function getSessionLabel(datetime) {
    if (!datetime) return { label: 'OFF SESSION', className: 'off' };

    const hour = new Date(datetime).getHours();

    if (hour >= 2 && hour < 6) return { label: 'ASIA SESSION', className: 'asia' };
    if (hour >= 9 && hour < 14) return { label: 'LONDON SESSION', className: 'london' };
    if (hour >= 14 && hour < 22) return { label: 'NY SESSION', className: 'ny' };

    return { label: 'OFF SESSION', className: 'off' };
}

export function renderEdit(app) {
    const trade = state.editingTrade;

    /* GUARD */
    if (!trade) {
        navigate('history');
        return;
    }

    const checklist = questions[trade.direction];
    const session = getSessionLabel(trade.trade_datetime);

    app.innerHTML = `
        <div class="box wide edit-mode">

            <!-- HEADER -->
            <div class="checklist-header">
                <div class="checklist-meta">
                    <span class="meta-badge" id="instrumentBadge">${trade.instrument}</span>

                    <span class="meta-badge ${trade.is_live ? 'live' : 'backtest'}">
                        ${trade.is_live ? 'LIVE TRADING' : 'BACKTEST'}
                    </span>

                    <span class="meta-badge session ${session.className}">
                        ${session.label}
                    </span>

                    <span class="meta-badge">EDIT</span>
                </div>

                <h2>
                    ✏️ Edit ${trade.direction === 'long' ? 'LONG' : 'SHORT'} trade
                </h2>
            </div>

            <!-- META -->
            <div class="checklist-column">

                <!-- INSTRUMENT -->
                <div class="instrument-box">
                    <label class="instrument-label">
                        Instrument
                    </label>
                    <select id="instrumentSelect" class="instrument-select">
                        ${INSTRUMENTS.map(i => `
                            <option value="${i.value}" ${i.value === trade.instrument ? 'selected' : ''}>
                                ${i.label}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- DATETIME -->
                <div class="instrument-box">
                    <label class="instrument-label">
                        Datum a čas obchodu
                    </label>
                    <input
                        type="datetime-local"
                        id="tradeDatetime"
                        class="instrument-select datetime-input"
                        value="${trade.trade_datetime.slice(0, 16)}"
                        step="60"
                    />
                </div>

                <!-- RESULT + LIVE -->
                <div class="instrument-box">
                    <div class="mode-info">

                        <!-- RESULT -->
                        <div>
                            <div class="instrument-label">Výsledek</div>
                            <div class="result-buttons">
                                ${['WIN', 'BE', 'LOSS'].map(r => `
                                    <button
                                        type="button"
                                        class="result-btn ${r.toLowerCase()} ${trade.result === r ? 'active' : ''}"
                                        data-result="${r}"
                                    >
                                        ${r}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- LIVE / BACKTEST -->
                        <div>
                            <div class="instrument-label">Live / Backtest</div>
                            <label class="switch">
                                <input
                                    type="checkbox"
                                    id="isLive"
                                    ${trade.is_live ? 'checked' : ''}
                                >
                                <span class="slider"></span>
                            </label>
                        </div>

                    </div>
                </div>

            </div>

            <!-- CHECKLIST -->
            <div class="checklist-column">
                <div class="checklist-grid" id="editChecklistGrid"></div>
            </div>

            <!-- ACTIONS -->
            <button class="action-btn tradeBtn" id="saveBtn">
                Uložit změny
            </button>

            <button class="action-btn backBtn" id="backBtn">
                Zpět
            </button>

        </div>
    `;

    /* ===== RENDER CHECKLIST (STEJNĚ JAKO checklist.js) ===== */
    const grid = document.getElementById('editChecklistGrid');

    Object.values(checklist).forEach(section => {
        const col = document.createElement('div');
        col.className = 'checklist-column';

        col.innerHTML = `
            <h3 class="checklist-title">${section.title}</h3>
            ${section.items.map(q => `
                <label>
                    <input
                        type="checkbox"
                        data-id="${q.id}"
                        ${trade.checked_questions.includes(q.id) ? 'checked' : ''}
                    >
                    ${q.text}
                </label>
            `).join('')}
        `;

        grid.appendChild(col);
    });

    /* ===== SESSION UPDATE ===== */
    const dateInput = document.getElementById('tradeDatetime');
    const sessionBadge = document.querySelector('.meta-badge.session');

    function updateSession() {
        const s = getSessionLabel(dateInput.value);
        sessionBadge.textContent = s.label;
        sessionBadge.className = `meta-badge session ${s.className}`;
    }

    dateInput.onchange = updateSession;

    /* ===== INSTRUMENT BADGE UPDATE ===== */
    const instrumentSelect = document.getElementById('instrumentSelect');
    const instrumentBadge = document.getElementById('instrumentBadge');

    instrumentSelect.onchange = () => {
        instrumentBadge.textContent = instrumentSelect.value;
    };

    /* ===== RESULT BUTTONS ===== */
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.onclick = () => {
            document
                .querySelectorAll('.result-btn')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    /* ===== BACK ===== */
    document.getElementById('backBtn').onclick = () => {
        state.editingTrade = null;
        navigate('history');
    };

    /* ===== SAVE ===== */
    document.getElementById('saveBtn').onclick = async () => {
        const checked_questions = [
            ...document.querySelectorAll(
                '#editChecklistGrid input:checked'
            )
        ].map(cb => cb.dataset.id);

        const total = document.querySelectorAll(
            '#editChecklistGrid input[type="checkbox"]'
        ).length;

        const checklist_score = Math.round(
            (checked_questions.length / total) * 100
        );

        let grade = 'B';
        if (checklist_score >= 95) grade = 'A+';
        else if (checklist_score >= 90) grade = 'A';

        const result =
            document.querySelector('.result-btn.active')
                ?.dataset.result ?? null;

        /* žádná konverze času */
        const trade_datetime = dateInput.value;

        const is_live = document.getElementById('isLive').checked;
        const sessionValue = getSessionLabel(trade_datetime).label;
        const instrument = instrumentSelect.value;

        const { error } = await supabase
            .from('trades')
            .update({
                instrument,
                checked_questions,
                checklist_score,
                grade,
                result,
                trade_datetime,
                is_live,
                session: sessionValue
            })
            .eq('id', trade.id);

        if (error) {
            alert(error.message);
            return;
        }

        state.editingTrade = null;
        navigate('history');
    };
}
