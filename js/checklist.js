let currentDirection = '';

const questions = {
    long: [
        "Bullish trend na daném TF",
        "4H demand zóna",
        "1H demand zóna",
        "SFP na 5M/15M",
        "SL 60 pipů",
        "Vybraná likvidita",
        "Ideální čas pro otočení trhu",
        "Jsem psychicky v klidu"
    ],
    short: [
        "Bearish trend na daném TF",
        "4H supply zóna",
        "1H supply zóna",
        "SFP na 5M/15M",
        "SL 60 pipů",
        "Vybraná likvidita",
        "Ideální čas pro otočení trhu",
        "Jsem psychicky v klidu"
    ]
};

function selectDirection(direction) {
    currentDirection = direction;

    document.getElementById('directionBox').classList.add('hidden');
    document.getElementById('checklistBox').classList.remove('hidden');

    document.getElementById('checklistBox').innerHTML = `
        <h2>${direction === 'long' ? '📈 LONG' : '📉 SHORT'} Checklist</h2>
        <div class="checklist" id="checklistItems"></div>
        <div class="result" id="result"></div>
        <button class="action-btn tradeBtn" id="tradeBtn" disabled onclick="confirmTrade()">Vzít trade</button>
        <button class="action-btn backBtn" onclick="goBack()">Zpět</button>
    `;

    const checklistItems = document.getElementById('checklistItems');
    questions[direction].forEach(q => {
        checklistItems.innerHTML += `<label><input type="checkbox" class="item"> ${q}</label>`;
    });

    document.querySelectorAll('.item').forEach(cb =>
        cb.addEventListener('change', updateChecklist)
    );
}

function updateChecklist() {
    const items = document.querySelectorAll('.item');
    const checked = document.querySelectorAll('.item:checked').length;
    document.getElementById('result').textContent = `Splněno: ${checked} / ${items.length}`;
    document.getElementById('tradeBtn').disabled = checked < (items.length-2);
}

function goBack() {
    document.getElementById('checklistBox').classList.add('hidden');
    document.getElementById('directionBox').classList.remove('hidden');
}
