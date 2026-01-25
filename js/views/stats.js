import { navigate } from '../app.js';
import { fetchStats } from '../services/statsService.js';

/* ======================================================
   STATS HELPERS
====================================================== */
function calculateWinRate(trades) {
    const relevant = trades.filter(t => ['WIN', 'LOSS'].includes(t.result));
    if (!relevant.length) return 0;

    const wins = relevant.filter(t => t.result === 'WIN').length;
    return Math.round((wins / relevant.length) * 100);
}

/**
 * Aggregates WIN / LOSS per question ID
 * { [id]: { win: number, loss: number } }
 */
function buildQuestionStats(trades) {
    const map = {};

    trades.forEach(t => {
        if (!['WIN', 'LOSS'].includes(t.result)) return;

        (t.checked_questions || []).forEach(id => {
            if (!id) return;

            if (!map[id]) {
                map[id] = { win: 0, loss: 0 };
            }

            if (t.result === 'WIN') map[id].win++;
            if (t.result === 'LOSS') map[id].loss++;
        });
    });

    return map;
}

/* ======================================================
   RENDER HELPERS
====================================================== */
function renderHistogram(stats, type) {
    const entries = Object.entries(stats).filter(([, v]) => v[type] > 0);

    if (!entries.length) {
        return '<p class="muted">Žádná data</p>';
    }

    const max = Math.max(...entries.map(([, v]) => v[type]));

    return entries
        .sort((a, b) => b[1][type] - a[1][type])
        .map(([id, v]) => `
            <div class="histogram-row">
                <span class="hist-label">${id}</span>
                <div class="hist-bar">
                    <div
                        class="hist-fill"
                        style="
                            width:${(v[type] / max) * 100}%;
                            background:${type === 'win'
                                ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                                : 'linear-gradient(90deg,#ef4444,#b91c1c)'
                            };
                        "
                    ></div>
                </div>
                <span class="hist-count">${v[type]}</span>
            </div>
        `)
        .join('');
}

function renderWinRatePerQuestion(stats) {
    const entries = Object.entries(stats)
        .filter(([, v]) => v.win + v.loss >= 3);

    if (!entries.length) {
        return '<p class="muted">Nedostatek dat</p>';
    }

    return entries
        .sort((a, b) => {
            const ra = a[1].win / (a[1].win + a[1].loss);
            const rb = b[1].win / (b[1].win + b[1].loss);
            return rb - ra;
        })
        .map(([id, v]) => {
            const total = v.win + v.loss;
            const rate = Math.round((v.win / total) * 100);

            return `
                <div class="histogram-row">
                    <span class="hist-label">${id}</span>
                    <div class="hist-bar">
                        <div
                            class="hist-fill"
                            style="
                                width:${rate}%;
                                background:linear-gradient(90deg,#38bdf8,#22c55e);
                            "
                        ></div>
                    </div>
                    <span class="hist-count">${rate} %</span>
                </div>
            `;
        })
        .join('');
}

/* ======================================================
   PANEL
====================================================== */
function renderPanel(title, trades) {
    const winRate = calculateWinRate(trades);
    const stats = buildQuestionStats(trades);

    return `
        <div class="stats-panel">
            <h3>${title}</h3>

            <div class="stat-box">
                <span class="stat-label">Win rate</span>
                <span class="stat-value ${winRate >= 50 ? 'positive' : 'negative'}">
                    ${winRate} %
                </span>
            </div>

            <div style="margin-top:20px; display:grid; gap:20px">

                <div class="stat-card">
                    <h4>WIN – checked questions</h4>
                    ${renderHistogram(stats, 'win')}
                </div>

                <div class="stat-card">
                    <h4>LOSS – checked questions</h4>
                    ${renderHistogram(stats, 'loss')}
                </div>

                <div class="stat-card">
                    <h4>WIN rate per question</h4>
                    ${renderWinRatePerQuestion(stats)}
                </div>

            </div>
        </div>
    `;
}

/* ======================================================
   VIEW – CHROME STYLE TABS
====================================================== */
export async function renderStats(app) {
    app.innerHTML = `
        <div class="box wide">
            <h2>Statistiky</h2>

            <div class="stats-window">

                <div class="stats-tabs">
                    <button class="stats-tab active" data-tab="live">
                        LIVE session
                    </button>
                    <button class="stats-tab" data-tab="backtest">
                        BACKTEST session
                    </button>
                </div>

                <div class="stats-body" id="statsContent">
                    <p>Načítám…</p>
                </div>

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

    document.getElementById('backBtn').onclick = () => {
        navigate('dashboard');
    };

    try {
        const trades = await fetchStats();

        const liveTrades = trades.filter(t => t.is_live);
        const backtestTrades = trades.filter(t => !t.is_live);

        const content = document.getElementById('statsContent');

        const renderTab = (type) => {
            content.innerHTML =
                type === 'live'
                    ? renderPanel('LIVE sessions', liveTrades)
                    : renderPanel('BACKTEST sessions', backtestTrades);
        };

        // default tab
        renderTab('live');

        // tab switching
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.onclick = () => {
                document
                    .querySelectorAll('.stats-tab')
                    .forEach(t => t.classList.remove('active'));

                tab.classList.add('active');
                renderTab(tab.dataset.tab);
            };
        });

    } catch (err) {
        console.error(err);
        document.getElementById('statsContent').innerHTML =
            '<p>Chyba při načítání statistik</p>';
    }
}
