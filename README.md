# Teewald City

<p align="center">
  <img src="docs/img/anim-titulo.gif" width="512" alt="Tela-título: o logotipo de Teewald City entra girando sobre um voo em Mode 7 pela cidade iluminada à noite">
</p>

<p align="center">
  <b><a href="https://fabianokunst.github.io/Teewald-city/">▶ Jogar no navegador</a></b><br>
  <sub>computador, celular ou tablet · teclado, joystick ou toque · português e inglês · sem instalar nada</sub>
</p>

Teewald City é um jogo de plataforma e ação 2D em pixel art no estilo Super Nintendo. A história se passa em Teewald, uma cidade de casas em enxaimel na serra do sul do Brasil, colonizada por imigrantes do Hunsrück. O jogo é feito só com HTML, CSS e JavaScript, sem build e sem dependências, e roda direto no GitHub Pages gratuito.

**Toda a arte, a música e os efeitos sonoros são gerados por código quando o jogo carrega.** O jogo não usa nenhum arquivo de imagem ou de som. As imagens da pasta `docs/` são só os prints deste README, e todos eles foram tirados do próprio jogo rodando.

> *A 2D platformer/brawler in SNES-style pixel art, set in a half-timbered town in the highlands of southern Brazil. Pure front-end, no build step and no asset files: every sprite, tile, song and sound effect is generated in code at load time. Playable in Portuguese and English, with keyboard, gamepad or touch.*

<p align="center">
  <img src="docs/img/intro-serra.png" width="49%" alt="O caminhão de Arno descendo a serra à noite, entre araucárias, sob a lua cheia">
  <img src="docs/img/c1-rua-principal.png" width="49%" alt="Arno lutando contra cabeças-de-fogo na rua principal, entre casas de enxaimel iluminadas">
  <img src="docs/img/c2-serraria.png" width="49%" alt="A Serraria Kessler à noite, com pilhas de toras e um caminhão Fenemê vermelho">
  <img src="docs/img/c3-salao.png" width="49%" alt="O salão do baile debaixo da terra, com lanterninhas coloridas e pares de dançarinos fantasmas">
</p>

## Sumário

- [A ideia](#a-ideia)
- [Como o jogo foi feito](#como-o-jogo-foi-feito)
- [Capítulo 1 — A Cidade Adormecida](#capítulo-1--a-cidade-adormecida)
- [Capítulo 2 — A Trilha das Fitas](#capítulo-2--a-trilha-das-fitas)
- [Capítulo 3 — O Baile Debaixo da Terra](#capítulo-3--o-baile-debaixo-da-terra)
- [Capítulo 4 — O Último Turno](#capítulo-4--o-último-turno)
- [Bestiário e galeria de arte](#bestiário-e-galeria-de-arte)
- [Como funciona por dentro](#como-funciona-por-dentro)
- [Dificuldade](#dificuldade)
- [Controles](#controles)
- [Opções, filtro CRT e idiomas](#opções-filtro-crt-e-idiomas)
- [Rodar localmente](#rodar-localmente) · [Publicar no GitHub Pages](#publicar-no-github-pages) · [Estrutura do código](#estrutura-do-código) · [Parâmetros de depuração](#parâmetros-de-depuração)

---

## A ideia

A proposta é um jogo de 16 bits que poderia ter saído em 1997, mas que se passa num lugar que quase nunca aparece em videogame: a serra gaúcha e catarinense das colônias alemãs. Algumas intenções guiaram todas as decisões:

- **Escuro, mas bonito.** A noite não acaba e a cidade está tomada por criaturas, mas Teewald continua linda: casas de enxaimel com as janelas acesas, a igreja gótica branca, araucárias enormes, árvores de outono alaranjadas, postes com luz de sódio, lua cheia, céu estrelado, neblina e um cemitério da colônia cheio de velas. O medo vem do contraste.
- **Tudo regional.** As fases, os itens, as falas e as lendas vêm da cultura das colônias: cuca, linguiça, bolinho de batata, chimarrão, chopp, a Festa da Batata, a benzedeira, o pau-de-fita, o carijó, a atafona, a serraria, o caminhão Fenemê, a Sociedade de Tiro, o kerb, a bandinha, o "bah", o "guri", o "tu" e frases em Hunsrik e alemão. Os monstros também são do folclore: o lobisomem, a assombração de lençol e o diabo que aparece no baile como um moço bonito que ninguém convidou.
- **Uma história que se conta aos poucos.** Arno Becker, caminhoneiro, volta a Teewald depois de vinte anos. O pai dele sumiu numa noite de cerração em 1977. Cada capítulo responde a uma pergunta e deixa outra.
- **Qualquer pessoa consegue jogar.** Há três níveis de dificuldade, e no Fácil quem não joga *beat 'em up* termina o capítulo. O jogo roda no navegador do celular sem instalar nada, com controle na tela.
- **SNES de verdade, sem arquivos.** O jogo imita as limitações e os truques do Super Nintendo: resolução de 256×224, cores de 15 bits, Mode 7, degradês por linha, mosaico e o eco do chip de som. E faz tudo isso gerando a arte e o som por código, sem nenhum arquivo de imagem ou áudio.

## Como o jogo foi feito

O jogo foi desenvolvido entre 8 e 9 de outubro de 2026 com o **Claude Code**, um agente de programação, numa conversa em português. O autor deu a direção criativa, as referências e as correções de rumo. O agente escreveu o código, desenhou os sprites (também em código), compôs a trilha e testou cada mudança.

### Direção criativa e referências

O ponto de partida foi uma pasta de capturas de tela de um jogo 3D (`ref/`, que fica fora do repositório). Ela definiu o clima e as criaturas: a cabeça flutuante em chamas, os fantasmas, o ciclope verde de um olho só com asas e o demônio antigo, pálido e de membros compridos. A partir daí, cada pedido do autor virou uma regra do projeto:

- o acidente do caminhão **não aparece**: a tela corta seco para o preto;
- a fase 1 tem que parecer **"quase um beat 'em up"**, com a câmera travando em arenas até as ondas de inimigos acabarem;
- a cidade tem que ser **bonita**, mesmo com a atmosfera escura;
- "**capriche na lore e sempre deixe tudo regional**" (pedido feito no capítulo 2);
- o nome da cidade é **sempre "Teewald"**, em qualquer idioma, e nunca é traduzido.

### Linha do tempo

| Quando | O que entrou |
|---|---|
| 8/10, noite | Capítulo 1 completo: abertura, tela-título, fase, chefe e final. Publicação automática no GitHub. |
| 8/10, noite | Três níveis de dificuldade, depois que o autor achou o capítulo 1 difícil demais. Versão para celular e tablet com controle na tela. |
| 9/10, madrugada | Capítulo 2, com a lenda do Mão-Comprida, as sete fitas e o revólver. |
| 9/10, noite | Capítulo 3, suporte completo a joystick e este README com os prints, feitos em sessões paralelas no mesmo repositório. |

### Ouvindo quem joga

O primeiro capítulo saiu com o balanceamento original de fliperama, e o autor disse que "não dava nem para jogar". A resposta foi criar os níveis **Fácil**, **Normal** e **Difícil** (o Difícil manteve o balanceamento original) e mudar o que mais frustrava. No Fácil e no Normal, encostar no inimigo não machuca. Há um limite de inimigos atacando ao mesmo tempo, e o chefe não recupera a energia quando o Arno cai. Os corvos que voavam alto demais para serem atingidos podiam travar uma arena para sempre, e isso também foi corrigido.

Para conferir o balanceamento sem depender de impressão, o jogo tem um **piloto automático** (`?bot=1`) que anda, pula, bate e atira como um jogador. Uma página de teste roda a fase inteira com o bot e conta o dano recebido, as mortes e as arenas. A meta era terminar o Fácil sem morrer e o Normal com poucas mortes.

### Testes sem abrir o navegador

Quase todos os testes foram feitos com o Microsoft Edge em modo *headless* (sem janela) e parâmetros de URL. `ff=N` avança N quadros instantaneamente. `auto=1` passa os diálogos sozinho. `press`, `hold` e `every` simulam botões em quadros específicos. `x=` começa a fase em qualquer ponto e `god=1` deixa o Arno quase invencível. Assim dava para abrir o jogo direto no chefe, tirar um print e olhar o resultado em segundos. A versão de celular foi testada com emulação de toque pelo DevTools Protocol, e o áudio com um teste que toca todos os efeitos e músicas procurando erros.

### Publicação automática

Um *hook* do Claude Code roda ao fim de cada resposta do agente. Ele faz o commit de tudo o que mudou e envia para o GitHub, e se o envio for recusado, integra as mudanças remotas e tenta de novo. Por isso o GitHub Pages sempre tem a versão mais recente, e o histórico do repositório é feito de commits "Atualização automática". O script está em [.claude/hooks/auto-push.sh](.claude/hooks/auto-push.sh).

### Como os prints deste README foram feitos

Todas as imagens deste README saíram do jogo, sem edição:

- Uma página de captura carrega os scripts do jogo e **intercepta o `requestAnimationFrame`**. Assim o laço do jogo roda quadro a quadro, a 60 Hz exatos, com o relógio fixo. O resultado é determinístico: o mesmo endereço gera sempre a mesma imagem.
- Os pixels são lidos direto do canvas de 256×224 e ampliados 3× por vizinho mais próximo. Por isso os prints são nítidos e saem sem o filtro CRT.
- Os **GIFs** foram feitos com um codificador escrito para isso, porque a máquina não tinha ffmpeg. Ele monta uma paleta global de 255 cores por *median cut*, deixa transparentes os pixels que não mudaram entre um quadro e outro e comprime com LZW. Cada GIF foi decodificado de novo para conferir os quadros.
- As **folhas de sprites** foram montadas com as próprias funções de arte do jogo e a fonte bitmap dele.
- Os prints de **celular** usam o Edge emulando um aparelho de toque, e o do **filtro CRT** é um print da página real.

---

## Capítulo 1 — A Cidade Adormecida

Outono de 1997. Arno Becker, caminhoneiro, volta a subir a serra de Teewald City depois de vinte anos. Na cabine, ele relembra a cidade como era: as araucárias enormes sob a lua cheia, as casas de enxaimel, a torre da igreja, a Festa da Batata. O rádio chia um aviso, a neblina fecha a estrada e, do nada, ele perde o controle do caminhão.

Arno acorda caído numa rua de Teewald. A cidade continua linda, mas está vazia e tomada por criaturas.

### A tela-título

Na tela-título há um voo em "Mode 7" sobre o mapa da cidade iluminada, e o logotipo entra girando e crescendo. O menu tem Novo Jogo, Continuar (que lembra o capítulo, as fitas e as balas), Capítulos, Opções e Controles.

<p align="center">
  <img src="docs/img/titulo.png" width="49%" alt="Logotipo TEEWALD CITY sobre o mapa da cidade em Mode 7">
  <img src="docs/img/titulo-menu.png" width="49%" alt="Menu principal com a lua cheia ao fundo">
</p>

### A abertura

A abertura é uma cutscene: o cartão de abertura e o plano geral da serra com o caminhão descendo de faróis acesos. Depois vem o interior da cabine, com a estrada pseudo-3D e sprites escalados no estilo *Top Gear*, o terço balançando no retrovisor, o rádio com estática e a neblina. Arno perde o controle e a tela corta seco para o preto.

<p align="center">
  <img src="docs/img/anim-estrada.gif" width="49%" alt="Animação: a estrada pseudo-3D vista da cabine, com placas passando e o volante girando">
  <img src="docs/img/anim-perda-de-controle.gif" width="49%" alt="Animação: a neblina fecha a estrada, o caminhão sai de controle e a tela corta para o preto">
</p>

<p align="center">
  <img src="docs/img/intro-cartao.png" width="32%" alt="Cartão de abertura: Sul do Brasil, Outono de 1997">
  <img src="docs/img/intro-cabine.png" width="32%" alt="A cabine do caminhão: volante, velocímetro, rádio sintonizado em 104.5 e o terço no retrovisor">
  <img src="docs/img/intro-araucarias.png" width="32%" alt="Arno comenta as araucárias, mais velhas que os primeiros colonos, enquanto uma placa passa">
  <img src="docs/img/intro-radio.png" width="32%" alt="O rádio chia: atenção, motoristas">
  <img src="docs/img/intro-neblina.png" width="32%" alt="A neblina fecha a estrada e uma placa de curva aparece">
  <img src="docs/img/intro-escuro.png" width="32%" alt="Depois do corte para o preto, Arno acorda no escuro: Hã...?">
</p>

### A fase 1

A fase tem plataforma e combate quase de *beat 'em up*. Em algumas arenas a câmera trava até as ondas de inimigos acabarem. Arno tem um combo de 3 golpes, uma voadora e um giro especial. Os golpes têm *hit-stop*, e a tela mostra a barra de vida do inimigo e um contador de golpes.

<p align="center">
  <img src="docs/img/despertar.png" width="49%" alt="Arno caído na calçada: Ai... minha cabeça">
  <img src="docs/img/fase1-cartao.png" width="49%" alt="Cartão da Fase 1, A Cidade Adormecida, com assombrações chegando">
</p>

<p align="center">
  <img src="docs/img/anim-combate.gif" width="512" alt="Animação: Arno pula, bate em cabeças-de-fogo e quebra um caixote na rua principal">
</p>

O caminho passa pela rua de entrada, pela rua principal com a padaria, pela ponte do arroio, pelo cemitério da colônia com velas e neblina, pela ladeira de pedra e termina na praça da igreja gótica, com o coreto.

<p align="center">
  <img src="docs/img/c1-rua-entrada.png" width="49%" alt="Rua de entrada: Arno pega um bolinho de batata enquanto uma cabeça-de-fogo se aproxima">
  <img src="docs/img/c1-padaria.png" width="49%" alt="A padaria na rua principal, com um vulto à espreita">
  <img src="docs/img/c1-arroio.png" width="49%" alt="A ponte do arroio: o pai de Arno o ensinou a pescar ali">
  <img src="docs/img/c1-cemiterio-velas.png" width="49%" alt="O cemitério da colônia, com velas acesas e assombrações atrás da cerca">
  <img src="docs/img/c1-cemiterio.png" width="49%" alt="Combate contra várias assombrações no cemitério, 6 golpes seguidos">
  <img src="docs/img/c1-cabeca-de-fogo.png" width="49%" alt="Uma cabeça-de-fogo dá um rasante sobre Arno na ladeira">
</p>

- **Inimigos**: **Assombrações**, **Cabeças-de-Fogo** (cabeças flutuantes com cauda de chamas), **Vultos**, **Corvos** e o chefe **O Ciclope Gigante**.
- **Itens regionais**: cuca, linguiça, bolinho de batata, chimarrão ou chopp (sorteado, e os dois enchem a vida) e a medalha de São Cristóvão, o padroeiro dos motoristas, que dá uma vida extra. Há caixotes e barris quebráveis, capelinhas de beira de estrada que servem de ponto de retorno e placas que dá para ler.

### O chefe: O Ciclope Gigante

Na praça da igreja, o ciclope verde de um olho só desce voando. Ele dá rasantes e lança orbes, que vêm em rajadas na segunda metade da luta.

<p align="center">
  <img src="docs/img/anim-ciclope.gif" width="512" alt="Animação: a luta contra O Ciclope Gigante em frente à igreja">
</p>

<p align="center">
  <img src="docs/img/c1-praca.png" width="49%" alt="A praça da igreja, com o coreto">
  <img src="docs/img/c1-ciclope-chegada.png" width="49%" alt="O Ciclope Gigante chega voando sobre a igreja">
  <img src="docs/img/c1-ciclope-luta.png" width="49%" alt="O Ciclope lança orbes verdes enquanto Arno pula">
  <img src="docs/img/c1-ciclope-rasante.png" width="49%" alt="O Ciclope dá um rasante rente ao chão da praça">
</p>

### O final

O sino toca, Dona Frida aparece na porta da igreja e as cabeças-de-fogo vão acendendo nas colinas. Os créditos passam sobre o voo em Mode 7.

<p align="center">
  <img src="docs/img/c1-final-frida.png" width="32%" alt="Dona Frida na porta da igreja: Eu te benzi quando tu era guri">
  <img src="docs/img/c1-final-colinas.png" width="32%" alt="As cabeças-de-fogo acendendo nas colinas atrás da igreja">
  <img src="docs/img/c1-creditos.png" width="32%" alt="Créditos do capítulo 1 sobre a cidade em Mode 7">
</p>

---

## Capítulo 2 — A Trilha das Fitas

A mesma noite, que não termina. Dentro da Igreja Matriz, Dona Frida, a benzedeira, passa um chimarrão para o Arno e conta a lenda do **Antigo** (*der Alte*). Ele veio escondido no porão do veleiro dos colonos do Hunsrück, em 1852, junto com as batatas-semente. Os ervateiros o chamavam de **Mão-Comprida**: um bicho pálido que anda de quatro, com braços compridos demais, pelas estradas do mato em noite de cerração.

A bisavó de Frida, a Oma Hedwig, amarrou o bicho nas raízes do **Pinheiro Velho**, a araucária mais antiga de Teewald, com sete fitas bentas e uma reza. Por isso, todo mês de maio, as moças dançavam o **pau-de-fita** em volta da árvore, e cada volta da dança renovava os nós. Com o tempo a amarração virou festa e ninguém mais lembrou por quê. Em maio de 1997, a serraria Kessler derrubou o pinheiro para fazer as tábuas do pavilhão novo da Festa da Batata. Naquela noite veio a cerração.

### O prólogo na igreja

O prólogo se passa na igreja, com vitrais ao luar e velas. Dona Frida conta a lenda em quatro quadros ilustrados no estilo livro de histórias: o veleiro de 1852, a amarração no Pinheiro Velho, a dança do pau-de-fita (animada) e o pinheiro derrubado.

<p align="center">
  <img src="docs/img/c2-igreja.png" width="49%" alt="Dentro da igreja: Dona Frida oferece um chimarrão ao Arno">
  <img src="docs/img/anim-pau-de-fita.gif" width="49%" alt="Animação: as moças dançam o pau-de-fita em volta da araucária, trançando as fitas coloridas">
</p>

<p align="center">
  <img src="docs/img/c2-lenda-1852.png" width="32%" alt="Quadro da lenda: o veleiro dos colonos em 1852, sob a lua">
  <img src="docs/img/c2-lenda-amarracao.png" width="32%" alt="Quadro da lenda: o bicho amarrado nas raízes do Pinheiro Velho com as sete fitas">
  <img src="docs/img/c2-lenda-pinheiro.png" width="32%" alt="Quadro da lenda: o Pinheiro Velho derrubado em 1997 e o bicho saindo do toco">
</p>

**O revólver 38 do Arno.** Dona Frida achou o revólver no mato, na curva da serra, porque ele estava no porta-luvas do caminhão sumido, e benzeu a arma. A munição é contada no HUD e aparece em caixas de balas: na Sociedade de Tiro, em caixotes e às vezes com inimigos derrotados. O tiro é forte, mas as balas são poucas.

<p align="center">
  <img src="docs/img/c2-revolver.png" width="49%" alt="Dona Frida mostra o revólver 38: O meu 38! E o caminhão, Dona Frida?">
  <img src="docs/img/c2-missao.png" width="49%" alt="Missão: encontre o Mão-Comprida antes que a lua se ponha e siga as sete fitas bentas">
</p>

### Uma caçada pelas sete fitas

A missão é uma **caçada**. O Mão-Comprida anda ferido por Teewald e vai perdendo pelo caminho as fitas que ainda estavam enroscadas no couro. Cada fita tem um verso da reza bordado em ponto de cruz. O Arno segue o rastro das sete fitas até o toco do Pinheiro Velho, onde o bicho volta para dormir antes de a lua descer.

A **fase 2** tem cerca de 4.800 pixels de comprimento. O caminho é este:

1. praça da igreja;
2. rua da Cervejaria Schmitt e da Sociedade de Tiro;
3. pavilhão da Festa da Batata, com bandeirinhas e o palco da bandinha;
4. atafona dos Weber, com a roda-d'água girando sozinha, e a ponte do arroio;
5. Serraria Kessler, com a serra circular, as pilhas de toras e um Fenemê carregado de pinheiro;
6. a ervateira dos Becker, com o carijó aceso e as taipas;
7. a clareira do toco.

<p align="center">
  <img src="docs/img/c2-fita.png" width="49%" alt="Fita benta 1 de 7 encontrada, com o verso Pinheiro velho, raiz de ferro, em frente à Cervejaria Schmitt">
  <img src="docs/img/c2-sociedade-de-tiro.png" width="49%" alt="A rua da Sociedade de Tiro de Teewald, fundada em 1898">
  <img src="docs/img/c2-pavilhao.png" width="49%" alt="Luta contra uma colona possuída no pavilhão da 2ª Festa da Batata de Teewald, 1997">
  <img src="docs/img/c2-atafona.png" width="49%" alt="A atafona dos Weber, com a roda-d'água e um lobisomem se aproximando">
  <img src="docs/img/c2-serraria-colono.png" width="49%" alt="Um colono possuído com forcado na Serraria Kessler">
  <img src="docs/img/c2-ervateira.png" width="49%" alt="O carijó aceso na ervateira dos Becker, com um lobisomem e um colono">
</p>

- **Inimigos novos**:
  - **Colonos possuídos**: moradores levados pela cerração que atacam com enxada e forcado. Quando são derrotados, a sombra sai do corpo e eles voltam a si.
  - **Lobisomem**: anda em volta, se agacha e dá o bote.
  - **O Demônio Antigo**, o chefe.
- **Cenas no meio da fase**: o Mão-Comprida aparece em cima das toras da serraria e foge para o mato. O **Seu Kessler** é libertado, conta o que fez e entrega uma fita. Ele também conta o que aconteceu com o pai do Arno em 1977.
- **Mais coisas para achar**: sacos de batata quebráveis, caixas de balas, placas novas para ler e falas do Arno ao passar pelos lugares da infância dele.

<p align="center">
  <img src="docs/img/c2-kessler-luta.png" width="49%" alt="Arno luta contra o Seu Kessler possuído, perto das toras">
  <img src="docs/img/c2-kessler.png" width="49%" alt="Seu Kessler, libertado, confessa: Fui eu, Arno. Eu derrubei o Pinheiro Velho">
</p>

### O chefe: O Demônio Antigo

Na clareira, uma placa velha diz *Hier wird nicht gehauen — 1852* ("aqui não se corta"). O chefe tem três ataques, e todos dão aviso:

- **investida** de quatro, que se pula por cima, e depois ele fica atordoado ao bater no tronco;
- **salto**, com uma sombra vermelha marcando onde vai cair;
- **garras**, quando ele se ergue sobre as patas de trás.

Depois da metade da energia, a clareira escurece e ele chama assombrações. No fim, o Arno usa as sete fitas para amarrar o bicho de novo, rezando a reza completa.

<p align="center">
  <img src="docs/img/anim-demonio.gif" width="512" alt="Animação: a luta contra O Demônio Antigo, de membros compridos, em volta do toco do Pinheiro Velho">
</p>

<p align="center">
  <img src="docs/img/c2-demonio-surge.png" width="32%" alt="O Demônio Antigo sai do mato atrás do toco">
  <img src="docs/img/c2-der-alte.png" width="32%" alt="Der Alte provoca: Tu tem o cheiro do teu pai, guri">
  <img src="docs/img/c2-demonio-lute.png" width="32%" alt="LUTE! Pule a investida, saia da sombra do salto">
  <img src="docs/img/c2-demonio-luta.png" width="32%" alt="Arno acerta 32 golpes seguidos no demônio">
  <img src="docs/img/c2-amarracao.png" width="32%" alt="A amarração: as fitas brilham em volta do toco enquanto Arno reza">
  <img src="docs/img/c2-fase-concluida.png" width="32%" alt="Fase concluída, com pontos, bônus de tempo e bônus de energia">
</p>

**Músicas novas**: o "Vanerão de Teewald", com a gaita no ritmo da vaneira gaúcha; o *Dies Irae* no órgão para o chefe; o tema da lenda; a tensão da caçada; e a valsa da estrada tocada por uma bandinha desafinada.

O capítulo 1 termina e emenda direto no prólogo do capítulo 2. Na tela-título, o menu **Capítulos** permite começar qualquer capítulo.

<details>
<summary><b>Final do capítulo 2 (spoiler)</b></summary>

<br>

A amarração termina com a reza completa. O toco se abre, uma bandinha toca lá embaixo, a lua fica vermelha e uma voz conhecida chama o Arno.

<p align="center">
  <img src="docs/img/c2-toco-aberto.png" width="49%" alt="O toco do Pinheiro Velho aberto, com uma escada iluminada e vozes de festa vindo de baixo">
  <img src="docs/img/c2-lua-vermelha.png" width="49%" alt="Créditos do capítulo 2 sob a lua vermelha">
</p>

</details>

---

## Capítulo 3 — O Baile Debaixo da Terra

Dentro do toco do Pinheiro Velho há uma escada de pedra que não estava em mapa nenhum. Nos degraus estão riscados, a canivete, os nomes e os anos de quem sumiu: Schmitt 1898, Weber 1931, Kessler 1997... e Becker 1977. Lá embaixo, a bandinha toca a valsa do pai do Arno.

<p align="center">
  <img src="docs/img/c3-cartao.png" width="32%" alt="Cartão do capítulo 3: Debaixo do toco do Pinheiro Velho, uma escada que não estava em mapa nenhum">
  <img src="docs/img/c3-escada.png" width="32%" alt="Arno descendo a escada de pedra e lendo os nomes riscados nos degraus">
  <img src="docs/img/c3-escada-becker.png" width="32%" alt="O nome BECKER 1977 riscado num degrau, iluminado por uma vela">
</p>

### Debaixo da terra

A **fase 3** é toda debaixo da terra, e a lamparina de carbureto do Arno ilumina em volta dele. O revólver continua com ele, começando com 12 balas. O caminho é este:

1. as raízes do Pinheiro Velho;
2. a **Mina Santa Bárbara** (Companhia Carbonífera de Teewald, fechada depois do desabamento de 1931), com escoras, trilhos, vagonetes que quebram, aviso de grisu e o nicho da padroeira dos mineiros;
3. o **elevador de carga**, uma arena em que a plataforma desce pelo poço enquanto os inimigos atacam;
4. a **gruta do Rio Escuro**, com estalactites, cristais, vaga-lumes no teto e pedras para atravessar o rio;
5. o **salão do baile**, com lanterninhas de papel, mesas de festa, a bandinha fantasma do Erwin e faixas de todos os anos em que alguém sumiu (Kerb 1852, Festa 1898, Baile 1931, Festa 1977, Festa da Batata 1997).

<p align="center">
  <img src="docs/img/c3-raizes.png" width="49%" alt="As raízes do Pinheiro Velho, com cogumelos e uma assombração">
  <img src="docs/img/c3-mina.png" width="49%" alt="A entrada da Mina Santa Bárbara, com a placa Perigo: grisu, nada de fogo">
  <img src="docs/img/c3-mina-luta.png" width="49%" alt="Arno luta contra mineiros soterrados de 1931, com picaretas, entre as escoras">
  <img src="docs/img/c3-elevador.png" width="49%" alt="O elevador de carga, máximo 8 homens, com uma cabeça-de-fogo atacando">
</p>

<p align="center">
  <img src="docs/img/anim-elevador.gif" width="512" alt="Animação: a arena do elevador de carga descendo pelo poço da mina enquanto Arno luta">
</p>

<p align="center">
  <img src="docs/img/c3-gruta.png" width="49%" alt="A gruta do Rio Escuro, com cristais roxos, estalagmites e assombrações">
  <img src="docs/img/c3-salao-luta.png" width="49%" alt="O salão do baile: pares de dançarinos fantasmas libertados">
</p>

- **Inimigos novos**:
  - **Mineiros soterrados** de 1931, com picareta e lamparina no capacete.
  - **Morcegos**.
  - **Pares de dançarinos** fantasmas, que valsam em volta do Arno no compasso de três e dão um rodopio.
- **No salão**, o Arno vê o pai, **Ewald Becker**, valsando sem reconhecer o filho.

### O chefe: O Moço do Baile

O chefe é **O Moço do Baile**, o *Tanzteufel* dos colonos do Hunsrück. É o mesmo diabo que, nas histórias gaúchas, aparece no baile como um moço bonito que ninguém convidou, de chapéu preto, lenço vermelho, bombacha e gaita. Todos os ataques dele se evitam pulando:

- **laço** na altura do peito;
- **boleadeira** rente ao chão;
- **rodopio**;
- **pisada de casco**, que manda ondas pelo chão.

Na segunda metade da luta, ele manda a bandinha tocar mais ligeiro e chama dançarinos.

<p align="center">
  <img src="docs/img/anim-moco.gif" width="512" alt="Animação: a luta contra O Moço do Baile no salão, entre os pares de dançarinos">
</p>

<p align="center">
  <img src="docs/img/c3-moco.png" width="32%" alt="O Moço do Baile: Boa noite, Becker. Chegou bem na hora da valsa">
  <img src="docs/img/c3-moco-lute.png" width="32%" alt="LUTE! Pule o laço, a boleadeira e o rodopio">
  <img src="docs/img/c3-moco-luta.png" width="32%" alt="Arno acerta 33 golpes seguidos no Moço do Baile">
</p>

**Músicas novas**: a "Polca do Porão" na fase, o "Chamamé do Diabo" no chefe (ele acelera na segunda metade da luta) e a valsa do pai em ré maior no amanhecer.

<details>
<summary><b>Final do capítulo 3 (spoiler)</b></summary>

<br>

Derrotado, o Moço mostra o pé de bode e afunda no chão em fumaça de enxofre. O baile acorda e o Arno reencontra o pai. O relógio do pai parou às 23h47, a mesma hora em que o Arno perdeu o caminhão. Todos sobem a escada para ver o primeiro amanhecer de Teewald desde a Festa da Batata, e a Dona Frida espera com o chimarrão.

<p align="center">
  <img src="docs/img/c3-ewald.png" width="32%" alt="Ewald Becker reconhece o filho: Arno? Mas tu tá um homem feito">
  <img src="docs/img/c3-amanhecer.png" width="32%" alt="O sol nasce sobre o toco do Pinheiro Velho: Olha, pai. O sol">
  <img src="docs/img/c3-creditos.png" width="32%" alt="Créditos do capítulo 3 no céu do amanhecer">
</p>

</details>

---

## Capítulo 4 — O Último Turno

Na noite seguinte, o caminhão do Arno desce a serra sozinho, de faróis acesos, para a baixada do arroio. Lá de baixo vem o apito da **Calçados Morgenstern**, uma fábrica que fechou em março. Pela estrada passam as mulheres de Teewald, de camisola e de olhos fechados, andando atrás do apito. O pai do Arno lembra que buscava sapato ali toda quinta, e que a moça do pesponto dava bala de goma para o guri.

<p align="center">
  <img src="docs/img/c4-curva.png" width="49%" alt="Na curva da serra, as mulheres sonâmbulas passam de camisola entre o Arno e o pai">
  <img src="docs/img/c4-vila.png" width="49%" alt="A vila operária, com o Bar do Zé de TV ligada, bicicletas Caloi e sapatos vermelhos andando sozinhos">
</p>

### A fábrica de calçados

A **fase 4** atravessa a fábrica inteira. Os pontos de retorno são **relógios de ponto**, e "PONTO BATIDO" faz o papel da vela acesa. O caminho é este:

1. a **vila operária**: casas geminadas com as portas abertas, varais, o Bar do Zé e as sonâmbulas a caminho do portão;
2. o **portão** com a estrela de neon da Morgenstern e o comunicado de fechamento ("31/03/1997");
3. o **curtume**, com tanques de tanino de acácia-negra, varais de couro que servem de plataforma, o fulão girando e o caminhão do Arno parado na doca, de farol aceso e sem ninguém na cabine;
4. o **corte e a montagem**, com esteiras que empurram tudo e balancins que descem de tempos em tempos (uma luz vermelha avisa antes). Uma placa diz "HÁ 10.963 DIAS SEM ACIDENTES — DESDE 1967";
5. o **escritório da diretoria**, onde o velho Gerhard Morgenstern, de cadeira de rodas, entrega a chave do pesponto e o Arno leva os sapatos vermelhos da vitrine;
6. o **pesponto**, com sessenta máquinas e as mulheres de Teewald costurando de olhos fechados, e a **sala de cola**, onde as poças de cola deixam o Arno lento.

<p align="center">
  <img src="docs/img/c4-portao.png" width="49%" alt="O portão da Calçados Morgenstern, com a estrela de neon piscando">
  <img src="docs/img/c4-curtume.png" width="49%" alt="O curtume: o caminhão do Arno na doca da expedição, de farol aceso">
  <img src="docs/img/c4-fabrica.png" width="49%" alt="O corte e a montagem: prateleiras de caixas de exportação, o balancim e a esteira">
  <img src="docs/img/c4-pesponto.png" width="49%" alt="O pesponto: costureiras sonâmbulas nas máquinas e carretéis de linha na parede">
</p>

<p align="center">
  <img src="docs/img/c4-gerhard.png" width="49%" alt="O velho Gerhard Morgenstern no escritório, ao lado da vitrine com o primeiro par do Modelo Hilde">
  <img src="docs/img/c4-couro.png" width="49%" alt="O Couro, um couro de boi com a marca da estância, voando feito arraia sobre o pátio do curtume">
</p>

- **Inimigos novos**:
  - **Sapatos Modelo Hilde**: pares de escarpins vermelhos que andam sozinhos e pulam de bico.
  - **Tamancos** de colono, que saltitam aos pares fazendo claque-claque.
  - **Botina de bico de aço**, que pula e pisa; o chão treme dos dois lados.
  - **Contramestre** fantasma, que joga fôrmas de madeira e apita "A META!"; aí todos os sapatos apressam o passo.
- **Mini-chefe: O Couro.** É um couro de boi inteiro, com a marca da estância a fogo, que se solta do tanque de tanino (inspirado na lenda do *Cuero*, o couro vivo dos lagos do sul). Ele dá rasantes, mergulha do alto (é só sair da sombra) e enrola o Arno; aí é preciso socar várias vezes para se soltar.

### O chefe: A Moça do Serão

Em 1967, o patrão trancou o pesponto à noite "pra ninguém roubar sapato", para fechar a tempo um pedido de exportação. Na terceira madrugada de serão, a sala de cola pegou fogo. **Hilde Weber**, de 19 anos, a melhor pespontadeira da fábrica, ficou lá dentro. Hoje ela é um fantasma de guarda-pó queimado, com os olhos costurados com linha vermelha e a saia se desfazendo em fios. Ela não tem pés. E repete a regra do patrão: ninguém sai antes de fechar o pedido. Os golpes dela são:

- **costura**: uma linha pontilhada corre pelo chão e prende os pés (pule);
- **agulhas** em leque;
- **fôrma de madeira**: um soco devolve a fôrma, e ela acerta em cheio na Moça;
- **carretel**: ela sobe pela linha e cai onde estava a sombra;
- **cola**: poças que deixam o Arno lento.

Na segunda metade, o incêndio de 1967 volta. As portas batem e trancam, e o fogo protege a Moça. O Arno precisa abrir as três portas com a chave do Gerhard (↑ perto da porta). Cada porta aberta deixa entrar o luar, liberta uma costureira e apaga o fogo por um tempo.

<p align="center">
  <img src="docs/img/c4-hilde.png" width="49%" alt="A Moça do Serão flutuando entre as portas trancadas do pesponto">
  <img src="docs/img/c4-portas.png" width="49%" alt="O incêndio de 1967: a porta do meio aberta para o luar enquanto a Moça sobe pela linha vermelha">
</p>

**Músicas novas**: o "Xote da Fábrica" na fase, com o chimbal das máquinas, e a "Valsa do Serão" no chefe, uma caixinha de música que acelera e ganha metais quando começa o incêndio.

<details>
<summary><b>Final do capítulo 4 (spoiler)</b></summary>

<br>

O Arno devolve à Hilde o par de sapatos vermelhos que ela costurou com retalhos para o baile de Kerb e nunca chegou a usar. Os pontos dos olhos se soltam, ela calça os sapatos, vira gente de novo e sai dançando pela porta aberta. Lá fora, o caminhão do Arno, ainda sem motorista, "come" a luz da estrela de neon da fábrica e sobe a estrada do Morro dos Bugres. De madrugada, o rádio fala de vacas que amanhecem sem os olhos na Linha Becker.

<p align="center">
  <img src="docs/img/c4-estrela.png" width="49%" alt="Na doca, a luz rosa da estrela de neon escorre para dentro do farol do caminhão">
</p>

</details>

---

## Bestiário e galeria de arte

Todos os sprites abaixo foram desenhados pelo próprio jogo, com as mesmas funções que ele usa ao carregar. Não há nenhum arquivo de imagem por trás deles.

### Arno Becker

Arno é desenhado **por poses**. Cada quadro de animação é uma lista de ângulos: inclinação do tronco, coxa e canela de cada perna, braço e antebraço. Um renderizador traça o corpo com contorno de 1 px, pinta a camisa xadrez com uma função de padrão e encaixa a cabeça, que é desenhada à mão. Os colonos, os mineiros, o Ciclope e o Moço do Baile usam o mesmo renderizador com outras proporções e outras cores.

<p align="center">
  <img src="docs/img/arte-arno.png" width="49%" alt="Folha de sprites do Arno: parado, correndo, pulando, voadora, combo, giro especial, apanhando e com o revólver">
  <img src="docs/img/arte-retratos.png" width="49%" alt="Retratos dos diálogos: Arno (normal, susto, ferido), Dona Frida, Seu Kessler, o Demônio, a voz, o rádio, Ewald, Ingrid, o Moço do Baile e as sete fitas bentas">
</p>

### Criaturas e chefes

<p align="center">
  <img src="docs/img/arte-bestiario.png" width="49%" alt="Bestiário: assombração, cabeça-de-fogo, vulto, corvo, colono e colona possuídos e lobisomem">
  <img src="docs/img/arte-cap3.png" width="49%" alt="Personagens do capítulo 3: mineiro soterrado, morcego, pares de dançarinos, Ingrid, Ewald Becker e a bandinha do Erwin">
</p>

<p align="center">
  <img src="docs/img/arte-ciclope.png" width="768" alt="O Ciclope Gigante: pairando, rasante, lançando orbes, ferido e derrotado">
  <img src="docs/img/arte-demonio.png" width="768" alt="O Demônio Antigo: andando de quatro, investida, salto, erguido, garras, grito, atordoado e derrotado">
  <img src="docs/img/arte-moco.png" width="768" alt="O Moço do Baile: parado, com a gaita, dançando, laço, boleadeira, pisada, rodopio e atordoado">
</p>

### Cenário e itens

As casas de enxaimel são **geradas a partir de uma semente**, que decide o número de andares, a largura, o tipo de telhado (empena alta ou beiral), a cor do reboco, a cor das madeiras e do telhado e quais janelas ficam acesas. Com outra semente sai outra casa, então a rua não fica repetida. As araucárias também são procedurais, com tronco reto, verticilos de galhos que sobem na ponta e a copa achatada em forma de candelabro.

<p align="center">
  <img src="docs/img/arte-casas.png" width="768" alt="Seis casas de enxaimel diferentes, geradas por semente">
  <img src="docs/img/arte-arvores.png" width="768" alt="Araucárias de alturas diferentes, pinheiro, árvores de outono e pés de erva-mate">
</p>

<p align="center">
  <img src="docs/img/arte-itens.png" width="768" alt="Itens: cuca, linguiça, bolinho de batata, chimarrão, chopp, medalha de São Cristóvão, revólver, balas, as sete fitas, caixote, barril, saco de batata e placa">
</p>

---

## Como funciona por dentro

### A tela do Super Nintendo

- **Resolução de 256×224**, a mesma do SNES. O jogo desenha num canvas desse tamanho e amplia sem suavização. Quando a perda é pequena, ele arredonda a escala para um múltiplo inteiro, para os pixels ficarem todos do mesmo tamanho. Há também a opção de proporção de TV (pixel 8:7).
- **Laço com passo fixo de 60 Hz**: a lógica sempre avança em quadros de 1/60 s, então o jogo roda igual em qualquer tela.
- **Cores de 15 bits**: toda cor passa por uma quantização para 5 bits por canal, como no SNES:

  ```js
  function q5(v) {
    v = Math.round(v < 0 ? 0 : v > 255 ? 255 : v);
    var c = v >> 3;
    return (c << 3) | (c >> 2);
  }
  ```

- **Efeitos de hardware imitados**: degradês de céu por *scanline* (como o HDMA), fades de 16 passos, mosaico, rotação e escala de sprites, tremor de tela, flash, tarjas de cinema e *parallax* em várias camadas.
- **Iluminação**: as luzes da cena (postes de sódio, velas, janelas, chamas, a lamparina) vão para um buffer de luz que é multiplicado sobre a cena. Por cima entra um brilho aditivo, como um *bloom*. A neblina tem várias camadas, e cada zona da fase tem a sua cor de luz ambiente e a sua densidade de neblina.

<p align="center">
  <img src="docs/img/tela-crt.png" width="768" alt="O mesmo quadro dividido ao meio: à esquerda os pixels nítidos, à direita com o filtro CRT de scanlines e vinheta">
</p>
<p align="center"><sub>O mesmo quadro sem filtro (esquerda) e com o filtro CRT opcional (direita).</sub></p>

### Mode 7 e estrada pseudo-3D

- A tela-título e os créditos usam um **plano em perspectiva no estilo Mode 7**: cada linha da tela é uma fatia rotacionada e escalada de um mapa da cidade de 512×512, com o arroio, a estrada da serra, as ruas, a ponte, a praça, a igreja, os telhados, o cemitério e as copas das araucárias. O mapa também é desenhado por código.
- A cabine da abertura usa uma **estrada pseudo-3D** no estilo *Top Gear* / *Out Run*: curvas, subidas e descidas, placas e árvores escaladas e desenhadas do mais longe para o mais perto, a luz dos faróis perto e a neblina longe.

### Sprites a partir de texto

Os sprites menores são escritos como mapas de caracteres com uma paleta. Esta é a cuca, do jeito que está em `js/art_chars.js`:

```js
cuca: TC.sprite([
  '...kkkkkkkk...',
  '..kyYyYyYyYk..',
  '.kYyYyyYyYyYk.',
  'kccccccccccccck',
  'kppppppppppppk',
  'kccccccccccccck',
  'kCCCCCCCCCCCCk',
  '.kkkkkkkkkkkk.'
], { k: '#2a1810', y: '#f0d890', Y: '#d0a860', c: '#e8c070', C: '#b88a48', p: '#6a2a5a' }),
```

As cores também podem ser funções `(x, y) → cor`, e é assim que sai o xadrez da camisa do Arno. Há ainda a rotação por vizinho mais próximo, o contorno automático de 1 px, os círculos e polígonos nítidos por *scanline* e o *dithering* Bayer 4×4.

### Som e música

- **Síntese no navegador** com Web Audio. Os instrumentos (sino, caixinha de música, cordas, coro, baixo, flauta, gaita, violão, órgão, metais e uma bateria feita de ruído) são montados com osciladores, ondas de pulso, filtros e envelopes.
- **O eco do chip de som do SNES** é imitado por uma linha de atraso de 230 ms com realimentação de 0,42 e um filtro passa-baixa de 2,4 kHz.
- **A trilha é escrita em texto.** A notação é NOTA-duração em semicolcheias: `r` é pausa, `+` junta as notas de um acorde e `(..)*n` repete um trecho. Este é um pedaço da valsa da estrada, a valsa do pai do Arno:

  ```js
  S.drive = {
    bpm: 104, spb: 4,
    tracks: [
      { i: 'bass', n: 'D2-4 r-8 A1-4 r-8 G1-4 r-8 A1-4 r-8 ...' },
      { i: 'accordion', n: 'F#4-4 A4-4 D5-4 C#5-4 D5-4 E5-4 D5-8 B4-4 A4-12 ...' },
  ```

- Os efeitos sonoros também são sintetizados: os golpes, os pulos, os itens, o motor do caminhão (contínuo, acompanhando a rotação), a estática do rádio, o vento com grilos à noite e o sabiá ao amanhecer.
- **Fonte bitmap própria** com todos os acentos do português. Ela também tem os ícones dos botões dos controles.

### Fases, roteiros e capítulos

- As fases são mapas de *tiles* de 16 px (chão, plataforma vazada, pedra, água, tábua). Elas definem **arenas**, em que a câmera trava até as ondas de inimigos acabarem, **pontos de retorno** (as capelinhas), **zonas** de luz e neblina, **falas** que disparam em certos pontos, placas e itens.
- As cutscenes são escritas como **corrotinas** (geradores de JavaScript): "abre o diálogo e espera fechar", "anda até ali", "escurece em 30 quadros", e várias podem rodar em paralelo.
- Cada capítulo se encaixa na cena da fase por **ganchos** no objeto do nível (`L.init`, `L.update`, `L.bossSeq`, `L.clearSeq`, `L.hud`, `L.prepareBg`, `L.tileFor`, `L.saveExtra`, `L.nextScene`). Um capítulo novo é um arquivo de nível, um de arte e um de cenas, sem copiar o motor.

---

## Dificuldade

A dificuldade é escolhida ao começar o jogo e pode ser trocada a qualquer momento na pausa.

<p align="center">
  <img src="docs/img/menu-dificuldade.png" width="49%" alt="Menu de escolha da dificuldade: Fácil, Normal e Difícil">
</p>

| | Fácil | Normal | Difícil |
|---|---|---|---|
| Dano recebido | metade | 3/4 | inteiro |
| Encostar no inimigo machuca | não | não | sim |
| Inimigos atacando ao mesmo tempo | 1 | 2 | todos |
| Aviso antes do golpe inimigo | bem mais longo | mais longo | original |
| Vidas | 5 | 3 | 3 |
| Comida ao derrotar inimigos | às vezes | raramente | nunca |
| Chefe recupera a energia se o Arno cair | não | não | sim |

O **Difícil** é o balanceamento original de fliperama.

---

## Controles

| Ação | Teclado | Joystick (nomes do Xbox) | Celular / tablet |
|---|---|---|---|
| Mover | Setas / WASD | Direcional / analógico | Direcional na tela |
| Pular | Z / Espaço / K | A | Botão A (vermelho) |
| Atacar (combo X X X, voadora no ar) | X / J | X ou B | Botão B (amarelo) |
| Giro especial (gasta um pouco de energia ao acertar) | C / L | Y, RB ou RT | Botão Y (verde) |
| Ler placas | ↑ perto da placa | ↑ | ↑ no direcional |
| Atirar com o revólver (capítulos 2 e 3, gasta 1 bala) | V / I ou ↑ + X | LB / LT ou ↑ + ataque | ↑ no direcional + botão B |
| Pausa | Enter / Esc | Start | START |
| Tela cheia / mudo | F / M | — | Botões pequenos no topo |
| Menus e diálogos | Setas + Z / Enter | Direcional + A | Tocar direto no item ou na tela |

<p align="center">
  <img src="docs/img/menu-controles.png" width="49%" alt="Tela de controles do jogo, com as teclas de cada ação">
</p>

### Joystick

O jogo reconhece sozinho os controles de **Xbox**, **PlayStation** e **Nintendo**, além de controles USB genéricos. As dicas na tela mostram os nomes certos dos botões para cada um (A/X, ✕/□, B/Y). Em **Opções → Controle (joystick)** há:

- um teste dos botões ao vivo;
- **Configurar botões**: o jogo pede cada ação e você aperta o botão que quer usar. A configuração fica salva para cada modelo de controle;
- vibração ligada ou desligada, e a opção de restaurar o padrão.

O controle vibra ao levar dano e nos tremores fortes. Se ele desconectar, o jogo pausa sozinho. Segurar ↑ ou ↓ repete nos menus.

<p align="center">
  <img src="docs/img/menu-joystick.png" width="49%" alt="Tela Controle (joystick): Xbox reconhecido automaticamente, configurar botões, vibração, restaurar padrão e teste ao vivo">
</p>

### Versão para celular e tablet

O jogo se adapta sozinho à tela de toque, sem instalar nada:

- **Deitado**: a imagem fica no centro e os controles nas laterais, como num portátil. Em telas mais largas (tablets), os controles ficam semitransparentes por cima das bordas da imagem, para ela não encolher demais.
- **Em pé**: a imagem fica em cima e embaixo aparece o corpo do controle, com direcional, botões A/B/Y e START.
- **O direcional aceita o polegar torto**: a faixa horizontal é mais larga, para que andar não aperte ↑ sem querer perto das placas. Também dá para deslizar o dedo de um botão a outro (do B para o A, por exemplo) sem levantar.
- **Menus e diálogos** funcionam tocando direto na tela. Nos itens com valor, tocar na metade esquerda do valor diminui e na metade direita aumenta.
- **Tela cheia**: o primeiro toque coloca o jogo em tela cheia nos navegadores que permitem isso (Android). No iPhone, use **Compartilhar → Adicionar à Tela de Início** para jogar sem as barras do Safari.
- **Opções extras**: em **Opções** aparecem dois itens a mais, o tamanho dos botões na tela (pequenos, médios ou grandes) e a vibração (só no Android).
- **Pausa e tela**: ao trocar de app ou bloquear a tela, a fase pausa sozinha e o som é suspenso. Enquanto o jogo está aberto, a tela do aparelho não apaga.
- **Teclado ou controle Bluetooth**: se você ligar um, os botões da tela somem. Eles voltam no próximo toque.

<p align="center">
  <img src="docs/img/celular-deitado.png" width="768" alt="O jogo num celular deitado: a imagem no centro, o direcional à esquerda e os botões Y, B e A à direita">
</p>
<p align="center">
  <img src="docs/img/celular-em-pe.png" width="300" alt="O jogo num celular em pé: a imagem em cima e o corpo do controle embaixo">
</p>

---

## Opções, filtro CRT e idiomas

Em **Opções** dá para trocar a dificuldade, o idioma (português ou inglês), o filtro CRT, a aberração cromática, a proporção (pixel quadrado ou TV), o volume da música e dos efeitos, o joystick e a tela cheia. O jogo inteiro está traduzido para o inglês, menos o nome da cidade, que é sempre Teewald.

<p align="center">
  <img src="docs/img/menu-opcoes.png" width="49%" alt="Menu de opções">
  <img src="docs/img/menu-capitulos.png" width="49%" alt="Menu de capítulos com os três capítulos">
  <img src="docs/img/en-cabine.png" width="49%" alt="A abertura em inglês: Look at those araucarias...">
  <img src="docs/img/en-hud.png" width="49%" alt="O HUD em inglês no capítulo 2: SCORE e FIRE THE .38">
</p>

---

## Rodar localmente

Abra o `index.html` no navegador. Como os scripts são clássicos (não são módulos), o jogo funciona até por `file://`.

Se preferir um servidor local:

```bash
npx serve .
# ou
python -m http.server 8000
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "Teewald City"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/teewald-city.git
   git push -u origin main
   ```
2. No GitHub, vá em **Settings → Pages**. Em *Source*, escolha **Deploy from a branch**, a branch **main** e a pasta **/ (root)**.
3. O jogo fica disponível em `https://SEU_USUARIO.github.io/teewald-city/`.

O arquivo `.nojekyll` desativa o processamento Jekyll do Pages. A pasta `ref/` (imagens de referência) está no `.gitignore` para não ser publicada. Se quiser publicá-la, remova a linha do `.gitignore`.

## Estrutura do código

```
index.html          página e ordem de carregamento dos scripts
manifest.webmanifest, icon.svg   instalação na tela de início do celular
css/style.css       posição da tela, filtro CRT, visual do controle na tela
js/core.js          utilidades, cores 15-bit, RNG, opções salvas, níveis de dificuldade
js/gfx.js           canvas, buffers de pixel, sprites, rotação, ruído
js/font.js          fonte bitmap com acentos do português e ícones dos botões
js/lang.js          textos em português e inglês
js/input.js         teclado, joystick (reconhecimento, configuração, vibração) e controle virtual de toque
js/audio.js         sintetizador, eco, sequenciador e efeitos
js/music.js         trilha sonora em notação de texto
js/fx.js            fade, mosaico, tremor, partículas, iluminação, corrotinas
js/ui.js            janelas, caixa de diálogo com retrato, menus, avisos
js/art_env.js       céu, lua, serras, araucárias, casas de enxaimel, igreja, tiles
js/art_chars.js     Arno (por poses), inimigos, chefe, itens, retratos
js/art_ch2.js       capítulo 2: colonos possuídos, lobisomem, o Demônio Antigo, revólver, fitas, pavilhão, atafona, serraria, carijó, toco
js/art_ch3.js       capítulo 3: mineiros, morcegos, dançarinos, o Moço do Baile, Ewald, Ingrid, mina, elevador, gruta e salão do baile
js/art_cab.js       cabine do caminhão, volante, placas de estrada
js/road.js          estrada pseudo-3D
js/mode7.js         plano em perspectiva "Mode 7" e mapa da cidade
js/main.js          laço de 60 Hz, troca de cenas, escala da tela e pós-processamento
js/scenes/          boot, título, abertura, final, capítulos 2 e 3 (chapter2.js, chapter3.js: prólogos e finais) e depuração
js/stage/           entidades, jogador, inimigos (enemies2.js e enemies3.js: os dos capítulos 2 e 3), layout das fases (level1.js, level2.js, level3.js) e cena da fase
docs/img/           prints e GIFs deste README (o jogo não usa nenhum deles)
```

Toda a arte e todo o som são gerados por código quando o jogo carrega. O jogo não usa imagens nem arquivos de áudio, só o pequeno `icon.svg` do app (o ícone do iPhone também é desenhado pelo jogo).

## Parâmetros de depuração

Acrescente os parâmetros à URL, por exemplo `index.html?scene=stage&x=4200`:

- `scene=title|intro|stage|ending|ch2intro|ending2|ch3intro|ending3|debug` abre direto numa cena. `debug&page=0..10` mostra as artes (5 a 8 são do capítulo 2 e 9 e 10 do capítulo 3).
- `ch=2` ou `ch=3` (com `scene=stage`) abre a fase desse capítulo. `ribbons=N` já começa com N fitas e `bosshp=N` define a energia do chefe.
- `lang=pt|en` define o idioma.
- `diff=easy|normal|hard` define a dificuldade.
- `x=NNNN` começa a fase nessa posição. `god=1` deixa o Arno praticamente invencível.
- `wake=1` (com `scene=stage`) roda a sequência do despertar.
- `bot=1` liga o piloto automático e `auto=1` passa os diálogos sozinho.
- `ff=N` avança N quadros instantaneamente ao carregar. Com ele, dá para simular botões: `press=quadro:ação,...` aperta uma vez, `hold=ação:início-fim` segura e `every=ação:início:intervalo:fim` aperta repetidamente.
- `perf=1` mede o tempo de cada quadro no console. `audio=1&sfxtest=1` toca todos os efeitos e músicas procurando erros (no Edge e no Chrome, use `--autoplay-policy=no-user-gesture-required`).
- `touch=1` força o controle de toque na tela (útil para testar no computador) e `touch=0` esconde. `tap=quadro:x:y,...` (com `ff=`) simula toques na imagem do jogo, em pixels do jogo.
