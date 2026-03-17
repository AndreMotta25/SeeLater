# Documentação de Interface: Detalhes do Item (App Depois)

Este documento descreve a interface da tela de visualização individual de um item salvo, focada em leitura e ações rápidas.

## 1. Estética e Identidade Visual

- **Tema:** Dark Mode.
- **Cores de Fundo:**
  - Principal: `#0F0F1A` (Azul-escuro profundo).
  - Card de Texto: `#1A1A2E` (Container da descrição no rodapé).
- **Cores de Ação:**
  - Primária/Link: `#6366F1` (Roxo vibrante).
  - Secundária/Visto: `#2D2D44` (Fundo escuro com texto roxo).
  - Alerta/Remover: `#1F161A` (Fundo avermelhado escuro com texto vermelho `#EF4444`).
- **Estilo:** Botões grandes com cantos arredondados (estilo _pill_ ou radius alto) e tipografia em destaque.

---

## 2. Estrutura da Página (Hierarquia)

### A. Barra Superior (Nav Bar)

- **Esquerda:** Ícone de seta para voltar (`arrow-left`).
- **Centro:** Título da página "Detalhes do item".
- **Direita:** Ícone de compartilhar (`share-nodes`).

### B. Área de Conteúdo Principal

- **Imagem de Capa:** Banner retangular com bordas arredondadas exibindo uma arte abstrata de rede neural/energia azul.
- **Título do Item:** "The future of AI in Design" em fonte H1, branca e negrito.
- **Tags (Badges):** Uma linha de etiquetas arredondadas:
  - `Medium.com` (Roxo destacado).
  - `Artigo` (Cinza escuro).
  - `Design` (Cinza escuro).
- **Data de Salvamento:** Texto secundário abaixo das tags: "Salvo em 12 Out".

### C. Grupo de Botões de Ação

Três botões verticais empilhados, ocupando quase toda a largura:

1.  **Abrir link:** Botão roxo sólido com ícone de "link externo" (`external-link`).
2.  **Marcar como visto:** Botão de fundo escuro com borda sutil e ícone de "check" circular (`check-circle`). Texto e ícone em roxo.
3.  **Remover:** Botão com fundo bordô escuro e ícone de "lixeira" (`trash`). Texto e ícone em vermelho.

### D. Descrição (Card Inferior)

Um container com fundo levemente mais claro que o principal contendo o resumo:

> "Como a inteligência artificial generativa está redefinindo o fluxo de trabalho dos designers e o que esperar da próxima década na indústria criativa."

### E. Navegação Inferior (Tab Bar)

Fixada no rodapé com fundo desfocado ou sólido escuro.

- **Início:** Ícone de casa (Estado inativo: Branco/Cinza).
- **Explorar:** Ícone de bússola.
- **Salvar:** Ícone de "+" dentro de um círculo.
- **Vistos:** Ícone de "Check" dentro de um círculo.

---

## 3. Mapeamento de Ícones e Caminhos (Assets)

| Nome do Ícone    | Função                       | Caminho Sugerido                   |
| :--------------- | :--------------------------- | :--------------------------------- |
| `back_arrow`     | Voltar para tela anterior    | `@images/icons/back.svg`           |
| `share`          | Compartilhar conteúdo        | `@images/icons/share.svg`          |
| `external_link`  | Abrir link no navegador      | `@images/icons/external-link.svg`  |
| `check_circle`   | Marcar como concluído/visto  | `@images/icons/check-circle.svg`   |
| `trash`          | Excluir/Remover item         | `@images/icons/trash.svg`          |
| `menu`           | Abrir menu lateral           | `@images/icons/menu.png`           |
| `user_profile`   | Foto/Avatar do usuário       | `@images/icons/perfil.png`         |
| `ai_sparkle`     | Destaque de IA               | `@images/icons/sparkles.png`       |
| `youtube_brand`  | Logo da plataforma YouTube   | `@images/icons/youtube.png`        |
| `medium_brand`   | Logo da plataforma Medium    | `@images/icons/medium.png`         |
| `substack_brand` | Logo da plataforma Substack  | `/assets/icons/brand-substack.svg` |
| `more_options`   | Menu de contexto (3 pontos)  | `@images/icons/more.png`           |
| `nav_home`       | Navegação: Início            | `@images/icons/inicio.svg`         |
| `nav_explore`    | Navegação: Explorar          | `@images/icons/explorer.svg`       |
| `nav_add`        | Navegação: Salvar novo       | `@images/icons/save.svg`           |
| `nav_check`      | Navegação: Vistos            | `@images/icons/visto.svg`          |
| `arrow-left`     | Barra Superior: Voltar       | `@images/icons/arrow.svg`          |
| `share-nodes`    | Barra Superior: compartilhar | `@images/icons/shared.svg`         |
