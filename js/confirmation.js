function confirmTrade() {
    document.getElementById('checklistBox').classList.add('hidden');
    document.getElementById('confirmationBox').classList.remove('hidden');

    document.getElementById('confirmationBox').innerHTML = `
        <h2>Adekvatně si trade zhodnotil a nevypadá to úplně v pítši. Ale ty máš stejně v pítši, víš co...</h2>
        <p>Směr: ${currentDirection.toUpperCase()} <br> Ppst úspěšnosti tradu: 1000% </p>
        <button class="action-btn tradeBtn" onclick="resetAll()">Nový trade</button>
    `;
}

function resetAll() {
    document.getElementById('confirmationBox').classList.add('hidden');
    document.getElementById('directionBox').classList.remove('hidden');
}
