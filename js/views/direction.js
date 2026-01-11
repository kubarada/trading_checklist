import { navigate, state } from '../app.js';

export function renderDirection(app) {
    const isLive = state.isLive ?? true;

    app.innerHTML = `
        <div class="box">

            <!-- DIRECTION -->
            <div class="direction-wrapper compact">
                <button class="direction-btn small long" id="longBtn">LONG</button>
                <button class="direction-btn small short" id="shortBtn">SHORT</button>
            </div>

            <!-- MODE INFO -->
            <div class="mode-info">
                <div class="mode-label" id="modeLabel">
                    ${isLive ? '🟢 LIVE TRADING' : '🟡 BACKTEST'}
                </div>

                <label class="switch">
                    <input type="checkbox" id="modeSwitch" ${isLive ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>

            <!-- BACK -->
            <button class="action-btn backBtn" id="backToDashboard">
                ← Zpět na dashboard
            </button>

        </div>
    `;

    /* ===== MODE SWITCH ===== */
    const switchEl = document.getElementById('modeSwitch');
    const labelEl = document.getElementById('modeLabel');

    function updateMode() {
        state.isLive = switchEl.checked;
        labelEl.textContent = switchEl.checked
            ? '🟢 LIVE TRADING'
            : '🟡 BACKTEST';
    }

    switchEl.onchange = updateMode;

    /* ===== DIRECTION ===== */
    document.getElementById('longBtn').onclick = () => {
        state.direction = 'long';
        navigate('checklist');
    };

    document.getElementById('shortBtn').onclick = () => {
        state.direction = 'short';
        navigate('checklist');
    };

    /* ===== BACK ===== */
    document.getElementById('backToDashboard').onclick = () => {
        navigate('dashboard');
    };
}
