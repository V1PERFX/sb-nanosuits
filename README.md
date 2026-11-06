# Nanosuit Locker — Stellar Blade

Checklist das 130 nanosuits de Stellar Blade, na mesma ordem em que aparecem na tela de inventário do jogo.
Site estático, sem build e sem dependências: é só abrir o `index.html` no navegador.

## Como usar

- **Run atual (1ª / NG+ / NG++)** — filtra a lista para mostrar só o que é obtenível até aquela run. O contador grande acompanha esse escopo.
- **Busca** — procura por nome da suit, região, NPC ou missão (ex.: `Roxanne`, `Mural`, `Rotten`).
- **Região** — filtra por Xion, Eidos 7, Great Desert, Wasteland, etc.
- **Agrupamento** — ordem do inventário (padrão) ou agrupado por região, útil pra planejar uma rota de coleta.
- **Ocultar coletadas** — deixa na tela só o que falta.
- **Zerar progresso** — desmarca tudo (pede confirmação), pra começar um save novo.

O progresso fica no `localStorage` do navegador: sobrevive a fechar a aba, mas é por navegador/dispositivo e some se você limpar os dados do site.

## Tiers

| Símbolo | Tier | Significado |
| --- | --- | --- |
| ◾ | Inicial | Você já começa com ela |
| 🔹 | 1ª run | Obtenível na primeira run |
| 🔸 | NG+ | Obtenível no NG+, se a variante da 1ª run já foi coletada |
| 🔺 | NG++ | Obtenível no NG++, se a variante de NG+ já foi coletada |
| ◽ | Requisito | Liberada ao cumprir um requisito específico (boss challenge, fim da história…) |
| ♻️ | DLC | Vem do DLC correspondente |

Lembrete que o site também mostra: **pegue as suits ligadas a side-missions de Xion antes de viajar para o Orbital Elevator (Spire 4).**

## Estrutura

```
index.html            marcação da página
assets/css/style.css  tema escuro e layout
assets/js/data.js     as 130 nanosuits: nome, tier, região, local
assets/js/app.js      filtros, render e persistência
assets/img/           arte de cada suit
```

Pra corrigir ou acrescentar uma suit, edite só o `assets/js/data.js` — a lista é a única fonte de verdade da página.

## Sobre os nomes

Estão todos em inglês, do jeito que vieram do guia original. Ainda não instalei o jogo de novo só pra conferir como cada suit se chama na tradução, então vou trocando pelos nomes em português conforme for jogando na versão de Switch 2.

## Créditos

- Lista e locais de obtenção: guia do **Crimsomrider** na Steam — https://steamcommunity.com/sharedfiles/filedetails/?id=3593187749
- Artes das nanosuits: **Stellar Blade Wiki** — https://stellarblade.fandom.com/wiki/Stellar_Blade_Wiki

## Imagens

Cada linha da lista puxa `assets/img/<nome exato da suit>.webp` — o nome do arquivo tem que bater com o campo `n` do `data.js`, acentos e parênteses inclusos. Clicar na arte abre a imagem grande; clicar em qualquer outro ponto da linha marca a suit.
