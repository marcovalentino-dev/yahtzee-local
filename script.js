// Inizializzazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDmJ9qIiJj6Nccpk9XGAHlqYPW40hMr7uA",
  authDomain: "yahtzee-local.firebaseapp.com",
  databaseURL: "https://yahtzee-local-default-rtdb.europe-west1.firebasedatabase.app",  // ✅ Questa è la parte mancante!
  projectId: "yahtzee-local",
  storageBucket: "yahtzee-local.firebasestorage.app",
  messagingSenderId: "97135402041",
  appId: "1:97135402041:web:b517273548b86a580101e8"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const CATEGORIES = [
  "Aces", "Due", "Tre", "Quattro", "Cinque", "Sei",
  "Tris", "Poker", "Full House", "Scala Bassa", "Scala Alta", "Yahtzee", "Chance"
];

let gameId = "";
let playerName = "";

function createGame() {
  alert("Creo partita..."); // DEBUG
  gameId = "partita-" + Math.random().toString(36).substr(2, 6);

  db.ref("games/" + gameId).set({
    createdAt: Date.now(),
    players: {},
    scores: {}
  }).then(() => {
    console.log("Partita creata:", gameId);
    document.getElementById("qr").classList.remove("hidden");
    new QRCode(document.getElementById("qr"), {
      text: `${window.location.href}?game=${gameId}`,
      width: 180,
      height: 180
    });
    showNameSection();
  }).catch(err => {
    console.error("Errore Firebase:", err);
    alert("Errore nel creare la partita");
  });
}


function joinGame() {
  const input = document.getElementById("gameIdInput").value.trim();
  if (!input) return alert("Inserisci un codice valido");
  db.ref("games/" + input).once("value", snapshot => {
    if (snapshot.exists()) {
      gameId = input;

      // Mostra QR code per la partita esistente
      const qrDiv = document.getElementById("qr");
      qrDiv.classList.remove("hidden");
      qrDiv.innerHTML = ""; // svuota
      new QRCode(qrDiv, {
        text: `${window.location.origin}?game=${gameId}`,
        width: 180,
        height: 180
      });

      showNameSection();
    } else {
      alert("Partita non trovata");
    }
  });
}

function showNameSection() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("nameSection").classList.remove("hidden");
}

function enterGame() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) return alert("Inserisci il tuo nome");

  const playerPath = `games/${gameId}/players/${playerName}`;
  const scorePath = `games/${gameId}/scores/${playerName}`;
  let scoreObj = {};
  CATEGORIES.forEach(cat => scoreObj[cat] = "");

  Promise.all([
    db.ref(playerPath).set(true),
    db.ref(scorePath).set(scoreObj)
  ]).then(() => {
    startGame();
  }).catch(err => {
    alert("Errore nel connettersi alla partita");
    console.error(err);
  });
}

function startGame() {
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("gameCodeLabel").innerText = "Codice partita: " + gameId;

  db.ref("games/" + gameId + "/scores").on("value", snapshot => {
    const scores = snapshot.val() || {};
    renderTable(scores);
  });
}

function renderTable(scores) {
  const table = document.getElementById("scoreboard");
  table.innerHTML = "";

  // Header
  const tr = document.createElement("tr");
  tr.innerHTML = `<th>Categoria</th>`;
  const players = Object.keys(scores);
  players.forEach(player => {
    tr.innerHTML += `<th>${player}</th>`;
  });
  table.appendChild(tr);

  // Categorie
  CATEGORIES.forEach(cat => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${cat}</td>`;

    players.forEach(player => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.value = scores[player][cat] || "";
      input.disabled = player !== playerName;
      input.onchange = () => {
        db.ref(`games/${gameId}/scores/${player}/${cat}`).set(parseInt(input.value) || 0);
      };
      td.appendChild(input);
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  // Totale
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `<th>Totale</th>`;
  players.forEach(player => {
    const total = Object.values(scores[player]).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    totalRow.innerHTML += `<td><strong>${total}</strong></td>`;
  });
  table.appendChild(totalRow);
}

// Auto-join via ?game=xyz
window.onload = () => {
  const url = new URL(window.location.href);
  const paramGame = url.searchParams.get("game");
  if (paramGame) {
    document.getElementById("gameIdInput").value = paramGame;
    joinGame();
  }
};
