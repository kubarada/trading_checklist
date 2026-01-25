import { navigate } from '../app.js';
import { fetchTrades } from '../services/historyService.js';
import { questions } from '../data/questions.js';

/* ===== TABLE STATE ===== */
const tableState = {
    filters: {
        instrument: '',
        session: '',
        result: ''
    },
    sort: {
        column: 'trade_datetime',
        direction: 'desc'
    }
};

/* ===== HELPERS ===== */
function questionIdToText(id) {
    const all = [
        ...Object.values(questions.long).flatMap(s => s.items),
        ...Object.values(questions.short).flatMap(s => s.items)
    ];
    return all.find(q => q.id === id)?.text ?? id;
}

function renderRows(trades) {
    return trades.map(t => {
        const questionsText = t.checked_questions
            .map(id => `<li>${questionIdToText(id)}</li>`)
            .join('');

        return `
            <tr>
                <td>${t.instrument}</td>
                <td>${t.direction.toUpperCase()}</td>
                <td>${t.session.toUpperCase()}</td>
                <td>${t.checklist_score}%</td>
                <td>${t.grade}</td>
                <td>${t.result ?? 'LIVE'}</td>
                <td>
                    <div class="questions-tooltip">
                        <span class="q-summary">
                            Questions (${t.checked_questions.length})
                        </span>

                        <div class="q-tooltip">
                            <ul>
                                ${questionsText}
                            </ul>
                        </div>
                    </div>
                </td>
                <td>${new Date(t.trade_datetime).toLocaleString('cs-CZ')}</td>
            </tr>
        `;
    }).join('');
}

function toggleSort(column) {
    if (tableState.sort.column === column) {
        tableState.sort.direction =
            tableState.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        tableState.sort.column = column;
        tableState.sort.direction = 'asc';
    }
}

/* ===== VIEW ===== */
export async function renderHistory(app) {
    app.innerHTML = `
        <div class="box wide">

            <h2>Historie tradů</h2>

            <table class="history-table">
                <thead>
                    <tr>
                        <th data-sort="instrument">Instrument</th>
                        <th>Směr</th>
                        <th data-sort="session">Session</th>
                        <th data-sort="checklist_score">Checklist</th>
                        <th data-sort="grade">Grade</th>
                        <th data-sort="result">Výsledek</th>
                        <th>Questions</th>
                        <th data-sort="trade_datetime">Datum</th>
                    </tr>
                    <tr class="filters">
                        <th><input data-filter="instrument" placeholder="EURUSD"></th>
                        <th></th>
                        <th><input data-filter="session" placeholder="london"></th>
                        <th></th>
                        <th></th>
                        <th><input data-filter="result" placeholder="WIN / LIVE"></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="rows">
                    <tr><td colspan="8">Načítám…</td></tr>
                </tbody>
            </table>

            <button class="action-btn backBtn" id="backBtn" style="margin-top:16px">
                ← Zpět na dashboard
            </button>
        </div>
    `;

    const rowsEl = document.getElementById('rows');

    async function load() {
        rowsEl.innerHTML = `<tr><td colspan="8">Načítám…</td></tr>`;
        const trades = await fetchTrades(tableState);
        rowsEl.innerHTML = trades.length
            ? renderRows(trades)
            : `<tr><td colspan="8">Žádná data</td></tr>`;
    }

    /* FILTERS */
    document.querySelectorAll('[data-filter]').forEach(input => {
        input.addEventListener('input', e => {
            tableState.filters[e.target.dataset.filter] = e.target.value;
            load();
        });
    });

    /* SORT */
    document.querySelectorAll('[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
            toggleSort(th.dataset.sort);
            load();
        };
    });

    document.getElementById('backBtn').onclick = () => {
        navigate('dashboard');
    };

    load();
}