const CLIENT_ID = "864795118563-1tr4gn0p4bdcor833ejngkpjhae7mvpl.apps.googleusercontent.com";

let idToken = null;
let svgAtual = null;

const formulario = document.getElementById("formulario");
const inputNumero = document.getElementById("numero");
const mensagem = document.getElementById("mensagem");
const statusLogin = document.getElementById("status-login");
const desenho = document.getElementById("desenho");
const baixar = document.getElementById("baixar");

function aoLogar(resposta) {
  idToken = resposta.credential; // id_token (JWT) emitido pelo Google
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

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensagem.textContent = "";
  desenho.innerHTML = "";
  baixar.hidden = true;
  svgAtual = null;

  const numero = Number(inputNumero.value);

  const headers = { "Content-Type": "application/json" };
  if (idToken) {
    headers["Authorization"] = "Bearer " + idToken;
  }

  try {
    const resp = await fetch("/api/desenho", {
      method: "POST",
      headers,
      body: JSON.stringify({ numero }),
    });

    if (resp.status === 400) {
      mensagem.textContent = "Erro 400: número inválido. Informe um inteiro entre 1 e 100.";
      return;
    }
    if (resp.status === 401) {
      mensagem.textContent = "Erro 401: faça login com o Google (ou entre novamente, se o login expirou).";
      idToken = null;
      statusLogin.textContent = "";
      return;
    }
    if (!resp.ok) {
      mensagem.textContent = "Erro " + resp.status + " ao gerar o desenho.";
      return;
    }

    svgAtual = await resp.text();
    const url = URL.createObjectURL(new Blob([svgAtual], { type: "image/svg+xml" }));

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Desenho gerado para o número " + numero;
    desenho.appendChild(img);

    baixar.hidden = false;
  } catch (err) {
    mensagem.textContent = "Falha de rede ao chamar o servidor.";
  }
});

baixar.addEventListener("click", () => {
  if (!svgAtual) return;
  const url = URL.createObjectURL(new Blob([svgAtual], { type: "image/svg+xml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "exemplo.svg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
