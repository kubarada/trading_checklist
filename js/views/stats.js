import { navigate } from '../app.js';
import { fetchStats } from '../services/statsService.js';
import { questions } from '../data/questions.js';

/* ===== HELPERS ===== */
function getQuestionText(id) {
    const all = [
        ...Object.values(questions.long).flatMap(s => s.items),
        ...Object.values(questions.short).flatMap(s => s.items)
    ];
    return all.find(q => q.id === id)?.text ?? id;
}

function calculateWinRate(trades) {
    const closed = trades.filter(t => t.result);
    if (!closed.length) return 0;

    const wins = closed.filter(t => t.result === 'WIN').length;
    return Math.round((wins / closed.length) * 100);
}

function buildHistogram(trades) {
    const map = {};

    trades
        .filter(t => t.result === 'WIN')
        .forEach(t => {
            // max 1× na trade
            const unique = new Set(t.checked_questions);

            unique.forEach(id => {
                map[id] = (map[id] || 0) + 1;
            });
        });

    return map;
}

/* ===== CANVAS HISTOGRAM ===== */
function renderHistogramChart(canvas, histogram) {
    const ctx = canvas.getContext('2d');
    const entries = Object.entries(histogram).sort((a, b) => a[0].localeCompare(b[0]));

    canvas.width = canvas.offsetWidth;
    canvas.height = 280;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    if (!entries.length) {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('Žádná WIN data', padding.left, padding.top + 20);
        return;
    }

    const maxValue = Math.max(...entries.map(e => e[1]));
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    const barGap = 10;
    const barWidth = chartWidth / entries.length - barGap;

    const bars = [];

    /* ===== GRID + Y AXIS ===== */
    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';

    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue / 5) * i);
        const y =
            canvas.height -
            padding.bottom -
            (value / maxValue) * chartHeight;

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();

        ctx.fillText(value, 6, y + 4);
    }

    /* ===== X AXIS ===== */
    ctx.beginPath();
    ctx.moveTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();

    /* ===== BARS ===== */
    entries.forEach(([id, value], index) => {
        const x =
            padding.left +
            index * (barWidth + barGap);

        const height =
            (value / maxValue) * chartHeight;

        const y =
            canvas.height -
            padding.bottom -
            height;

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, barWidth, height);

        bars.push({
            id,
            value,
            x,
            y,
            width: barWidth,
            height
        });
    });

    /* ===== TOOLTIP ===== */
    let tooltip = canvas.parentElement.querySelector('.chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        canvas.parentElement.style.position = 'relative';
        canvas.parentElement.appendChild(tooltip);
    }

    canvas.onmousemove = e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const hit = bars.find(
            b =>
                mx >= b.x &&
                mx <= b.x + b.width &&
                my >= b.y &&
                my <= b.y + b.height
        );

        if (hit) {
            tooltip.style.display = 'block';
            tooltip.style.left = `${mx + 12}px`;
            tooltip.style.top = `${my - 12}px`;
            tooltip.innerHTML = `
                <strong>${getQuestionText(hit.id)}</strong><br>
                ${hit.value}×
            `;
        } else {
            tooltip.style.display = 'none';
        }
    };

    canvas.onmouseleave = () => {
        tooltip.style.display = 'none';
    };
}

/* ===== PANEL ===== */
function renderPanel(id, title, trades) {
    const winRate = calculateWinRate(trades);
    const histogram = buildHistogram(trades);

    return `
        <div class="stats-panel">
            <h3>${title}</h3>

            <div class="stat-box">
                <span class="stat-label">Win rate</span>
                <span class="stat-value">${winRate} %</span>
            </div>

            <canvas id="${id}" class="histogram-canvas"></canvas>
        </div>
    `;
}

/* ===== VIEW ===== */
export async function renderStats(app) {
    app.innerHTML = `
        <div class="box wide">

            <h2>Statistiky</h2>

            <div class="stats-grid">
                ${renderPanel('liveChart', 'LIVE sessions', [])}
                ${renderPanel('backtestChart', 'BACKTEST sessions', [])}
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

        const live = trades.filter(t => t.is_live);
        const backtest = trades.filter(t => !t.is_live);

        document.querySelector('.stats-grid').innerHTML = `
            ${renderPanel('liveChart', 'LIVE sessions', live)}
            ${renderPanel('backtestChart', 'BACKTEST sessions', backtest)}
        `;

        renderHistogramChart(
            document.getElementById('liveChart'),
            buildHistogram(live)
        );

        renderHistogramChart(
            document.getElementById('backtestChart'),
            buildHistogram(backtest)
        );

    } catch (err) {
        console.error(err);
    }
}