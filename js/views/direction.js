import { navigate, state } from '../app.js';

/* ===== AVAILABLE INSTRUMENTS ===== */
const INSTRUMENTS = [
    { value: 'EURUSD', label: 'EUR / USD' },
    { value: 'XAUUSD', label: 'XAU / USD (Gold)' },
    { value: 'BTCUSD', label: 'BTC / USD' }
];

export function renderDirection(app) {
    const isLive = state.isLive ?? true;
    const selectedInstrument = state.instrument ?? INSTRUMENTS[0].value;

    app.innerHTML = `
        <div class="box">

            <!-- DIRECTION -->
            <div class="direction-wrapper compact">
                <button class="direction-btn small long" id="longBtn">LONG</button>
                <button class="direction-btn small short" id="shortBtn">SHORT</button>
            </div>

            <!-- MODE -->
            <div class="mode-info">
                <div class="mode-label" id="modeLabel">
                    ${isLive ? '🟢 LIVE TRADING' : '🟡 BACKTEST'}
                </div>

                <label class="switch">
                    <input type="checkbox" id="modeSwitch" ${isLive ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>

            <!-- INSTRUMENT -->
            <div class="instrument-box">
                <label class="instrument-label">
                    Obchodovaný instrument
                </label>

                <select id="instrumentSelect" class="instrument-select">
                    ${INSTRUMENTS.map(i =>
                        `<option value="${i.value}" ${i.value === selectedInstrument ? 'selected' : ''}>
                            ${i.label}
                        </option>`
                    ).join('')}
                </select>
            </div>

            <!-- BACK -->
            <button class="action-btn backBtn" id="backToDashboard">
                ← Zpět na dashboard
            </button>

        </div>
    `;

    /* ===== MODE SWITCH ===== */
    const modeSwitch = document.getElementById('modeSwitch');
    const modeLabel = document.getElementById('modeLabel');

    function updateMode() {
        state.isLive = modeSwitch.checked;
        modeLabel.textContent = state.isLive
            ? '🟢 LIVE TRADING'
            : '🟡 BACKTEST';
    }

    modeSwitch.onchange = updateMode;

    /* ===== INSTRUMENT ===== */
    const instrumentSelect = document.getElementById('instrumentSelect');
    state.instrument = selectedInstrument;

    instrumentSelect.onchange = () => {
        state.instrument = instrumentSelect.value;
    };

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
