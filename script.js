// Busca um elemento pelo ID.
function campo(id) {
  return document.getElementById(id);
}

// Filtro
let generoAtual = '';

function filtrar(genero) {
  generoAtual = genero;

  document.querySelectorAll('.card_livro').forEach(function (card) {
    if (genero === '' || card.dataset.genero === genero) {
      card.hidden = false;
    } else {
      card.hidden = true;
    }
  });

  document.querySelectorAll('.aba_genero').forEach(function (botao) {
    if (botao.dataset.genero === genero) {
      botao.setAttribute('aria-pressed', 'true');
    } else {
      botao.setAttribute('aria-pressed', 'false');
    }
  });
}

document.querySelectorAll('.aba_genero').forEach(function (botao) {
  botao.addEventListener('click', function () {
    if (generoAtual === botao.dataset.genero) {
      filtrar('');
    } else {
      filtrar(botao.dataset.genero);
    }
    campo('explorar').scrollIntoView();
  });
});

campo('limpar_filtros').addEventListener('click', function () {
  filtrar('');
});

// Modal
const modal = campo('modal');
let tituloAberto = '';

function abrirLivro(botao) {
  const card = botao.closest('.card_livro');
  tituloAberto = card.querySelector('h3').textContent;

  campo('modal_titulo').textContent = tituloAberto;
  campo('modal_autor').textContent = card.querySelector('.card_livro_texto p').textContent;
  campo('modal_genero').textContent = card.querySelector('.mini_genero').textContent;
  campo('modal_sinopse').textContent = card.querySelector('.sinopse').textContent;
  campo('modal_imagem').src = card.querySelector('img').src;
  campo('modal_imagem').alt = 'Capa de ' + tituloAberto;

  modal.showModal();
}

document.querySelectorAll('.abrir_livro').forEach(function (botao) {
  botao.addEventListener('click', function () {
    abrirLivro(botao);
  });
});

campo('fechar_modal').addEventListener('click', function () {
  modal.close();
});

modal.addEventListener('click', function (evento) {
  if (evento.target === modal) {
    modal.close();
  }
});

// Estante
function mesAtual() {
  const data = new Date();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return data.getFullYear() + '-' + mes;
}

let estante = [
  { titulo: 'Percy Jackson e o Ladrão de Raios', estado: 'Lendo', concluidoEm: null },
  { titulo: 'Sapiens', estado: 'Quero ler', concluidoEm: null },
  { titulo: 'Orgulho e Preconceito', estado: 'Concluído', concluidoEm: mesAtual() }
];

let meta = 12;
const lista = campo('lista_estante');

function mostrarEstante() {
  lista.innerHTML = '';

  estante.forEach(function (livro) {
    const item = document.createElement('li');
    item.className = 'item_estante';

    item.innerHTML = `
      <div class="item_estante_topo">
        <h3></h3>
        <span class="estado"></span>
      </div>
      <div class="item_estante_botoes">
        <label>Alterar status
          <select>
            <option>Quero ler</option>
            <option>Lendo</option>
            <option>Concluído</option>
          </select>
        </label>
        <button type="button" class="remover">Excluir ×</button>
      </div>
    `;

    item.querySelector('h3').textContent = livro.titulo;
    item.querySelector('.estado').textContent = livro.estado;

    if (livro.estado === 'Concluído') {
      item.classList.add('concluido');
    }

    const select = item.querySelector('select');
    select.value = livro.estado;

    select.addEventListener('change', function () {
      livro.estado = select.value;
      if (livro.estado === 'Concluído') {
        livro.concluidoEm = mesAtual();
      } else {
        livro.concluidoEm = null;
      }
      mostrarEstante();
    });

    item.querySelector('.remover').addEventListener('click', function () {
      estante.splice(estante.indexOf(livro), 1);
      mostrarEstante();
    });

    lista.appendChild(item);
  });

  campo('numero_livros').textContent = estante.length;
  atualizarMetas();
}

function adicionarLivro(titulo, estado) {
  titulo = titulo.trim();
  if (titulo === '') return;

  for (let i = 0; i < estante.length; i++) {
    if (estante[i].titulo.toLowerCase() === titulo.toLowerCase()) {
      campo('feedback_estante').textContent = 'Este livro já está na estante.';
      return;
    }
  }

  let concluidoEm = null;
  if (estado === 'Concluído') {
    concluidoEm = mesAtual();
  }

  estante.push({ titulo: titulo, estado: estado, concluidoEm: concluidoEm });
  mostrarEstante();
  campo('feedback_estante').textContent = 'Livro adicionado com sucesso!';
}

campo('form_estante').addEventListener('submit', function (evento) {
  evento.preventDefault();
  adicionarLivro(campo('novo_livro').value, campo('novo_status').value);
  campo('novo_livro').value = '';
});

document.querySelectorAll('.adicionar_catalogo').forEach(function (botao) {
  botao.addEventListener('click', function () {
    const card = botao.closest('.card_livro');
    adicionarLivro(card.querySelector('h3').textContent, 'Quero ler');
  });
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

// Meta
function adicionarCelula(linha, tag, texto) {
  const celula = document.createElement(tag);
  celula.textContent = texto;
  if (tag === 'th') celula.scope = 'row';
  linha.appendChild(celula);
}

function atualizarMetas() {
  const corpo = campo('tabela_metas_corpo');
  corpo.innerHTML = '';
  const hoje = new Date();
  let total = 0;

  for (let i = 0; i < 6; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const chave = data.getFullYear() + '-' + mes;

    let objetivo = Math.floor(meta / 6);
    if (i < meta % 6) objetivo++;

    let lidos = 0;
    estante.forEach(function (livro) {
      if (livro.estado === 'Concluído' && livro.concluidoEm === chave) {
        lidos++;
      }
    });
    total += lidos;

    let faltam = objetivo - lidos;
    if (faltam < 0) faltam = 0;

    let situacao = 'Pendente';
    if (objetivo === 0) situacao = 'Sem meta';
    else if (lidos >= objetivo) situacao = 'Concluída';
    else if (lidos > 0) situacao = 'Em andamento';

    const linha = document.createElement('tr');
    adicionarCelula(linha, 'th', data.toLocaleDateString('pt-BR', { month: 'long' }));
    adicionarCelula(linha, 'td', objetivo);
    adicionarCelula(linha, 'td', lidos);
    adicionarCelula(linha, 'td', faltam);
    adicionarCelula(linha, 'td', situacao);
    corpo.appendChild(linha);
  }

  let percentual = Math.round(total / meta * 100);
  if (percentual > 100) percentual = 100;

  campo('meta_total').value = meta;
  campo('meta_contador').textContent = total + ' de ' + meta + ' livros concluídos';
  campo('meta_porcentagem').textContent = percentual + '%';
  campo('barra_progresso').style.width = percentual + '%';
  campo('barra_meta').setAttribute('aria-valuenow', percentual);

  if (total >= meta) {
    campo('resumo_metas').textContent = 'Parabéns! Meta alcançada!';
    campo('frase_metas').textContent = 'META CONQUISTADA ★';
  } else {
    campo('resumo_metas').textContent = 'Faltam ' + (meta - total) + ' livros para sua meta.';
    campo('frase_metas').textContent = 'CONTINUE SUA JORNADA ✦';
  }
}

campo('form_meta').addEventListener('submit', function (evento) {
  evento.preventDefault();
  const numero = Number(campo('meta_total').value);
  if (Number.isInteger(numero) && numero >= 1 && numero <= 120) {
    meta = numero;
    atualizarMetas();
    campo('mensagem_meta').textContent = 'Meta salva com sucesso!';
  } else {
    campo('mensagem_meta').textContent = 'Digite um número de 1 a 120.';
  }
});

// FAQ
document.querySelectorAll('.pergunta_botao').forEach(function (botao) {
  botao.addEventListener('click', function () {
    const resposta = botao.nextElementSibling;
    if (resposta.hidden) {
      resposta.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      botao.querySelector('span').textContent = '−';
    } else {
      resposta.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
      botao.querySelector('span').textContent = '＋';
    }
  });
});

// Cores e modo escuro
document.querySelectorAll('.cor').forEach(function (botao) {
  botao.addEventListener('click', function () {
    document.body.classList.remove('tema_azul', 'tema_laranja', 'tema_verde', 'tema_rosa');
    document.body.classList.add('tema_' + botao.dataset.tema);

    document.querySelectorAll('.cor').forEach(function (cor) {
      if (cor === botao) cor.setAttribute('aria-pressed', 'true');
      else cor.setAttribute('aria-pressed', 'false');
    });
  });
});

campo('alternar_modo').addEventListener('click', function () {
  const escuro = document.body.classList.toggle('modo_escuro');
  if (escuro) this.textContent = '☀ Claro';
  else this.textContent = '☾ Escuro';
  this.setAttribute('aria-pressed', escuro);
});

// Formulário
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
  else if (genero === '') erro = 'Escolha o gênero.';
  else if (nota === null) erro = 'Selecione uma avaliação.';
  else if (comentario.length < 10) erro = 'Justifique sua indicação com pelo menos 10 caracteres.';

  if (erro !== '') {
    mensagem.className = 'erro';
    mensagem.textContent = erro;
  } else {
    mensagem.className = 'sucesso';
    mensagem.textContent = 'Recomendação validada com sucesso!';
    evento.target.reset();
  }
});

// Cria os livros da estante ao abrir a página
mostrarEstante();