import { navigate } from '../app.js';
import { fetchTrades } from '../services/historyService.js';
import { questions } from '../data/questions.js';

/* ===== HELPERS ===== */
function questionIdToText(id) {
    const allQuestions = [
        ...Object.values(questions.long).flatMap(section => section.items),
        ...Object.values(questions.short).flatMap(section => section.items)
    ];

    const found = allQuestions.find(q => q.id === id);
    return found ? found.text : id;
}

function renderTradeRow(trade) {
    return `
        <tr>
            <td>${trade.instrument}</td>
            <td>${trade.direction.toUpperCase()}</td>
            <td>${trade.is_live ? 'LIVE' : 'BACKTEST'}</td>
            <td>${trade.session.toUpperCase()}</td>
            <td>${trade.checklist_score} %</td>
            <td>${trade.grade}</td>
            <td>${trade.result ?? '—'}</td>
            <td>${new Date(trade.trade_datetime).toLocaleString('cs-CZ')}</td>
        </tr>
        <tr class="details">
            <td colspan="8">
                <div class="questions">
                    <strong>Splněné otázky:</strong>
                    ${trade.checked_questions
                        .map(id => `<span class="q-badge">${questionIdToText(id)}</span>`)
                        .join('')}
                </div>
            </td>
        </tr>
    `;
}

/* ===== VIEW ===== */
export async function renderHistory(app) {
    app.innerHTML = `
        <div class="box wide">

            <h2>Historie tradů</h2>

            <!-- FILTERS -->
            <div class="history-filters">
                <select id="fInstrument">
                    <option value="">Instrument</option>
                    <option value="EURUSD">EURUSD</option>
                    <option value="XAUUSD">XAUUSD</option>
                    <option value="BTCUSD">BTCUSD</option>
                </select>

                <select id="fMode">
                    <option value="">Režim</option>
                    <option value="true">LIVE</option>
                    <option value="false">BACKTEST</option>
                </select>

                <select id="fResult">
                    <option value="">Výsledek</option>
                    <option value="WIN">WIN</option>
                    <option value="BE">BE</option>
                    <option value="LOSS">LOSS</option>
                </select>

                <button id="applyFilters" class="action-btn tradeBtn">
                    Filtrovat
                </button>
            </div>

            <!-- TABLE -->
            <div class="table-wrap">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Instrument</th>
                            <th>Směr</th>
                            <th>Režim</th>
                            <th>Session</th>
                            <th>Checklist</th>
                            <th>Grade</th>
                            <th>Výsledek</th>
                            <th>Datum</th>
                        </tr>
                    </thead>
                    <tbody id="historyRows">
                        <tr>
                            <td colspan="8">Načítám…</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- BACK BUTTON -->
            <button
                id="backToDashboard"
                class="action-btn backBtn"
                style="margin-top: 16px;"
            >
                ← Zpět na dashboard
            </button>

        </div>
    `;

    const rowsEl = document.getElementById('historyRows');

    async function loadTrades() {
        rowsEl.innerHTML = `
            <tr>
                <td colspan="8">Načítám…</td>
            </tr>
        `;

        const filters = {
            instrument: document.getElementById('fInstrument').value || null,
            is_live: document.getElementById('fMode').value,
            result: document.getElementById('fResult').value || null
        };

        try {
            const trades = await fetchTrades(filters);

            if (!trades.length) {
                rowsEl.innerHTML = `
                    <tr>
                        <td colspan="8">Žádné trady nenalezeny</td>
                    </tr>
                `;
                return;
            }

            rowsEl.innerHTML = trades
                .map(renderTradeRow)
                .join('');
        } catch (err) {
            console.error(err);
            rowsEl.innerHTML = `
                <tr>
                    <td colspan="8">Chyba při načítání dat</td>
                </tr>
            `;
        }
    }

    document.getElementById('applyFilters').onclick = loadTrades;

    document.getElementById('backToDashboard').onclick = () => {
        navigate('dashboard');
    };

    /* ===== INITIAL LOAD ===== */
    loadTrades();
}
