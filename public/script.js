// script.js
// Versao final: o navegador apenas faz o login com o Google, envia o numero
// e o id_token ao servidor (/api/desenho) e exibe o SVG recebido.
// A funcao gerarDesenho agora roda somente no servidor.

const CLIENT_ID = "864795118563-1tr4gn0p4bdcor833ejngkpjhae7mvpl.apps.googleusercontent.com";

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");
const statusLogin = document.getElementById("status-login");

let svgAtual = "";
let idToken = null;

// Chamada pelo Google depois do login: credential e o id_token (JWT).
function aoLogar(resposta) {
  idToken = resposta.credential;
  statusLogin.textContent = "Login realizado com sucesso.";
  mensagem.textContent = "";
}

window.addEventListener("load", () => {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: aoLogar,
  });
  google.accounts.id.renderButton(
    document.getElementById("botao-google"),
    { theme: "outline", size: "large" }
  );
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";
  area.innerHTML = "";
  botaoBaixar.hidden = true;

  const numero = Number(campoNumero.value);

  const cabecalhos = { "Content-Type": "application/json" };
  if (idToken) {
    cabecalhos["Authorization"] = "Bearer " + idToken;
  }

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: cabecalhos,
      body: JSON.stringify({ numero }),
    });

    if (resposta.status === 400) {
      mensagem.textContent = "Erro 400: digite um inteiro entre 1 e 100.";
      return;
    }
    if (resposta.status === 401) {
      mensagem.textContent = "Erro 401: faça login com o Google (ou entre novamente, se o login expirou).";
      idToken = null;
      statusLogin.textContent = "";
      return;
    }
    if (!resposta.ok) {
      mensagem.textContent = "Erro " + resposta.status + " ao gerar o desenho.";
      return;
    }

    svgAtual = await resposta.text();
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
  } catch (erro) {
    mensagem.textContent = "Falha de rede ao chamar o servidor.";
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
