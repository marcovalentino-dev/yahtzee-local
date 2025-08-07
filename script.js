let players = [];

function joinGame() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return alert("Inserisci un nome!");

  players.push({ name, scores: [], total: 0 });
  updatePlayersUI();

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  generateQR();
}

function updatePlayersUI() {
  const container = document.getElementById("players");
  container.innerHTML = "";
  players.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <h3>${player.name}</h3>
      <p>Punteggio totale: <strong>${player.total}</strong></p>
    `;
    container.appendChild(card);
  });
}

function addTurn() {
  players.forEach((player, index) => {
    const punti = prompt(`Inserisci punteggio per ${player.name}`);
    const num = parseInt(punti);
    if (!isNaN(num)) {
      player.scores.push(num);
      player.total += num;
    }
  });
  updatePlayersUI();
  updateHistory();
}

function updateHistory() {
  const history = document.getElementById("history");
  history.innerHTML = "<h3>Storico Punteggi</h3>";
  players.forEach(player => {
    history.innerHTML += `
      <p><strong>${player.name}:</strong> ${player.scores.join(", ")}</p>
    `;
  });
}

function saveGame() {
  const saved = JSON.parse(localStorage.getItem("yahtzee_history") || "[]");
  saved.push({
    data: new Date().toLocaleString(),
    players
  });
  localStorage.setItem("yahtzee_history", JSON.stringify(saved));
  alert("Partita salvata!");
}

function generateQR() {
  const container = document.getElementById("qr-container");
  container.innerHTML = "<h3>📱 Unisciti anche tu!</h3>";
  const qrcode = new QRCode(container, {
    text: window.location.href,
    width: 180,
    height: 180
  });
}
