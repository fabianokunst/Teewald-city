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
  - Itens regionais: cuca, linguiça, chimarrão, pinhão e a medalha de São Cristóvão (vida extra). Caixotes e barris quebráveis, capelinhas de beira de estrada que servem de ponto de retorno, placas legíveis.
- **Final do capítulo**: o sino, Dona Frida na porta da igreja, as cabeças-de-fogo acendendo nas colinas e os créditos.
- Efeitos no estilo SNES: cores de 15 bits, degradês por *scanline*, mosaico, fades de 16 passos, rotação e escala, iluminação com luz de sódio e de velas, neblina em camadas, *parallax*.
- **Trilha e efeitos sonoros sintetizados** com Web Audio, com o eco do DSP do SNES: valsa de gaita para a estrada, tema de caixinha de música, faixa de ação, música do chefe e órgão da igreja.
- **Três níveis de dificuldade**, escolhidos ao começar o jogo e trocáveis a qualquer momento na pausa:
  - **Fácil**: os golpes tiram metade da energia, um inimigo ataca por vez, ataques mais lentos e com mais aviso, 5 vidas, inimigos às vezes deixam cair comida, e o chefe não recupera a energia se o Arno cair.
  - **Normal**: só os ataques machucam (encostar não), no máximo dois inimigos atacam juntos.
  - **Difícil**: o balanceamento original de fliperama, em que até encostar machuca.
- Português e inglês, filtro CRT opcional, aberração cromática opcional, proporção 4:3, controle e toque.

## Controles

| Ação | Teclado | Controle | Celular / tablet |
|---|---|---|---|
| Mover | Setas / WASD | D-pad / analógico | Direcional na tela |
| Pular | Z / Espaço / K | A | Botão A (vermelho) |
| Atacar (combo X X X, voadora no ar) | X / J | B / X | Botão B (amarelo) |
| Giro especial (gasta um pouco de energia ao acertar) | C / L | Y / RB | Botão Y (verde) |
| Ler placas | ↑ perto da placa | ↑ | ↑ no direcional |
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
js/art_cab.js       cabine do caminhão, volante, placas de estrada
js/road.js          estrada pseudo-3D
js/mode7.js         plano em perspectiva "Mode 7" e mapa da cidade
js/scenes/          boot, título, abertura, final e depuração
js/stage/           entidades, jogador, inimigos, layout da fase e cena da fase
```

Toda a arte e todo o som são gerados por código quando o jogo carrega. Não há imagens nem arquivos de áudio, só o pequeno `icon.svg` do app (o ícone do iPhone também é desenhado pelo jogo).

## Parâmetros de depuração (opcionais)

Acrescente à URL, por exemplo `index.html?scene=stage&x=4200`:

- `scene=title|intro|stage|ending|debug` abre direto numa cena (`debug&page=0..4` mostra as artes)
- `lang=pt|en` define o idioma
- `diff=easy|normal|hard` define a dificuldade
- `x=NNNN` começa a fase nessa posição; `god=1` deixa o Arno praticamente invencível
- `wake=1` (com `scene=stage`) roda a sequência do despertar
- `touch=1` força o controle de toque na tela (útil para testar no computador); `touch=0` esconde
- `tap=quadro:x:y,...` (com `ff=`) simula toques na imagem do jogo, em pixels do jogo
