import { state, navigate } from '../app.js';

/* ===== HELPERS ===== */
function formatDatetime(dt) {
    if (!dt) return '—';
    return dt.replace('T', ' ');
}

function getGrade(score) {
    if (score >= 95) return { label: 'A+ trade', className: 'grade-aplus' };
    if (score >= 90) return { label: 'A trade', className: 'grade-a' };
    return { label: 'B trade', className: 'grade-b' };
}

export function renderConfirmation(app) {
    const { label: gradeLabel, className: gradeClass } = getGrade(state.score);

    const isLive = state.isLive;
    const tradeDatetime = formatDatetime(state.tradeDatetime);

    app.innerHTML = `
        <div class="box">

            <h2>Rekapitulace tradu</h2>

            <!-- SUMMARY -->
            <div class="trade-summary">

                <p><strong>Instrument:</strong> ${state.instrument}</p>
                <p><strong>Směr:</strong> ${state.direction.toUpperCase()}</p>
                <p><strong>Režim:</strong> ${isLive ? 'LIVE TRADING' : 'BACKTEST'}</p>
                <p><strong>Datum & čas:</strong> ${tradeDatetime}</p>
                <p><strong>Checklist:</strong> ${state.score} %</p>

                <div class="trade-grade ${gradeClass}">
                    Ohodnocení: <b>${gradeLabel}</b>
                </div>
            </div>

            ${
                !isLive
                    ? `
                <!-- BACKTEST RESULT -->
                <div class="backtest-result">
                    <p><strong>Výsledek backtestu</strong></p>

                    <div class="result-buttons">
                        <button class="result-btn win" data-result="WIN">WIN</button>
                        <button class="result-btn be" data-result="BE">BE</button>
                        <button class="result-btn loss" data-result="LOSS">LOSS</button>
                    </div>
                </div>
                `
                    : ''
            }

            <!-- ACTIONS -->
            <button class="action-btn tradeBtn" id="finishBtn" ${
                !isLive ? 'disabled' : ''
            }>
                Dokončit trade
            </button>
        </div>
    `;

    /* ===== BACKTEST RESULT HANDLING ===== */
    if (!isLive) {
        const buttons = document.querySelectorAll('.result-btn');
        const finishBtn = document.getElementById('finishBtn');

        buttons.forEach(btn => {
            btn.onclick = () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                state.tradeResult = btn.dataset.result;
                finishBtn.disabled = false;
            };
        });
    }

    /* ===== FINISH ===== */
    document.getElementById('finishBtn').onclick = () => {
        if (!isLive && !state.tradeResult) return;

        // tady později:
        // saveTradeToSupabase(state)

        // reset minimálního stavu
        state.direction = null;
        state.score = null;

        navigate('dashboard');
    };
}
