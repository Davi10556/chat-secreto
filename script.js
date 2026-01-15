// ===== CRIPTOGRAFIA =====
const BASE = "abcdefghijklmnopqrstuvwxyz0123456789 ?!@#$%&*";

function gerarChave() {
  const origem = BASE.split("");
  const destino = [...origem].sort(() => Math.random() - 0.5);

  const chave = {};
  const reversa = {};

  origem.forEach((c, i) => {
    chave[c] = destino[i];
    reversa[destino[i]] = c;
  });

  return { chave, reversa };
}

const { chave, reversa } = gerarChave();

function criptografar(txt) {
  return txt.toLowerCase().split("").map(c => chave[c] || c).join("");
}

function descriptografar(txt) {
  return txt.split("").map(c => reversa[c] || c).join("");
}

// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 COLE AQUI SUAS CHAVES DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBySZmhCohX3fDrgkqASrr66LvO_Cjztz4",
  authDomain: "fds-chat-ofc.firebaseapp.com",
  projectId: "fds-chat-ofc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== CHAT =====
let usuario = "";

window.entrar = function () {
  usuario = document.getElementById("nome").value;
};

window.enviar = async function () {
  const texto = document.getElementById("msg").value;

  await addDoc(collection(db, "mensagens"), {
    user: usuario,
    texto: criptografar(texto),
    hora: serverTimestamp()
  });
};

onSnapshot(collection(db, "mensagens"), snap => {
  snap.docChanges().forEach(c => {
    if (c.type === "added") {
      const d = c.doc.data();
      document.getElementById("chat").textContent +=
        `${d.user}: ${descriptografar(d.texto)}\n`;
    }
  });
});
