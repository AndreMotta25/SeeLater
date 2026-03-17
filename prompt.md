# Depois 📌

> App para resgatar conteúdos salvos que você acaba esquecendo

**Documento de Planejamento · Março 2026 · v1.0**

---

## 🎯 Problema

O usuário salva links no Instagram, YouTube e outros sites para ver depois — mas a lista cresce infinitamente e nada traz esse conteúdo de volta à superfície. O resultado é um **"cemitério de salvos"** que nunca é consumido.

---

## 💡 Solução

Um PWA chamado **Depois** que salva links, enriquece automaticamente com título e thumbnail, e usa lembretes inteligentes — incluindo IA leve rodando no próprio navegador — para trazer o conteúdo esquecido de volta à superfície.

---

## 🛠️ Stack Técnica

| Tecnologia              | Papel                                  |
| ----------------------- | -------------------------------------- |
| Next.js 14 (App Router) | Framework principal + PWA              |
| next-pwa                | Service Worker + app instalável        |
| Dexie.js                | IndexedDB — dados ficam no dispositivo |
| Zustand                 | Estado global simples                  |
| Tailwind                | Estilo                                 |
| Vercel                  | Deploy                                 |

---

## 📦 Versões e Funcionalidades

### ⭐ MVP — Base do produto

- Salvar link manualmente (colar URL)
- Enriquecimento automático do link (título, thumbnail, tipo)
- Listar itens salvos
- Marcar como visto
- Deduplicação por URL normalizada

### V2 — Lembretes

- Notificações periódicas (Web Push)
- Tela de abertura com sugestão aleatória
- Revisão semanal (digest)

### V3 — IA Local

- Categorização automática com `nli-deberta-v3-small`
- Sugestão por similaridade semântica com `all-MiniLM-L6-v2`
- Ativada por padrão na primeira abertura do app
- Tela de "Preparando..." com progresso real durante o download
- Modelos em cache após o primeiro download — abre instantâneo nas próximas vezes

### V4 — Expansão

- Extensão de navegador
- Compartilhamento nativo mobile
- Instagram via oEmbed (requer token Meta)

---

## 🔍 Enriquecimento Automático de Links

Ao salvar uma URL, o app busca automaticamente título, thumbnail, tipo e descrição — sem o usuário precisar digitar nada. O Next.js age como intermediário para resolver o problema de CORS.

### Fluxo

```
Usuário cola URL
      ↓
Browser chama /api/enrich
      ↓
Next.js faz fetch com User-Agent de browser
      ↓
Extrai Open Graph tags (title, image, description)
      ↓
YouTube? → chama também oEmbed API (sem chave)
      ↓
Detecta tipo por domínio + padrão de URL
      ↓
Retorna card de preview → usuário confirma → salva
```

### Campos extraídos

| Campo     | Fonte              | Exemplo                       |
| --------- | ------------------ | ----------------------------- |
| Título    | `og:title`         | "Como fazer pão caseiro"      |
| Thumbnail | `og:image`         | URL da capa                   |
| Descrição | `og:description`   | Trecho do conteúdo            |
| Site      | `og:site_name`     | "YouTube", "GitHub"           |
| Tipo      | Lógica + `og:type` | vídeo / artigo / repo / tweet |
| Favicon   | `/favicon.ico`     | Ícone do site                 |

### YouTube — Tratamento especial

Usa o endpoint oEmbed público e gratuito (sem chave de API). Thumbnail em alta qualidade via URL direta:

```
https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg
```

### Deduplicação

Antes de salvar, normaliza a URL removendo parâmetros de tracking como `?si=`, `?utm_source=`, etc. Evita duplicatas do mesmo conteúdo.

### Instagram — fora do MVP

O Instagram bloqueia scraping ativamente, exigindo token da Meta para oEmbed. Fica planejado para a V4.

---

## 🤖 IA Local no Navegador (V3)

Nenhum dado sai do dispositivo. Modelos em formato ONNX rodam via **Transformers.js** usando WebGPU (ou WebAssembly como fallback). O modelo fica em cache após o primeiro download.

### Modelos escolhidos

| Tarefa                    | Modelo                        | Tamanho    |
| ------------------------- | ----------------------------- | ---------- |
| Classificação automática  | `Xenova/nli-deberta-v3-small` | ~85MB      |
| Sugestão por similaridade | `Xenova/all-MiniLM-L6-v2`     | ~23MB      |
| **Total**                 |                               | **~108MB** |

### O que cada modelo faz

**`nli-deberta-v3-small` — Classificação**
Lê o título e a descrição do link salvo e atribui categorias como Tecnologia, Design, Culinária, etc. — sem o usuário fazer nada.

**`all-MiniLM-L6-v2` — Sugestão semântica**
Gera embeddings dos títulos, compara o histórico do usuário com a fila e sugere o item semanticamente mais relevante no momento de abertura do app.

### Como os dois trabalham juntos

```
Item salvo → deberta classifica → "Tecnologia / Next.js"
                                        ↓
                            MiniLM gera embedding do título
                                        ↓
                        Salva categoria + embedding no IndexedDB
                                        ↓
              Na abertura → compara embeddings do histórico visto
              com embeddings da fila → sugere o mais similar
```

### Como a recomendação funciona

O `all-MiniLM-L6-v2` transforma texto em vetores numéricos chamados **embeddings**. Textos com significado parecido geram vetores parecidos, independente das palavras exatas usadas.

**1. Quando o usuário salva um item**
O MiniLM lê o título + descrição e gera um vetor com 384 números representando o "significado" daquele conteúdo. Esse vetor é salvo no IndexedDB junto com o item.

**2. Quando o usuário marca um item como visto**
O app registra o embedding desse item como parte do "perfil de interesse" do usuário — uma lista do que ele realmente consumiu.

**3. Na abertura do app**
O app calcula a média dos embeddings dos últimos itens vistos (interesse recente), compara com todos os itens da fila usando **similaridade de cosseno** e sugere o item com maior similaridade.

```
Interesse recente do usuário ──┐
                               ├──→ similaridade de cosseno → ordena fila → sugere o topo
Embeddings dos itens na fila ──┘
```

**Exemplo prático**
O usuário consumiu: "React Server Components", "Next.js performance tips", "TypeScript para iniciantes". O perfil aponta para front-end. Na fila:

| Item                            | Similaridade |
| ------------------------------- | ------------ |
| "CSS Grid layout guide"         | 0.87         |
| "Como fazer churrasco perfeito" | 0.12         |
| "Vite vs Webpack em 2026"       | 0.91         |

O app sugere o artigo sobre Vite vs Webpack.

**Evitando o filter bubble**
Se o usuário só consumir um tipo de conteúdo por muito tempo, o app pode ficar preso recomendando sempre o mesmo assunto. Solução simples: itens com mais de X dias na fila entram automaticamente na disputa, independente da similaridade — garantindo que nada fique esquecido para sempre.

**Performance**
A similaridade de cosseno é uma multiplicação de vetores — instantânea mesmo com centenas de itens. Tudo roda no browser em milissegundos, sem nenhuma chamada externa.

### Tela de carregamento — primeira abertura

A IA é ativada por padrão desde a primeira abertura. O app exibe uma tela de **"Preparando..."** com progresso real enquanto os modelos são baixados — o Transformers.js emite eventos de progresso que alimentam a UI:

```
Preparando seu assistente...
Baixando modelo de categorias  ████████░░  78%
Baixando modelo de sugestões   ███░░░░░░░  32%

"Isso acontece só na primeira vez."
```

Da segunda abertura em diante, os modelos já estão em cache no browser e carregam em menos de 1 segundo — sem nenhuma espera visível.

---

## 🚀 Ordem de Desenvolvimento

1. **MVP** — Salvar link + enriquecimento Open Graph + YouTube oEmbed + detecção de tipo + deduplicação + listar + marcar como visto
2. **V2** — Notificações Web Push + tela de abertura com item sugerido + revisão semanal
3. **V3** — Transformers.js com deberta (classificação) + MiniLM (sugestão semântica)
4. **V4** — Extensão de navegador + compartilhamento nativo mobile + Instagram

---

# Regra Principal(não pode ser ignorado)

## Vamos construir a aplicação na seguinte ordem:

1. **Schema do banco local** — Defina todas as tabelas e campos no
   IndexedDB via Dexie.js antes de qualquer código. Essa etapa é a
   base de tudo.

2. **API Routes** — Com o schema definido, construa os endpoints no
   Next.js API Routes. Esses endpoints existem exclusivamente para
   comunicação com serviços externos (ex: enriquecimento de links,
   YouTube oEmbed). Nenhuma chamada direta a serviços externos deve
   existir no lado do cliente.

3. **Interface da aplicação** — Com o schema e as APIs estáveis,
   construa o frontend. Toda leitura e escrita de dados usa o
   IndexedDB via Dexie.js diretamente no cliente. Toda comunicação
   com serviços externos passa obrigatoriamente pelas API Routes.

**Regra importante:** A separação é clara — dados da aplicação vivem
no IndexedDB (cliente), comunicação externa passa pelas API Routes
(servidor). Nunca o contrário.

Comece pelo schema do banco. Antes de escrever qualquer código,
apresente as tabelas, os campos e os relacionamentos que você propõe,
e aguarde minha aprovação para seguir para a próxima etapa.
