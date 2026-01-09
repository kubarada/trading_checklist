import { state, navigate } from '../app.js';

export function renderConfirmation(app) {
    const score = state.score;

    let grade = '';
    let gradeClass = '';

    if (score >= 95) {
        grade = 'A+ trade';
        gradeClass = 'grade-aplus';
    } else if (score >= 90) {
        grade = 'A trade';
        gradeClass = 'grade-a';
    } else {
        grade = 'B trade';
        gradeClass = 'grade-b';
    }

    app.innerHTML = `
        <div class="box">
            <h2>Trade zhodnocení</h2>

            <div class="trade-summary">
                <p><strong>Směr:</strong> ${state.direction.toUpperCase()}</p>
                <p><strong>Checklist splněn:</strong> ${score} %</p>

                <div class="trade-grade ${gradeClass}">
                    Ohodnocení: <b>${grade}</b>
                </div>
            </div>

            <button class="action-btn tradeBtn" id="resetBtn">Nový trade</button>
        </div>
    `;

    document.getElementById('resetBtn').onclick = () => {
        state.direction = null;
        state.score = null;
        navigate('direction');
    };
}
