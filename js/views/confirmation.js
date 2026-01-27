import { state, navigate } from '../app.js';
import { saveTrade } from '../services/tradeService.js';
import { uploadTradeScreenshot } from '../services/uploadService.js';

/* ===== HELPERS ===== */
function formatDatetime(dt) {
    if (!dt) return '—';
    return dt.replace('T', ' ');
}

function getGrade(score) {
    if (score >= 95) return { label: 'A+ trade', value: 'A+' };
    if (score >= 90) return { label: 'A trade', value: 'A' };
    return { label: 'B trade', value: 'B' };
}

/* ===== TOAST ===== */
function showSuccessToast(text) {
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.textContent = text;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 1200);
}

export function renderConfirmation(app) {
    const { label: gradeLabel } = getGrade(state.score);
    const isLive = state.isLive;

    let selectedFile = null;

    app.innerHTML = `
        <div class="box">

            <h2>Rekapitulace tradu</h2>

            <!-- SUMMARY -->
            <div class="trade-summary">
                <p><strong>Instrument:</strong> ${state.instrument}</p>
                <p><strong>Směr:</strong> ${state.direction.toUpperCase()}</p>
                <p><strong>Režim:</strong> ${isLive ? 'LIVE TRADING' : 'BACKTEST'}</p>
                <p><strong>Datum & čas:</strong> ${formatDatetime(state.tradeDatetime)}</p>
                <p><strong>Checklist:</strong> ${state.score} %</p>

                <div class="trade-grade">
                    Ohodnocení: <b>${gradeLabel}</b>
                </div>
            </div>

            <!-- SCREENSHOT UPLOAD -->
            <div class="screenshot-upload">
                <div class="screenshot-header">
                    <span class="screenshot-label">
                        📷 Screenshot (volitelné)
                        <span class="screenshot-hint"></span>
                    </span>

                    <input
                        type="file"
                        id="screenshotInput"
                        accept="image/*"
                    />
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
            <div class="confirmation-actions">
                <button
                    class="action-btn backBtn"
                    id="backToChecklistBtn"
                >
                    Zpět
                </button>

                <button
                    class="action-btn tradeBtn"
                    id="finishBtn"
                    ${!isLive ? 'disabled' : ''}
                >
                    Uložit trade
                </button>
            </div>
        </div>
    `;

    /* ===== FILE HANDLING ===== */
    const screenshotInput = document.getElementById('screenshotInput');
    screenshotInput.onchange = e => {
        selectedFile = e.target.files[0] || null;
    };

    /* ===== BACK BUTTON ===== */
    document.getElementById('backToChecklistBtn').onclick = () => {
        navigate('checklist');
    };

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

    /* ===== SAVE TRADE + UPLOAD SCREENSHOT ===== */
    document.getElementById('finishBtn').onclick = async () => {
        if (!isLive && !state.tradeResult) return;

        let tradeId;

        try {
            tradeId = await saveTrade(state);
        } catch (err) {
            console.error(err);
            alert('Chyba při ukládání tradu');
            return;
        }

        try {
            if (selectedFile) {
                const {
                    data: { user }
                } = await window.supabase.auth.getUser();

                await uploadTradeScreenshot({
                    file: selectedFile,
                    tradeId,
                    userId: user.id
                });
            }
        } catch (err) {
            console.error(err);
            alert('Trade uložen, ale screenshot se nepodařilo nahrát');
        }

        showSuccessToast('Trade byl uložen úspěšně');

        /* ===== RESET STATE ===== */
        state.direction = null;
        state.score = null;
        state.tradeResult = null;
        state.checkedQuestions = null;

        screenshotInput.disabled = true;

        setTimeout(() => {
            navigate('dashboard');
        }, 1500);
    };
}
