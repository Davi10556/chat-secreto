// 🔥 FIREBASE
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ COLE AQUI SUA CONFIG DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBySZmhCohX3fDrgkqASrr66LvO_Cjztz4",
  authDomain: "fds-chat-ofc.firebaseapp.com",
  projectId: "fds-chat-ofc",
  storageBucket: "fds-chat-ofc.firebasestorage.app",
  messagingSenderId: "679992054816",
  appId: "1:679992054816:web:bb530d0cb9897996021845"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 👤 VARIÁVEIS
let usuario = "";
let contatoSelecionado = "";

// 🔐 CRIPTOGRAFIA
const BASE = "abcdefghijklmnopqrstuvwxyz0123456789 ?!@#$%&*";
let chave = {};
let reversa = {};
const SALA = "global";

function gerarChave() {
  const origem = BASE.split("");
  const destino = [...origem].sort(() => Math.random() - 0.5);

  origem.forEach((c, i) => {
    chave[c] = destino[i];
    reversa[destino[i]] = c;
  });
}

function criptografar(txt) {
  return txt.toLowerCase().split("").map(c => chave[c] || c).join("");
}

function descriptografar(txt) {
  return txt.split("").map(c => reversa[c] || c).join("");
}

async function carregarChave() {
  const ref = doc(db, "salas", SALA);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    chave = snap.data().chave;
    reversa = {};
    for (let k in chave) reversa[chave[k]] = k;
  } else {
    gerarChave();
    await setDoc(ref, { chave });
  }
}

carregarChave();

// 👤 ENTRAR
window.entrar = async function () {
  usuario = document.getElementById("nome").value;
  alert("Entrou como " + usuario);
};

// 💬 ENVIAR
window.enviar = async function () {
  const texto = document.getElementById("msg").value;
  if (!contatoSelecionado) return alert("Selecione um contato!");

  await addDoc(collection(db, "mensagens"), {
    de: usuario,
    para: contatoSelecionado,
    texto: criptografar(texto),
    hora: serverTimestamp()
  });

  document.getElementById("msg").value = "";
};

// 📩 RECEBER
onSnapshot(collection(db, "mensagens"), snap => {
  const chat = document.getElementById("chat");
  chat.textContent = "";

  snap.forEach(docu => {
    const d = docu.data();
    if (
      (d.de === usuario && d.para === contatoSelecionado) ||
      (d.de === contatoSelecionado && d.para === usuario)
    ) {
      chat.textContent += `${d.de}: ${descriptografar(d.texto)}\n`;
    }
  });
});

// 👥 USUÁRIOS ONLINE (SIMULADO)
onSnapshot(collection(db, "mensagens"), snap => {
  const ul = document.getElementById("online");
  ul.innerHTML = "";
  const nomes = new Set();

  snap.forEach(d => {
    nomes.add(d.data().de);
    nomes.add(d.data().para);
  });

  nomes.forEach(nome => {
    if (nome !== usuario) {
      const li = document.createElement("li");
      li.textContent = nome;
      li.onclick = () => contatoSelecionado = nome;
      ul.appendChild(li);
    }
  });
});
