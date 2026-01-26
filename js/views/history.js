import { navigate, state } from '../app.js';
import { fetchTrades } from '../services/historyService.js';
import { questions } from '../data/questions.js';

const supabase = window.supabase;

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

/* ===== LOCAL CACHE ===== */
let currentTrades = [];

/* ===== HELPERS ===== */
function questionIdToText(id) {
    const all = [
        ...Object.values(questions.long).flatMap(s => s.items),
        ...Object.values(questions.short).flatMap(s => s.items)
    ];
    return all.find(q => q.id === id)?.text ?? id;
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

            <td>${t.session?.toUpperCase() ?? '—'}</td>

            <td>${t.checklist_score ?? 0} %</td>

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

            <td>
                ${new Date(
                    t.trade_datetime ?? t.created_at
                ).toLocaleString('cs-CZ')}
            </td>

            <td>
                <button
                    class="edit-btn"
                    data-id="${t.id}"
                    title="Editovat trade"
                >
                    ✏️
                </button>
            </td>

            <td>
                <button
                    class="delete-btn"
                    data-id="${t.id}"
                    title="Smazat trade"
                >
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

/* ===== VIEW ===== */
export async function renderHistory(app) {
    app.innerHTML = `
        <div class="box wide">

            <h2>Historie tradů</h2>

            <div class="table-wrap">
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
                            <th>Delete</th>
                        </tr>
                        <tr class="filters">
                            <th><input data-filter="instrument" placeholder="EURUSD"></th>
                            <th></th>
                            <th></th>
                            <th><input data-filter="session" placeholder="london"></th>
                            <th></th>
                            <th></th>
                            <th><input data-filter="result" placeholder="WIN / LIVE"></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="rows">
                        <tr>
                            <td colspan="11">Načítám…</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button
                class="action-btn backBtn"
                id="backBtn"
                style="margin-top:16px"
            >
                ← Zpět na dashboard
            </button>
        </div>
    `;

    const rowsEl = document.getElementById('rows');

    async function load() {
        rowsEl.innerHTML = `
            <tr><td colspan="11">Načítám…</td></tr>
        `;

        const trades = await fetchTrades(tableState);
        currentTrades = trades;

        rowsEl.innerHTML = trades.length
            ? renderRows(trades)
            : `<tr><td colspan="11">Žádná data</td></tr>`;
    }

    /* ===== FILTERS ===== */
    document.querySelectorAll('[data-filter]').forEach(input => {
        input.addEventListener('input', e => {
            tableState.filters[e.target.dataset.filter] = e.target.value;
            load();
        });
    });

    /* ===== SORT ===== */
    document.querySelectorAll('[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
            toggleSort(th.dataset.sort);
            load();
        };
    });

    /* ===== EDIT + DELETE HANDLERS ===== */
    rowsEl.addEventListener('click', async e => {
        /* EDIT */
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const trade = currentTrades.find(
                t => t.id === editBtn.dataset.id
            );
            if (!trade) return;

            state.editingTrade = { ...trade };
            navigate('edit');
            return;
        }

        /* DELETE */
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const trade = currentTrades.find(
                t => t.id === deleteBtn.dataset.id
            );
            if (!trade) return;

            const ok = confirm(
                `Opravdu chceš smazat trade?\n\n` +
                `${trade.instrument} | ${trade.direction.toUpperCase()} | ${new Date(trade.trade_datetime).toLocaleString('cs-CZ')}`
            );

            if (!ok) return;

            const { error } = await supabase
                .from('trades')
                .delete()
                .eq('id', trade.id);

            if (error) {
                alert('Chyba při mazání: ' + error.message);
                return;
            }

            load();
        }
    });

    document.getElementById('backBtn').onclick = () => {
        navigate('dashboard');
    };

    load();
}
