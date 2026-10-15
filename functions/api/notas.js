export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const nome = url.searchParams.get("aluno");
    const r = await env.DB.prepare("SELECT * FROM notas WHERE aluno = ?").bind(nome).all();
  return Response.json(r.results);
}
