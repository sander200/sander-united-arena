# Sander United Arena 🎮

Um jogo HTML5 de ação em arena, inspirado no conceito visual enviado para o projeto:
**Sander vs. Némesis (a calopsita guerreira)** na Estação Paulista.

> Este projeto foi pensado para rodar diretamente no navegador e ser publicado no GitHub Pages, sem backend.

## Objetivo

Colete **Gemas de Energia** para carregar sua energia e fortalecer seus ataques. Não existe pontuação: a meta é derrotar o Némesis antes que o cronômetro de 3 minutos termine.

### Modos
- **Básico** — Némesis mais lento, menor dano e menos vida.
- **Médio** — equilíbrio recomendado.
- **Difícil** — Némesis mais agressivo, rápido e resistente.

## Controles

| Ação | Teclado |
|---|---|
| Mover | ↑ ↓ ← → |
| Ataque básico | Z |
| Ataque especial | X |
| Teletransporte | C |
| Pausar | P / botão PAUSE |

No celular/tablet aparecem controles virtuais na tela.

### Teletransporte
O teletransporte pode ser usado para escapar ou reposicionar Sander.
Depois de usado, o poder precisa de **30 segundos** para recarregar.

## Sistemas incluídos

- Tela de introdução com **SanderVerse** e aura energética.
- Seleção de dificuldade.
- Arena com o mapa da Estação Paulista.
- Sander com sprite sheet.
- Némesis com sprite sheet.
- Gemas de energia coletáveis.
- Combate corpo a corpo.
- Ataque especial energético.
- IA do Némesis.
- Vida/energia dos dois combatentes.
- Cronômetro de 3:00.
- Vitória/derrota/reinício.
- Pausa.
- Controles para teclado e touchscreen.
- Efeitos visuais de impacto, aura, partículas e teletransporte.
- Sons sintetizados via Web Audio API, sem arquivos externos.
- Layout responsivo.
- Nenhuma dependência obrigatória de servidor ou framework.

## Estrutura

```text
sander-united-arena/
├── index.html
├── styles.css
├── game.js
├── README.md
├── assets/
│   ├── map-estacao-paulista.png
│   ├── sander-sprites.png
│   ├── nemesis-sprites.png
│   └── nemesis-reference.png
└── docs/
    └── demo-reference.jpg
```

## Como jogar localmente

Abra `index.html` no navegador.

Para desenvolvimento local com servidor:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## GitHub Pages

1. Crie um repositório.
2. Envie todos os arquivos mantendo a estrutura acima.
3. Vá em **Settings → Pages**.
4. Selecione a branch principal e a pasta `/root`.
5. Salve e abra o endereço do GitHub Pages.

## Próximas evoluções recomendadas

- Adicionar uma segunda e terceira arena.
- Criar ataques próprios para cada dificuldade.
- Adicionar bosses intermediários.
- Sistema de combos e stun.
- Sprites individuais por frame em vez de sprite sheets.
- Música de batalha em loop.
- Partículas adicionais e câmera com screen shake.
- Salvamento local de progresso.
- Tela de seleção de personagem.
- Ranking opcional apenas para tempo de vitória (sem alterar a essência do combate).

## Créditos dos assets do projeto

As imagens de Sander, Némesis, mapa e referência visual usadas nesta versão foram fornecidas/geradas dentro deste projeto para servir como material do jogo e protótipo.
