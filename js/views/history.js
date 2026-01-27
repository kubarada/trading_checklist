import { navigate, state } from '../app.js';
import { fetchTrades } from '../services/historyService.js';
import { questions } from '../data/questions.js';

const supabase = window.supabase;

/* =========================
   TABLE STATE
   ========================= */
const tableState = {
    filters: {
        instrument: '',
        direction: '',
        mode: '',
        session: '',
        grade: '',
        result: '',
        questions: '',
        date: ''
    },
    sort: {
        column: 'trade_datetime',
        direction: 'desc'
    }
};

/* =========================
   LOCAL CACHE
   ========================= */
let currentTrades = [];

/* =========================
   HELPERS
   ========================= */
function questionIdToText(id) {
    const all = [
        ...Object.values(questions.long).flatMap(s => s.items),
        ...Object.values(questions.short).flatMap(s => s.items)
    ];
    return all.find(q => q.id === id)?.text ?? id;
}

function matches(value, filter) {
    if (!filter) return true;
    return String(value ?? '')
        .toLowerCase()
        .includes(filter.toLowerCase());
}

function tradeMatchesFilters(trade) {
    const questionsText = (trade.checked_questions ?? [])
        .map(id => questionIdToText(id))
        .join(' ');

    return (
        matches(trade.instrument, tableState.filters.instrument) &&
        matches(trade.direction, tableState.filters.direction) &&
        matches(trade.is_live ? 'live' : 'backtest', tableState.filters.mode) &&
        matches(trade.session, tableState.filters.session) &&
        matches(trade.grade, tableState.filters.grade) &&
        matches(trade.result ?? 'live', tableState.filters.result) &&
        matches(questionsText, tableState.filters.questions) &&
        matches(trade.trade_datetime, tableState.filters.date)
    );
}

/* =========================
   SORT (CLIENT SIDE)
   ========================= */
function sortTrades(trades) {
    const { column, direction } = tableState.sort;

    return [...trades].sort((a, b) => {
        let v1 = a[column];
        let v2 = b[column];

        /* ===== SPECIAL CASE: MODE ===== */
        if (column === 'mode') {
            v1 = a.is_live ? 'live' : 'backtest';
            v2 = b.is_live ? 'live' : 'backtest';
        }

        /* ===== SPECIAL CASE: RESULT ===== */
        if (column === 'result') {
            const order = {
                WIN: 3,
                BE: 2,
                LOSS: 1,
                null: 0
            };

            v1 = order[a.result ?? 'null'];
            v2 = order[b.result ?? 'null'];
        }

        /* ===== NULL HANDLING ===== */
        if (v1 == null) return 1;
        if (v2 == null) return -1;
        if (v1 === v2) return 0;

        /* ===== DEFAULT COMPARE ===== */
        return direction === 'asc'
            ? v1 > v2 ? 1 : -1
            : v1 < v2 ? 1 : -1;
    });
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

function sortArrow(column) {
    if (tableState.sort.column !== column) return '';
    return tableState.sort.direction === 'asc' ? ' ▲' : ' ▼';
}

/* =========================
   SCREENSHOT MODAL
   ========================= */
async function openScreenshot(path) {
    const { data, error } = await supabase
        .storage
        .from('trade-screenshots')
        .createSignedUrl(path, 300);

    if (error) {
        alert('Nelze načíst screenshot');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <img src="${data.signedUrl}" />
        </div>
    `;

    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
}

/* =========================
   MINI STATS
   ========================= */
function computeStats(trades) {
    const total = trades.length;
    if (!total) {
        return { total: 0, winRate: 0, avgChecklist: 0, gradeRatio: 0 };
    }

    const wins = trades.filter(t => t.result === 'WIN').length;
    const checklistSum = trades.reduce((s, t) => s + (t.checklist_score ?? 0), 0);
    const goodGrades = trades.filter(t => t.grade === 'A' || t.grade === 'A+').length;

    return {
        total,
        winRate: Math.round((wins / total) * 100),
        avgChecklist: Math.round(checklistSum / total),
        gradeRatio: Math.round((goodGrades / total) * 100)
    };
}

/* =========================
   HEADER
   ========================= */
function renderHeader() {
    return `
        <thead>
            <tr>
                <th data-sort="instrument">Instrument${sortArrow('instrument')}</th>
                <th data-sort="direction">Směr${sortArrow('direction')}</th>
                <th data-sort="mode">Mode${sortArrow('mode')}</th>
                <th data-sort="session">Session${sortArrow('session')}</th>
                <th data-sort="checklist_score">Checklist${sortArrow('checklist_score')}</th>
                <th data-sort="grade">Grade${sortArrow('grade')}</th>
                <th data-sort="result">Výsledek${sortArrow('result')}</th>
                <th>Questions</th>
                <th data-sort="trade_datetime">Datum${sortArrow('trade_datetime')}</th>
                <th>📷</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
            <tr class="filters">
                <th><input data-filter="instrument"></th>
                <th><input data-filter="direction"></th>
                <th><input data-filter="mode"></th>
                <th><input data-filter="session"></th>
                <th></th>
                <th><input data-filter="grade"></th>
                <th><input data-filter="result"></th>
                <th><input data-filter="questions"></th>
                <th><input data-filter="date"></th>
                <th></th>
                <th></th>
                <th></th>
            </tr>
        </thead>
    `;
}

/* =========================
   ROWS
   ========================= */
function renderRows(trades) {
    return trades.map(t => `
        <tr>
            <td>${t.instrument}</td>
            <td>${t.direction.toUpperCase()}</td>
            <td>${t.is_live ? 'LIVE' : 'BACKTEST'}</td>
            <td>${t.session ?? '—'}</td>
            <td>${t.checklist_score} %</td>
            <td>${t.grade ?? '—'}</td>
            <td>${t.result ?? 'LIVE'}</td>
            <td>
                <div class="questions-tooltip">
                    <span class="q-summary">
                        Questions (${t.checked_questions?.length ?? 0})
                    </span>
                    <div class="q-tooltip">
                        <ul>
                            ${(t.checked_questions ?? [])
                                .map(id => `<li>${questionIdToText(id)}</li>`)
                                .join('')}
                        </ul>
                    </div>
                </div>
            </td>
            <td>${new Date(t.trade_datetime).toLocaleString('cs-CZ')}</td>
            <td>
                ${
                    t.screenshot_path
                        ? `<button class="screenshot-btn" data-path="${t.screenshot_path}">📷</button>`
                        : ''
                }
            </td>
            <td><button class="edit-btn" data-id="${t.id}">✏️</button></td>
            <td><button class="delete-btn" data-id="${t.id}">🗑️</button></td>
        </tr>
    `).join('');
}

/* =========================
   VIEW
   ========================= */
export async function renderHistory(app) {
    app.innerHTML = `
        <div class="box wide">
            <h2>Historie tradů</h2>

            <div id="miniStats" style="
                margin: 6px 0 12px;
                font-size: 0.85rem;
                color: var(--muted);
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
            "></div>

            <div class="table-wrap">
                <table class="history-table">
                    ${renderHeader()}
                    <tbody id="rows">
                        <tr><td colspan="12">Načítám…</td></tr>
                    </tbody>
                </table>
            </div>

            <button class="action-btn backBtn" id="backBtn" style="margin-top:16px">
                ← Zpět na dashboard
            </button>
        </div>
    `;

    const table = document.querySelector('.history-table');
    const rowsEl = document.getElementById('rows');
    const statsEl = document.getElementById('miniStats');

    async function loadRows() {
        const trades = await fetchTrades(tableState); // ⬅️ FIX
        currentTrades = trades;

        const filtered = trades.filter(tradeMatchesFilters);
        const sorted = sortTrades(filtered);

        const stats = computeStats(sorted);
        statsEl.innerHTML = `
            <span>Trades: <strong>${stats.total}</strong></span>
            <span>Win rate: <strong>${stats.winRate} %</strong></span>
            <span>Avg checklist: <strong>${stats.avgChecklist} %</strong></span>
            <span>A / A+: <strong>${stats.gradeRatio} %</strong></span>
        `;

        rowsEl.innerHTML = sorted.length
            ? renderRows(sorted)
            : `<tr><td colspan="12">Žádná data</td></tr>`;
    }

    /* FILTER EVENTS */
    document.querySelectorAll('[data-filter]').forEach(input => {
        input.oninput = e => {
            tableState.filters[e.target.dataset.filter] = e.target.value;
            loadRows();
        };
    });

    /* SORT EVENTS */
    document.querySelectorAll('[data-sort]').forEach(th => {
        th.onclick = () => {
            toggleSort(th.dataset.sort);
            table.querySelector('thead').outerHTML = renderHeader();
            attachHeaderEvents();
            loadRows();
        };
    });

    function attachHeaderEvents() {
        document.querySelectorAll('[data-filter]').forEach(input => {
            input.oninput = e => {
                tableState.filters[e.target.dataset.filter] = e.target.value;
                loadRows();
            };
        });

        document.querySelectorAll('[data-sort]').forEach(th => {
            th.onclick = () => {
                toggleSort(th.dataset.sort);
                table.querySelector('thead').outerHTML = renderHeader();
                attachHeaderEvents();
                loadRows();
            };
        });
    }

    rowsEl.onclick = e => {
        const screenshotBtn = e.target.closest('.screenshot-btn');
        if (screenshotBtn) {
            openScreenshot(screenshotBtn.dataset.path);
            return;
        }

        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const trade = currentTrades.find(t => t.id === editBtn.dataset.id);
            if (!trade) return;
            state.editingTrade = { ...trade };
            navigate('edit');
            return;
        }

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const trade = currentTrades.find(t => t.id === deleteBtn.dataset.id);
            if (!trade) return;
            if (!confirm('Opravdu chceš smazat trade?')) return;
            supabase.from('trades').delete().eq('id', trade.id).then(loadRows);
        }
    };

    document.getElementById('backBtn').onclick = () => {
        navigate('dashboard');
    };

    loadRows();
}
