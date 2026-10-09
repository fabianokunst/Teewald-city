# Teewald City

Jogo de plataforma e ação 2D em pixel art no estilo Super Nintendo, ambientado em uma cidade de casas em enxaimel na serra do sul do Brasil. Funciona só com HTML, CSS e JavaScript, sem build e sem dependências, então roda direto no GitHub Pages gratuito.

> *2D platformer/brawler in SNES-style pixel art, set in a half-timbered town in the highlands of southern Brazil. Pure front-end, no build step. Playable in Portuguese and English.*

## Capítulo 1 — A Cidade Adormecida

Outono de 1997. Arno Becker, caminhoneiro, volta a subir a serra de Teewald City depois de vinte anos. Na cabine ele relembra a cidade como era: araucárias enormes sob a lua cheia, as casas de enxaimel, a torre da igreja, a Festa da Batata. O rádio chia um aviso, a neblina fecha a estrada e, do nada, ele perde o controle do caminhão.

Arno acorda caído numa rua de Teewald. A cidade continua linda, mas está vazia e tomada por criaturas.

### O que tem no jogo

- **Abertura em cutscene**: cartão de abertura, plano geral da serra com o caminhão descendo de faróis acesos, interior da cabine com estrada pseudo-3D e sprites escalados (estilo *Top Gear*), terço balançando no retrovisor, rádio com estática, neblina, perda de controle e corte seco para o preto (o acidente não é mostrado).
- **Tela-título com voo em "Mode 7"** sobre o mapa da cidade iluminada, com logotipo que entra girando e crescendo.
- **Fase 1** com plataforma e combate quase de *beat 'em up*: arenas onde a câmera trava até as ondas acabarem, combo de 3 golpes, voadora, giro especial, *hit-stop*, barra de vida do inimigo, contador de golpes.
  - Inimigos: **Assombrações**, **Cabeças-de-Fogo** (cabeças flutuantes com cauda de chamas), **Vultos**, **Corvos** e o chefe **O Ciclope Gigante**.
  - Cenários: rua de entrada, rua principal com a padaria, ponte do arroio, cemitério da colônia com velas e neblina, ladeira de pedra e praça da igreja gótica com o coreto.
  - Itens regionais: cuca, linguiça, bolinho de batata, chimarrão ou chopp (sorteado; os dois enchem a vida) e a medalha de São Cristóvão (vida extra). Caixotes e barris quebráveis, capelinhas de beira de estrada que servem de ponto de retorno, placas legíveis.
- **Final do capítulo**: o sino, Dona Frida na porta da igreja, as cabeças-de-fogo acendendo nas colinas e os créditos.
- Efeitos no estilo SNES: cores de 15 bits, degradês por *scanline*, mosaico, fades de 16 passos, rotação e escala, iluminação com luz de sódio e de velas, neblina em camadas, *parallax*.
- **Trilha e efeitos sonoros sintetizados** com Web Audio, com o eco do DSP do SNES: valsa de gaita para a estrada, tema de caixinha de música, faixa de ação, música do chefe e órgão da igreja.
- **Três níveis de dificuldade**, escolhidos ao começar o jogo e trocáveis a qualquer momento na pausa:
  - **Fácil**: os golpes tiram metade da energia, um inimigo ataca por vez, ataques mais lentos e com mais aviso, 5 vidas, inimigos às vezes deixam cair comida, e o chefe não recupera a energia se o Arno cair.
  - **Normal**: só os ataques machucam (encostar não), no máximo dois inimigos atacam juntos.
  - **Difícil**: o balanceamento original de fliperama, em que até encostar machuca.
- Português e inglês, filtro CRT opcional, aberração cromática opcional, proporção 4:3, controle e toque.

## Capítulo 2 — A Trilha das Fitas

A mesma noite, que não termina. Dentro da Igreja Matriz, Dona Frida, a benzedeira, passa um chimarrão para o Arno e conta a lenda do **Antigo** (*der Alte*). Ele veio escondido no porão do veleiro dos colonos do Hunsrück, em 1852, junto com as batatas-semente. Os ervateiros o chamavam de **Mão-Comprida**: um bicho pálido que anda de quatro, com braços compridos demais, pelas estradas do mato em noite de cerração.

A bisavó de Frida, a Oma Hedwig, amarrou o bicho nas raízes do **Pinheiro Velho**, a araucária mais antiga do erval, com sete fitas bentas e uma reza. Por isso, todo mês de maio, as moças dançavam o **pau-de-fita** em volta da árvore, e cada volta da dança renovava os nós. Com o tempo a amarração virou festa e ninguém mais lembrou por quê. Em maio de 1997, a serraria Kessler derrubou o pinheiro para fazer as tábuas do pavilhão novo da Festa da Batata. Naquela noite veio a cerração.

A missão é uma **caçada**: o Mão-Comprida anda ferido pelo erval e vai perdendo pelo caminho as fitas que ainda estavam enroscadas no couro. Cada fita tem um verso da reza bordado em ponto de cruz. O Arno segue o rastro das sete fitas até o toco do Pinheiro Velho, onde o bicho volta para dormir antes de a lua descer.

### O que tem no capítulo 2

- **Prólogo na igreja** com vitrais ao luar, velas e quatro quadros ilustrados da lenda no estilo livro de histórias: o veleiro de 1852, a amarração no Pinheiro Velho, a dança do pau-de-fita (animada) e o pinheiro derrubado.
- **O revólver 38 do Arno**: Dona Frida achou o revólver no mato, na curva da serra, porque estava no porta-luvas do caminhão sumido, e benzeu a arma. A munição é contada no HUD e aparece em caixas de balas (na Sociedade de Tiro, em caixotes e às vezes com inimigos derrotados). O tiro é forte, mas as balas são poucas.
- **Fase 2** (cerca de 4.800 pixels de comprimento): praça da igreja → rua da Cervejaria Schmitt e da Sociedade de Tiro → pavilhão da Festa da Batata, com bandeirinhas e o palco da bandinha → atafona dos Weber, com a roda-d'água girando sozinha, e a ponte do arroio → Serraria Kessler, com a serra circular, as pilhas de toras e um Fenemê carregado de pinheiro → o erval dos Becker, com o carijó aceso e as taipas → a clareira do toco.
  - Inimigos novos: **colonos possuídos** (moradores levados pela cerração que atacam com enxada e forcado; derrotados, a sombra sai do corpo e eles voltam a si), o **lobisomem** (anda em volta, se agacha e dá o bote) e o chefe **O Demônio Antigo**.
  - O chefe tem três ataques avisados: **investida** de quatro, que se pula por cima, e depois ele fica atordoado ao bater no tronco; **salto**, com uma sombra vermelha marcando onde vai cair; e **garras**, quando ele se ergue sobre as patas de trás. Depois da metade da energia a clareira escurece e ele chama assombrações.
  - **Sete fitas bentas** para encontrar, com contador no HUD. Cada uma revela um verso da reza, e no final o Arno usa as sete para amarrar o bicho de novo.
  - Cenas no meio da fase: o Mão-Comprida aparece em cima das toras da serraria e foge para o mato, e o **Seu Kessler** é libertado, conta o que fez e entrega uma fita. Ele também conta o que aconteceu com o pai do Arno em 1977.
  - Sacos de batata quebráveis, caixas de balas, placas novas para ler e falas do Arno ao passar pelos lugares da infância dele.
- **Final do capítulo**: a amarração com a reza completa, o toco que se abre, uma bandinha tocando lá embaixo, a lua que fica vermelha e uma voz conhecida chamando o Arno.
- **Músicas novas**: o "Vanerão do Erval", com a gaita no ritmo da vaneira gaúcha; o *Dies Irae* no órgão para o chefe; o tema da lenda; a tensão da caçada; e a valsa da estrada tocada por uma bandinha desafinada.
- O capítulo 1 termina e emenda direto no prólogo do capítulo 2. Na tela-título, o menu **Capítulos** permite começar qualquer um dos dois, e **Continuar** lembra em que capítulo você estava (com as fitas e as balas).

## Controles

| Ação | Teclado | Controle | Celular / tablet |
|---|---|---|---|
| Mover | Setas / WASD | D-pad / analógico | Direcional na tela |
| Pular | Z / Espaço / K | A | Botão A (vermelho) |
| Atacar (combo X X X, voadora no ar) | X / J | B / X | Botão B (amarelo) |
| Giro especial (gasta um pouco de energia ao acertar) | C / L | Y / RB | Botão Y (verde) |
| Ler placas | ↑ perto da placa | ↑ | ↑ no direcional |
| Atirar com o revólver (capítulo 2, gasta 1 bala) | V / I ou ↑ + X | LB / LT ou ↑ + B | ↑ no direcional + botão B |
| Pausa | Enter / Esc | Start | START |
| Tela cheia / mudo | F / M | — | Botões pequenos no topo |
| Menus e diálogos | Setas + Z / Enter | D-pad + A | Tocar direto no item ou na tela |

### Versão para celular e tablet

O jogo se adapta sozinho à tela de toque, sem instalar nada:

- **Deitado**: a imagem fica no centro e os controles nas laterais, como num portátil. Em telas mais largas (tablets) os controles ficam semitransparentes por cima das bordas da imagem, para ela não encolher demais.
- **Em pé**: a imagem fica em cima e embaixo aparece o corpo do controle, com direcional, botões A/B/Y e START.
- O direcional aceita o polegar torto: a faixa horizontal é mais larga, para que andar não aperte ↑ sem querer perto das placas. Dá para deslizar o dedo de um botão a outro (do B para o A, por exemplo) sem levantar.
- Os menus e os diálogos funcionam tocando direto na tela. Nos itens de valor, tocar na metade esquerda do valor diminui e na direita aumenta.
- O primeiro toque coloca o jogo em tela cheia nos navegadores que permitem isso (Android). No iPhone use **Compartilhar → Adicionar à Tela de Início** para jogar sem as barras do Safari.
- Em **Opções** aparecem dois itens a mais: o tamanho dos botões na tela (pequenos, médios ou grandes) e a vibração (só no Android).
- Ao trocar de app ou bloquear a tela, a fase pausa sozinha e o som é suspenso. Enquanto o jogo está aberto, a tela do aparelho não apaga.
- Se você ligar um teclado ou controle Bluetooth, os botões da tela somem. Eles voltam no próximo toque.

## Rodar localmente

Abra o `index.html` no navegador. Como os scripts são clássicos (não são módulos), funciona até por `file://`.

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
2. No GitHub, vá em **Settings → Pages**, em *Source* escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**.
3. O jogo fica disponível em `https://SEU_USUARIO.github.io/teewald-city/`.

O arquivo `.nojekyll` desativa o processamento Jekyll do Pages. A pasta `ref/` (imagens de referência) está no `.gitignore` para não ser publicada. Se quiser publicá-la, remova a linha do `.gitignore`.

## Estrutura

```
index.html          página e ordem de carregamento dos scripts
manifest.webmanifest, icon.svg   instalação na tela de início do celular
css/style.css       posição da tela, filtro CRT, visual do controle na tela
js/core.js          utilidades, cores 15-bit, RNG, opções salvas
js/gfx.js           canvas, buffers de pixel, sprites, rotação, ruído
js/font.js          fonte bitmap com acentos do português
js/lang.js          textos em português e inglês
js/input.js         teclado, controle físico e controle virtual de toque (layout e áreas de acerto)
js/audio.js         sintetizador, eco, sequenciador e efeitos
js/music.js         trilha sonora em notação de texto
js/fx.js            fade, mosaico, tremor, partículas, iluminação, corrotinas
js/ui.js            janelas, caixa de diálogo com retrato, menus
js/art_env.js       céu, lua, serras, araucárias, casas de enxaimel, igreja, tiles
js/art_chars.js     Arno (por poses), inimigos, chefe, itens, retratos
js/art_ch2.js       capítulo 2: colonos possuídos, lobisomem, o Demônio Antigo, revólver, fitas, pavilhão, atafona, serraria, carijó, toco
js/art_cab.js       cabine do caminhão, volante, placas de estrada
js/road.js          estrada pseudo-3D
js/mode7.js         plano em perspectiva "Mode 7" e mapa da cidade
js/scenes/          boot, título, abertura, final, capítulo 2 (prólogo na igreja e final) e depuração
js/stage/           entidades, jogador, inimigos (enemies2.js: os do capítulo 2), layout das fases (level1.js, level2.js) e cena da fase
```

Toda a arte e todo o som são gerados por código quando o jogo carrega. Não há imagens nem arquivos de áudio, só o pequeno `icon.svg` do app (o ícone do iPhone também é desenhado pelo jogo).

## Parâmetros de depuração (opcionais)

Acrescente à URL, por exemplo `index.html?scene=stage&x=4200`:

- `scene=title|intro|stage|ending|ch2intro|ending2|debug` abre direto numa cena (`debug&page=0..8` mostra as artes; 5 a 8 são do capítulo 2)
- `ch=2` (com `scene=stage`) abre a fase do capítulo 2; `ribbons=N` já começa com N fitas; `bosshp=N` define a energia do chefe
- `lang=pt|en` define o idioma
- `diff=easy|normal|hard` define a dificuldade
- `x=NNNN` começa a fase nessa posição; `god=1` deixa o Arno praticamente invencível
- `wake=1` (com `scene=stage`) roda a sequência do despertar
- `touch=1` força o controle de toque na tela (útil para testar no computador); `touch=0` esconde
- `tap=quadro:x:y,...` (com `ff=`) simula toques na imagem do jogo, em pixels do jogo
