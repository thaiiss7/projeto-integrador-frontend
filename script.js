/* BOOKBLOOM - JavaScript simples | Thaís Michel
   DOM: eventos, arrays, funções, condições, createElement, appendChild e remove.
*/

// Informações usadas no modal dos livros.
const livros = [
  { titulo: 'A Biblioteca da Meia-Noite', autor: 'Matt Haig', genero: 'Fantasia', imagem: 'img/biblioteca-meia-noite.jpg', sinopse: 'Entre vidas possíveis e decisões não tomadas, uma biblioteca guarda histórias que poderiam ter acontecido.' },
  { titulo: 'Torto Arado', autor: 'Itamar Vieira Junior', genero: 'Ficção', imagem: 'img/torto-arado.jpg', sinopse: 'Duas irmãs crescem no sertão baiano em uma narrativa sobre família, terra, memória e resistência.' },
  { titulo: 'Verity', autor: 'Colleen Hoover', genero: 'Suspense', imagem: 'img/verity.jpg', sinopse: 'Uma escritora encontra manuscritos perturbadores ao trabalhar na casa de uma autora famosa.' },
  { titulo: 'Pequenas Grandes Coisas', autor: 'Jodi Picoult', genero: 'Ficção', imagem: 'img/pequenas-grandes-coisas.jpg', sinopse: 'Um drama que convida à reflexão sobre injustiça, escolhas e responsabilidade.' },
  { titulo: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', genero: 'Clássicos', imagem: 'img/cem-anos.jpg', sinopse: 'A saga da família Buendía atravessa gerações na cidade fictícia de Macondo.' },
  { titulo: 'A Paciente Silenciosa', autor: 'Alex Michaelides', genero: 'Suspense', imagem: 'img/paciente-silenciosa.jpg', sinopse: 'Após um acontecimento misterioso, uma pintora deixa de falar e desperta a curiosidade de um terapeuta.' },
  { titulo: 'O Hobbit', autor: 'J. R. R. Tolkien', genero: 'Fantasia', imagem: 'img/hobbit.jpg', sinopse: 'Bilbo Bolseiro deixa o conforto do Condado para viver uma aventura inesperada.' },
  { titulo: 'Sapiens', autor: 'Yuval Noah Harari', genero: 'Não ficção', imagem: 'img/sapiens.jpg', sinopse: 'Uma visão panorâmica da história da humanidade, das primeiras sociedades até o presente.' },
  { titulo: 'Orgulho e Preconceito', autor: 'Jane Austen', genero: 'Romance', imagem: 'img/orgulho-preconceito.jpg', sinopse: 'Elizabeth Bennet e Mr. Darcy enfrentam expectativas sociais, primeiras impressões e preconceitos.' }
];

// 1. GÊNEROS - filtra os nove cards do catálogo.
const abas = document.querySelectorAll('.thais_aba_genero');
const cards = document.querySelectorAll('.thais_card_livro');
let generoSelecionado = '';

function filtrarLivros(genero) {
  generoSelecionado = genero;
  let quantidade = 0;

  cards.forEach(function (card) {
    card.hidden = genero !== '' && card.dataset.genero !== genero;
    if (!card.hidden) quantidade++;
  });

  abas.forEach(function (aba) {
    aba.setAttribute('aria-pressed', String(aba.dataset.genero === genero));
  });

  document.getElementById('thais_resultado_catalogo').textContent = quantidade + (quantidade === 1 ? ' livro exibido.' : ' livros exibidos.');
  document.getElementById('thais_info_genero').textContent = genero
    ? 'Veja os livros deste gênero no catálogo.'
    : 'Selecione uma categoria para filtrar o catálogo.';
}

abas.forEach(function (aba) {
  aba.addEventListener('click', function () {
    const novoGenero = generoSelecionado === aba.dataset.genero ? '' : aba.dataset.genero;
    filtrarLivros(novoGenero);
    document.getElementById('thais_explorar').scrollIntoView();
  });
});
document.getElementById('thais_limpar_filtros').addEventListener('click', function () {
  filtrarLivros('');
});

// 2. MODAL - cada livro mostra sua própria sinopse.
const modal = document.getElementById('thais_modal');
let livroAberto = null;

function abrirLivro(titulo) {
  const livro = livros.find(function (item) { return item.titulo === titulo; });
  if (!livro) return;
  livroAberto = livro;
  document.getElementById('thais_modal_titulo').textContent = livro.titulo;
  document.getElementById('thais_modal_autor').textContent = livro.autor;
  document.getElementById('thais_modal_genero').textContent = livro.genero;
  document.getElementById('thais_modal_sinopse').textContent = livro.sinopse;
  document.getElementById('thais_modal_imagem').src = livro.imagem;
  document.getElementById('thais_modal_imagem').alt = 'Capa de ' + livro.titulo;
  modal.showModal();
}

document.querySelectorAll('.thais_abrir_livro').forEach(function (botao) {
  botao.addEventListener('click', function () { abrirLivro(botao.dataset.titulo); });
});
document.getElementById('thais_fechar_modal').addEventListener('click', function () { modal.close(); });
modal.addEventListener('click', function (evento) {
  if (evento.target === modal) modal.close();
});

// 3. ESTANTE - adiciona, altera o status e remove os livros.
// localStorage mantém os dados neste navegador.
function mesAtual() {
  const hoje = new Date();
  return hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
}
function lerDados(chave) {
  try { return JSON.parse(localStorage.getItem(chave)); }
  catch (erro) { return null; }
}
function salvarDados(chave, dados) {
  try { localStorage.setItem(chave, JSON.stringify(dados)); }
  catch (erro) { /* O site continua funcionando sem armazenamento. */ }
}

const dadosSalvos = lerDados('bookbloom_estante_v2');
const estante = Array.isArray(dadosSalvos) ? dadosSalvos : [
  { titulo: 'A Biblioteca da Meia-Noite', estado: 'Lendo', concluidoEm: null },
  { titulo: 'Sapiens', estado: 'Quero ler', concluidoEm: null },
  { titulo: 'Orgulho e Preconceito', estado: 'Concluído', concluidoEm: mesAtual() }
];
const metaSalva = lerDados('bookbloom_meta_v2');
let meta = Number.isInteger(metaSalva) && metaSalva >= 1 && metaSalva <= 120 ? metaSalva : 12;
const listaEstante = document.getElementById('thais_lista_estante');

function atualizarEstante() {
  document.getElementById('thais_numero_livros').textContent = estante.length;
  salvarDados('bookbloom_estante_v2', estante);
  atualizarMetas();
}
function mensagemEstante(texto) {
  document.getElementById('thais_feedback_estante').textContent = texto;
}

function criarLivro(livro) {
  const item = document.createElement('li');
  item.className = 'thais_item_estante';

  const topo = document.createElement('div');
  topo.className = 'thais_item_estante_topo';
  const titulo = document.createElement('h3');
  titulo.textContent = livro.titulo;
  const estado = document.createElement('span');
  estado.className = 'thais_estado';
  topo.appendChild(titulo);
  topo.appendChild(estado);

  const acoes = document.createElement('div');
  acoes.className = 'thais_item_estante_botoes';
  const rotulo = document.createElement('label');
  rotulo.className = 'thais_controle_status';
  rotulo.textContent = 'Alterar status ';
  const selecao = document.createElement('select');
  selecao.setAttribute('aria-label', 'Status de ' + livro.titulo);
  ['Quero ler', 'Lendo', 'Concluído'].forEach(function (status) {
    const opcao = document.createElement('option');
    opcao.value = status;
    opcao.textContent = status;
    selecao.appendChild(opcao);
  });
  rotulo.appendChild(selecao);

  const excluir = document.createElement('button');
  excluir.type = 'button';
  excluir.className = 'thais_remover';
  excluir.textContent = 'Excluir ×';

  function mostrarStatus() {
    selecao.value = livro.estado;
    estado.textContent = livro.estado;
    item.classList.toggle('thais_concluido', livro.estado === 'Concluído');
  }

  selecao.addEventListener('change', function () {
    if (livro.estado !== selecao.value) {
      livro.estado = selecao.value;
      livro.concluidoEm = livro.estado === 'Concluído' ? mesAtual() : null;
      mostrarStatus();
      atualizarEstante();
      mensagemEstante('Status atualizado para ' + livro.estado + '.');
    }
  });
  excluir.addEventListener('click', function () {
    estante.splice(estante.indexOf(livro), 1);
    item.remove();
    atualizarEstante();
    mensagemEstante('Livro removido da estante.');
  });

  acoes.appendChild(rotulo);
  acoes.appendChild(excluir);
  item.appendChild(topo);
  item.appendChild(acoes);
  listaEstante.appendChild(item);
  mostrarStatus();
}

function adicionarLivro(titulo, estado) {
  const nome = titulo.trim();
  if (!nome) { mensagemEstante('Digite um título.'); return; }
  const repetido = estante.some(function (livro) {
    return livro.titulo.toLowerCase() === nome.toLowerCase();
  });
  if (repetido) { mensagemEstante('Esse livro já está na estante.'); return; }

  const novoLivro = {
    titulo: nome,
    estado: estado,
    concluidoEm: estado === 'Concluído' ? mesAtual() : null
  };
  estante.push(novoLivro);
  criarLivro(novoLivro);
  atualizarEstante();
  mensagemEstante('Livro adicionado com sucesso!');
}

estante.forEach(criarLivro);
atualizarEstante();

document.getElementById('thais_form_estante').addEventListener('submit', function (evento) {
  evento.preventDefault();
  adicionarLivro(document.getElementById('thais_novo_livro').value,
    document.getElementById('thais_novo_status').value);
  document.getElementById('thais_novo_livro').value = '';
});
document.querySelectorAll('.thais_adicionar_catalogo').forEach(function (botao) {
  botao.addEventListener('click', function () { adicionarLivro(botao.dataset.titulo, 'Quero ler'); });
});
document.getElementById('thais_modal_adicionar').addEventListener('click', function () {
  if (livroAberto) adicionarLivro(livroAberto.titulo, 'Quero ler');
  modal.close();
});
document.getElementById('thais_limpar_estante').addEventListener('click', function () {
  listaEstante.querySelectorAll('li').forEach(function (item) { item.remove(); });
  estante.length = 0;
  atualizarEstante();
  mensagemEstante('Estante limpa.');
});

// 4. METAS - distribui a meta por seis meses e atualiza a tabela 7x5.
function atualizarMetas() {
  const tabela = document.getElementById('thais_tabela_metas_corpo');
  tabela.replaceChildren();
  const hoje = new Date();
  let totalLido = 0;

  for (let i = 0; i < 6; i++) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const chave = mes.getFullYear() + '-' + String(mes.getMonth() + 1).padStart(2, '0');
    const objetivo = Math.floor(meta / 6) + (i < meta % 6 ? 1 : 0);
    const lidos = estante.filter(function (livro) {
      return livro.estado === 'Concluído' && livro.concluidoEm === chave;
    }).length;
    totalLido += lidos;
    const faltam = Math.max(0, objetivo - lidos);
    let situacao = 'Pendente';
    let classe = 'thais_status_pendente';
    if (objetivo === 0) situacao = 'Sem meta';
    else if (lidos >= objetivo) { situacao = 'Concluída'; classe = 'thais_status_ok'; }
    else if (lidos > 0) { situacao = 'Em andamento'; classe = 'thais_status_meio'; }

    const linha = document.createElement('tr');
    const nomeMes = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const colunas = [nomeMes, objetivo, lidos, faltam, situacao];
    colunas.forEach(function (valor, indice) {
      const celula = document.createElement(indice === 0 ? 'th' : 'td');
      celula.textContent = valor;
      if (indice === 0) celula.scope = 'row';
      if (indice === 4) celula.className = 'thais_status ' + classe;
      linha.appendChild(celula);
    });
    tabela.appendChild(linha);
  }

  const percentual = Math.min(100, Math.round(totalLido / meta * 100));
  document.getElementById('thais_meta_total').value = meta;
  document.getElementById('thais_meta_contador').textContent = totalLido + ' de ' + meta + ' livros concluídos';
  document.getElementById('thais_meta_porcentagem').textContent = percentual + '%';
  document.getElementById('thais_barra_progresso').style.width = percentual + '%';
  document.querySelector('.thais_barra_meta').setAttribute('aria-valuenow', percentual);
  document.getElementById('thais_resumo_metas').textContent = totalLido >= meta
    ? 'Parabéns! Você alcançou sua meta!'
    : 'Faltam ' + Math.max(0, meta - totalLido) + ' livros para sua meta.';
  document.getElementById('thais_frase_metas').textContent = percentual === 100
    ? 'META CONQUISTADA ★' : 'CONTINUE SUA JORNADA ✦';
}

document.getElementById('thais_form_meta').addEventListener('submit', function (evento) {
  evento.preventDefault();
  const numero = Number(document.getElementById('thais_meta_total').value);
  if (!Number.isInteger(numero) || numero < 1 || numero > 120) {
    document.getElementById('thais_mensagem_meta').textContent = 'Digite um número entre 1 e 120.';
  } else {
    meta = numero;
    salvarDados('bookbloom_meta_v2', meta);
    atualizarMetas();
    document.getElementById('thais_mensagem_meta').textContent = 'Meta salva com sucesso!';
  }
});

// 5. FAQ - abre e fecha seis respostas.
document.querySelectorAll('.thais_pergunta_botao').forEach(function (botao) {
  botao.addEventListener('click', function () {
    const resposta = botao.nextElementSibling;
    resposta.hidden = !resposta.hidden;
    botao.setAttribute('aria-expanded', String(!resposta.hidden));
    botao.querySelector('span').textContent = resposta.hidden ? '＋' : '−';
  });
});

// 6. PERSONALIZAÇÃO - quatro cores e modo escuro.
const botoesCor = document.querySelectorAll('.thais_cor');
botoesCor.forEach(function (botao) {
  botao.addEventListener('click', function () {
    document.body.classList.remove('thais_tema_azul', 'thais_tema_laranja', 'thais_tema_verde', 'thais_tema_rosa');
    document.body.classList.add('thais_tema_' + botao.dataset.tema);
    botoesCor.forEach(function (outro) {
      outro.setAttribute('aria-pressed', String(outro === botao));
    });
  });
});
document.getElementById('thais_alternar_modo').addEventListener('click', function () {
  const escuro = document.body.classList.toggle('thais_modo_escuro');
  this.setAttribute('aria-pressed', String(escuro));
  this.textContent = escuro ? '☀ Claro' : '☾ Escuro';
});

// 7. FORMULÁRIO - valida os sete campos obrigatórios.
const formulario = document.getElementById('thais_formulario');
const mensagemFormulario = document.getElementById('thais_mensagem_form');
formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  const nome = document.getElementById('thais_nome').value.trim();
  const email = document.getElementById('thais_email').value.trim();
  const titulo = document.getElementById('thais_livro_indicado').value.trim();
  const genero = document.getElementById('thais_genero_indicado').value;
  const radio = document.querySelector('input[name="thais_nota"]:checked');
  const nota = radio ? Number(radio.value) : 0;
  const comentario = document.getElementById('thais_comentario').value.trim();
  const confirmado = document.getElementById('thais_confirmacao').checked;
  let erro = '';

  if (nome.length < 2) erro = 'Digite seu nome.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erro = 'Digite um e-mail válido.';
  else if (titulo.length < 2) erro = 'Informe o título do livro.';
  else if (!genero) erro = 'Escolha um gênero.';
  else if (nota < 3 || nota > 5) erro = 'Escolha uma nota.';
  else if (comentario.length < 15) erro = 'Escreva pelo menos 15 caracteres.';
  else if (!confirmado) erro = 'Marque a caixa de confirmação.';
  else {
    mensagemFormulario.className = 'thais_mensagem_form thais_sucesso';
    mensagemFormulario.textContent = 'Obrigado, ' + nome + '! Recomendação validada (demonstração).';
    formulario.reset();
    return;
  }
  mensagemFormulario.className = 'thais_mensagem_form thais_erro';
  mensagemFormulario.textContent = erro;
});
