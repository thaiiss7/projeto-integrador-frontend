function campo(nome) {
  return document.getElementById('' + nome);
}

// Filtros dos gêneros
const cards = document.querySelectorAll('.card_livro');
const generos = document.querySelectorAll('.aba_genero');
let generoAtual = '';

function filtrar(genero) {
  generoAtual = genero;
  let total = 0;
  cards.forEach(function (card) {
    card.hidden = genero !== '' && card.dataset.genero !== genero;
    if (!card.hidden) total++;
  });
  generos.forEach(function (botao) {
    botao.setAttribute('aria-pressed', botao.dataset.genero === genero);
  });
  campo('resultado_catalogo').textContent = total + ' livros exibidos.';
  campo('info_genero').textContent = genero ? 'Catálogo filtrado por gênero.' : 'Selecione uma categoria para filtrar o catálogo.';
}

generos.forEach(function (botao) {
  botao.addEventListener('click', function () {
    filtrar(generoAtual === botao.dataset.genero ? '' : botao.dataset.genero);
    campo('explorar').scrollIntoView();
  });
});
campo('limpar_filtros').addEventListener('click', function () { filtrar(''); });

// Modais
const modal = campo('modal');
let tituloAberto = '';

function dadosLivro(botao) {
  const card = botao.closest('.card_livro');
  return {
    titulo: card.querySelector('h3').textContent.trim(),
    autor: card.querySelector('.card_livro_texto > p').textContent.trim(),
    genero: card.querySelector('.mini_genero').textContent.trim(),
    imagem: card.querySelector('img').getAttribute('src'),
    sinopse: card.querySelector('.sinopse').textContent.trim()
  };
}

function abrirLivro(botao) {
  const livro = dadosLivro(botao);
  tituloAberto = livro.titulo;
  campo('modal_titulo').textContent = livro.titulo;
  campo('modal_autor').textContent = livro.autor;
  campo('modal_genero').textContent = livro.genero;
  campo('modal_imagem').src = livro.imagem;
  campo('modal_imagem').alt = 'Capa de ' + livro.titulo;
  campo('modal_sinopse').textContent = livro.sinopse;
  modal.showModal();
}

document.querySelectorAll('.abrir_livro').forEach(function (botao) {
  botao.addEventListener('click', function () { abrirLivro(botao); });
});
campo('fechar_modal').addEventListener('click', function () { modal.close(); });
modal.addEventListener('click', function (evento) {
  if (evento.target === modal) modal.close();
});

// Estante
function mesAtual() {
  const data = new Date();
  return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0');
}

function carregar(chave, padrao) {
  try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; }
  catch (erro) { return padrao; }
}
function salvar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); }
  catch (erro) {}
}

let estante = carregar('bookbloom_estante_v2', [
  { titulo: 'Percy Jackson e o Ladrão de Raios', estado: 'Lendo', concluidoEm: null },
  { titulo: 'Sapiens', estado: 'Quero ler', concluidoEm: null },
  { titulo: 'Orgulho e Preconceito', estado: 'Concluído', concluidoEm: mesAtual() }
]);
if (!Array.isArray(estante)) estante = [];
let meta = Number(carregar('bookbloom_meta_v2', 12));
if (!Number.isInteger(meta) || meta < 1 || meta > 120) meta = 12;
const lista = campo('lista_estante');

function atualizar() {
  campo('numero_livros').textContent = estante.length;
  salvar('bookbloom_estante_v2', estante);
  atualizarMetas();
}

function mostrarEstante() {
  lista.replaceChildren();
  estante.forEach(function (livro) {
    const item = document.createElement('li');
    item.className = 'item_estante';
    item.innerHTML = '<div class="item_estante_topo"><h3></h3><span class="estado"></span></div>' +
      '<div class="item_estante_botoes"><label>Alterar status <select><option>Quero ler</option><option>Lendo</option><option>Concluído</option></select></label>' +
      '<button type="button" class="remover">Excluir ×</button></div>';
    item.querySelector('h3').textContent = livro.titulo;
    item.querySelector('.estado').textContent = livro.estado;
    if (livro.estado === 'Concluído') item.classList.add('concluido');

    const select = item.querySelector('select');
    select.value = livro.estado;
    select.addEventListener('change', function () {
      livro.estado = select.value;
      livro.concluidoEm = livro.estado === 'Concluído' ? mesAtual() : null;
      mostrarEstante();
      atualizar();
    });
    item.querySelector('.remover').addEventListener('click', function () {
      estante.splice(estante.indexOf(livro), 1);
      item.remove();
      atualizar();
    });
    lista.appendChild(item);
  });
  atualizar();
}

function adicionarLivro(titulo, estado) {
  titulo = titulo.trim();
  if (!titulo) return;
  if (estante.some(function (livro) { return livro.titulo.toLowerCase() === titulo.toLowerCase(); })) {
    campo('feedback_estante').textContent = 'Este livro já está na estante.';
    return;
  }
  estante.push({ titulo: titulo, estado: estado, concluidoEm: estado === 'Concluído' ? mesAtual() : null });
  mostrarEstante();
  campo('feedback_estante').textContent = 'Livro adicionado com sucesso!';
}

campo('form_estante').addEventListener('submit', function (evento) {
  evento.preventDefault();
  adicionarLivro(campo('novo_livro').value, campo('novo_status').value);
  campo('novo_livro').value = '';
});
document.querySelectorAll('.adicionar_catalogo').forEach(function (botao) {
  botao.addEventListener('click', function () { adicionarLivro(dadosLivro(botao).titulo, 'Quero ler'); });
});
campo('modal_adicionar').addEventListener('click', function () {
  adicionarLivro(tituloAberto, 'Quero ler');
  modal.close();
});
campo('limpar_estante').addEventListener('click', function () {
  estante = [];
  mostrarEstante();
  campo('feedback_estante').textContent = 'Estante limpa.';
});

// Meta dos próximos seis meses
function atualizarMetas() {
  const corpo = campo('tabela_metas_corpo');
  corpo.replaceChildren();
  let total = 0;
  const hoje = new Date();

  for (let i = 0; i < 6; i++) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const chave = mes.getFullYear() + '-' + String(mes.getMonth() + 1).padStart(2, '0');
    const objetivo = Math.floor(meta / 6) + (i < meta % 6 ? 1 : 0);
    const lidos = estante.filter(function (livro) {
      return livro.estado === 'Concluído' && livro.concluidoEm === chave;
    }).length;
    total += lidos;
    const faltam = Math.max(0, objetivo - lidos);
    const situacao = objetivo === 0 ? 'Sem meta' : lidos >= objetivo ? 'Concluída' : lidos ? 'Em andamento' : 'Pendente';

    const linha = document.createElement('tr');
    [mes.toLocaleDateString('pt-BR', { month: 'long' }), objetivo, lidos, faltam, situacao].forEach(function (valor, indice) {
      const celula = document.createElement(indice === 0 ? 'th' : 'td');
      celula.textContent = valor;
      if (indice === 0) celula.scope = 'row';
      linha.appendChild(celula);
    });
    corpo.appendChild(linha);
  }

  const percentual = Math.min(100, Math.round(total / meta * 100));
  campo('meta_total').value = meta;
  campo('meta_contador').textContent = total + ' de ' + meta + ' livros concluídos';
  campo('meta_porcentagem').textContent = percentual + '%';
  campo('barra_progresso').style.width = percentual + '%';
  campo('barra_meta').setAttribute('aria-valuenow', percentual);
  campo('resumo_metas').textContent = total >= meta ? 'Parabéns! Meta alcançada!' : 'Faltam ' + (meta - total) + ' livros para sua meta.';
  campo('frase_metas').textContent = total >= meta ? 'META CONQUISTADA ★' : 'CONTINUE SUA JORNADA ✦';
}

campo('form_meta').addEventListener('submit', function (evento) {
  evento.preventDefault();
  const numero = Number(campo('meta_total').value);
  if (Number.isInteger(numero) && numero >= 1 && numero <= 120) {
    meta = numero;
    salvar('bookbloom_meta_v2', meta);
    atualizarMetas();
    campo('mensagem_meta').textContent = 'Meta salva com sucesso!';
  } else campo('mensagem_meta').textContent = 'Digite um número de 1 a 120.';
});

// FAQ
document.querySelectorAll('.pergunta_botao').forEach(function (botao) {
  botao.addEventListener('click', function () {
    const resposta = botao.nextElementSibling;
    resposta.hidden = !resposta.hidden;
    botao.setAttribute('aria-expanded', !resposta.hidden);
    botao.querySelector('span').textContent = resposta.hidden ? '＋' : '−';
  });
});

// Quatro cores e modo escuro
document.querySelectorAll('.cor').forEach(function (botao) {
  botao.addEventListener('click', function () {
    document.body.className = document.body.className.replace(/tema_\w+/g, '').trim();
    document.body.classList.add('tema_' + botao.dataset.tema);
    document.querySelectorAll('.cor').forEach(function (cor) {
      cor.setAttribute('aria-pressed', cor === botao);
    });
  });
});
campo('alternar_modo').addEventListener('click', function () {
  const escuro = document.body.classList.toggle('modo_escuro');
  this.textContent = escuro ? '☀ Claro' : '☾ Escuro';
  this.setAttribute('aria-pressed', escuro);
});

// Validação do formulário
campo('formulario').addEventListener('submit', function (evento) {
  evento.preventDefault();
  const nome = campo('nome').value.trim();
  const email = campo('email').value.trim();
  const titulo = campo('livro_indicado').value.trim();
  const genero = campo('genero_indicado').value;
  const nota = document.querySelector('input[name="nota"]:checked');
  const comentario = campo('comentario').value.trim();
  const mensagem = campo('mensagem_form');
  let erro = '';

  if (nome.length < 2) erro = 'Informe seu nome.';
  else if (!email.includes('@') || !email.includes('.')) erro = 'Informe um e-mail válido.';
  else if (titulo.length < 2) erro = 'Informe o livro.';
  else if (!genero) erro = 'Escolha o gênero.';
  else if (!nota) erro = 'Selecione uma avaliação.';
  else if (comentario.length < 10) erro = 'Justifique sua indicação com pelo menos 10 caracteres.';

  if (erro) {
    mensagem.className = 'erro';
    mensagem.textContent = erro;
  } else {
    mensagem.className = 'sucesso';
    mensagem.textContent = 'Recomendação validada com sucesso!';
    evento.target.reset();
  }
});

mostrarEstante();