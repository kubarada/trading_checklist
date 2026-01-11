import { navigate, state } from '../app.js';

/* ===== AVAILABLE INSTRUMENTS ===== */
const INSTRUMENTS = [
    { value: 'EURUSD', label: 'EUR / USD' },
    { value: 'XAUUSD', label: 'XAU / USD (Gold)' },
    { value: 'BTCUSD', label: 'BTC / USD' }
];

/* ===== HELPERS ===== */
function getNowLocalDatetime() {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

export function renderDirection(app) {
    const isLive = state.isLive ?? true;
    const selectedInstrument = state.instrument ?? INSTRUMENTS[0].value;

    // default datetime = now (only first time)
    const datetimeValue = state.tradeDatetime ?? getNowLocalDatetime();
    state.tradeDatetime = datetimeValue;

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
                <label class="instrument-label">Obchodovaný instrument</label>
                <select id="instrumentSelect" class="instrument-select">
                    ${INSTRUMENTS.map(i =>
                        `<option value="${i.value}" ${i.value === selectedInstrument ? 'selected' : ''}>
                            ${i.label}
                        </option>`
                    ).join('')}
                </select>
            </div>

            <!-- DATETIME -->
            <div class="instrument-box">
                <label class="instrument-label">Datum a čas obchodu</label>
                <input
                    type="datetime-local"
                    id="tradeDatetime"
                    class="instrument-select datetime-input"
                    value="${datetimeValue}"
                    step="60"
                />
            </div>

            <!-- BACK -->
            <button class="action-btn backBtn" id="backToDashboard">
                ← Zpět na dashboard
            </button>

        </div>
    `;

    /* ===== MODE ===== */
    const modeSwitch = document.getElementById('modeSwitch');
    const modeLabel = document.getElementById('modeLabel');

    modeSwitch.onchange = () => {
        state.isLive = modeSwitch.checked;
        modeLabel.textContent = state.isLive
            ? '🟢 LIVE TRADING'
            : '🟡 BACKTEST';
    };

    /* ===== INSTRUMENT ===== */
    document.getElementById('instrumentSelect').onchange = e => {
        state.instrument = e.target.value;
    };

    /* ===== DATETIME ===== */
    document.getElementById('tradeDatetime').onchange = e => {
        state.tradeDatetime = e.target.value;
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
