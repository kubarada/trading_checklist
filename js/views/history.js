import { navigate, state } from '../app.js';
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

let currentTrades = [];

/* ===== HELPERS ===== */
function questionIdToText(id) {
    const all = [
        ...Object.values(questions.long).flatMap(s => s.items),
        ...Object.values(questions.short).flatMap(s => s.items)
    ];
    return all.find(q => q.id === id)?.text ?? id;
}

function renderRows(trades) {
    return trades.map(t => `
        <tr>
            <td>${t.instrument}</td>
            <td>${t.direction.toUpperCase()}</td>
            <td>
                <span class="meta-badge ${t.is_live ? 'live' : 'backtest'}">
                    ${t.is_live ? 'LIVE' : 'BACKTEST'}
                </span>
            </td>
            <td>${t.session.toUpperCase()}</td>
            <td>${t.checklist_score}%</td>
            <td>${t.grade}</td>
            <td>${t.result ?? 'LIVE'}</td>
            <td>
                <div class="questions-tooltip">
                    <span class="q-summary">
                        Questions (${t.checked_questions.length})
                    </span>
                </div>
            </td>
            <td>
                ${new Date(
                    t.trade_datetime ?? t.created_at
                ).toLocaleString('cs-CZ')}
            </td>
            <td>
                <button class="edit-btn" data-id="${t.id}">
                    ✏️
                </button>
            </td>
        </tr>
    `).join('');
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
                        <th>Mode</th>
                        <th data-sort="session">Session</th>
                        <th data-sort="checklist_score">Checklist</th>
                        <th data-sort="grade">Grade</th>
                        <th data-sort="result">Výsledek</th>
                        <th>Questions</th>
                        <th data-sort="trade_datetime">Datum</th>
                        <th>Edit</th>
                    </tr>
                    <tr class="filters">
                        <th><input data-filter="instrument"></th>
                        <th></th>
                        <th><input data-filter="session"></th>
                        <th></th>
                        <th></th>
                        <th><input data-filter="result"></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="rows">
                    <tr><td colspan="9">Načítám…</td></tr>
                </tbody>
            </table>

            <button class="action-btn backBtn" id="backBtn" style="margin-top:16px">
                ← Zpět
            </button>
        </div>
    `;

    const rowsEl = document.getElementById('rows');

    async function load() {
        const trades = await fetchTrades(tableState);
        currentTrades = trades;

        rowsEl.innerHTML = trades.length
            ? renderRows(trades)
            : `<tr><td colspan="9">Žádná data</td></tr>`;
    }

    /* FILTERS */
    document.querySelectorAll('[data-filter]').forEach(input => {
        input.oninput = e => {
            tableState.filters[e.target.dataset.filter] = e.target.value;
            load();
        };
    });

    /* SORT */
    document.querySelectorAll('[data-sort]').forEach(th => {
        th.onclick = () => {
            toggleSort(th.dataset.sort);
            load();
        };
    });

    /* EDIT */
    rowsEl.onclick = e => {
        const btn = e.target.closest('.edit-btn');
        if (!btn) return;

        const trade = currentTrades.find(
            t => t.id === btn.dataset.id
        );
        if (!trade) return;

        state.editingTrade = { ...trade };
        navigate('edit');
    };

    document.getElementById('backBtn').onclick = () => {
        navigate('dashboard');
    };

    load();
}
