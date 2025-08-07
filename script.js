const CATEGORIES = [
  "Aces", "Due", "Tre", "Quattro", "Cinque", "Sei",
  "Tris", "Poker", "Full House", "Scala Bassa", "Scala Alta", "Yahtzee", "Chance"
];

let gameId = '';
let playerName = '';
let gameData = {}; // saved in localStorage per gameId

function createGame() {
  gameId = 'partita-' + Math.random().toString(36).substr(2, 6);
  localStorage.setItem('yahtzee-' + gameId, JSON.stringify({ players: {}, categories: CATEGORIES }));
  showQR();
  document.getElementById('createOrJoin').classList.add('hidden');
  document.getElementById('nameForm').classList.remove('hidden');
}

function joinGame() {
  const input = document.getElementById('gameIdInput').value.trim();
  if (!input) return alert("Inserisci un codice valido");
  gameId = input;
  const stored = localStorage.getItem('yahtzee-' + gameId);
  if (!stored) return alert("Partita non trovata");
  document.getElementById('createOrJoin').classList.add('hidden');
  document.getElementById('nameForm').classList.remove('hidden');
}

function submitName() {
  playerName = document.getElementById('playerName').value.trim();
  if (!playerName) return alert("Inserisci il tuo nome");
  const data = JSON.parse(localStorage.getItem('yahtzee-' + gameId));
  if (!data.players[playerName]) {
    data.players[playerName] = {};
    CATEGORIES.forEach(cat => data.players[playerName][cat] = '');
    localStorage.setItem('yahtzee-' + gameId, JSON.stringify(data));
  }
  gameData = data;
  startGame();
}

function showQR() {
  const qrDiv = document.getElementById('qr');
  qrDiv.classList.remove('hidden');
  qrDiv.innerHTML = '<h3>Invita i tuoi amici</h3>';
  new QRCode(qrDiv, {
    text: window.location.origin + window.location.pathname + '?game=' + gameId,
    width: 180,
    height: 180
  });
}

function startGame() {
  document.getElementById('setup').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('gameCodeLabel').innerText = `Codice partita: ${gameId}`;
  renderTable();
}

function renderTable() {
  const table = document.getElementById('scoreboard');
  table.innerHTML = '';

  // Header
  const trHeader = document.createElement('tr');
  trHeader.innerHTML = '<th>Categoria</th>';
  for (let player in gameData.players) {
    trHeader.innerHTML += `<th>${player}</th>`;
  }
  table.appendChild(trHeader);

  // Righe
  CATEGORIES.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${cat}</td>`;
    for (let player in gameData.players) {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.value = gameData.players[player][cat];
      input.disabled = player !== playerName;
      input.onchange = () => {
        gameData.players[player][cat] = parseInt(input.value) || 0;
        localStorage.setItem('yahtzee-' + gameId, JSON.stringify(gameData));
        renderTable(); // aggiorna totali
      };
      td.appendChild(input);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  });

  // Totale
  const trTotal = document.createElement('tr');
  trTotal.innerHTML = '<th>Totale</th>';
  for (let player in gameData.players) {
    const total = Object.values(gameData.players[player])
      .reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    trTotal.innerHTML += `<td><strong>${total}</strong></td>`;
  }
  table.appendChild(trTotal);
}

function saveGame() {
  const saved = JSON.parse(localStorage.getItem('yahtzee-storico') || '[]');
  saved.push({
    partita: gameId,
    data: new Date().toLocaleString(),
    players: gameData.players
  });
  localStorage.setItem('yahtzee-storico', JSON.stringify(saved));
  alert('Partita salvata!');
}

// Auto-join via ?game=xyz
window.onload = () => {
  const url = new URL(window.location.href);
  const paramGame = url.searchParams.get("game");
  if (paramGame) {
    document.getElementById('gameIdInput').value = paramGame;
    joinGame();
  }
};
