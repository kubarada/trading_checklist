import { navigate } from '../app.js';

export function renderDashboard(app) {
    app.innerHTML = `
        <div class="box">
            <h2>Dashboard</h2>

            <div class="dashboard-grid">
                <button class="dashboard-card" id="goChecklist">
                    <h3>📋 Checklist</h3>
                    <p>Začít nový trade</p>
                </button>

                <button class="dashboard-card" id="goStats">
                    <h3>📊 Statistiky</h3>
                    <p>Přehled tvých statisk</p>
                </button>

                <button class="dashboard-card" id="goHistory">
                    <h3>🕘 Historie tradů</h3>
                    <p>Uzavřené a otevřené obchody</p>
                </button>
            </div>
        </div>
    `;

    // ===== ROUTING =====
    document.getElementById('goChecklist').onclick = () => {
        navigate('direction');
    };

    document.getElementById('goStats').onclick = () => {
        navigate('stats');
    };

    document.getElementById('goHistory').onclick = () => {
        navigate('history');
    };
}
