# Documentação de Interface: Aplicativo "Depois"

Este documento descreve detalhadamente a interface visual para a reconstrução da página via IA ou desenvolvimento web/mobile.

## 1. Estética e Identidade Visual

- **Tema:** Dark Mode Moderno.
- **Cores de Fundo:**
  - Principal: `#0F0F1A` (Azul-escuro profundo).
  - Cards: `#1A1A2E` (Tom levemente mais claro para contraste).
- **Cores de Ação:**
  - Primária: `#6366F1` (Roxo/Íris vibrante).
  - Texto: `#FFFFFF` (Branco) e `#94A3B8` (Cinza azulado para subtextos).
- **Estilo:** Bordas arredondadas (Radius de ~16px a 24px), sombras suaves (_glow_ roxo sutil no botão principal) e tipografia Sans-Serif limpa.

---

## 2. Estrutura da Página (Hierarquia)

### A. Barra Superior (Header)

- **Esquerda:** Ícone de menu hambúrguer (3 linhas horizontais).
- **Centro:** Logotipo/Título "Depois" em Bold.
- **Direita:** Avatar circular do usuário com borda fina em roxo.

### B. Seção: Recomendação de IA

- **Título:** "Recomendação de IA" precedido por um ícone de faíscas (`sparkles`).
- **Card de Destaque:**
  - **Imagem:** Representação visual de um cérebro digital/conexões neurais.
  - **Tag Flutuante:** No topo da imagem, badge roxo com texto "EDUCAÇÃO".
  - **Corpo:** Título "How to build a second brain" (H2).
  - **Metadados:** Ícone do YouTube + texto "YouTube • Vídeo".
  - **Botões:**
    1.  `Ver agora` (Preenchido em roxo).
    2.  `Deixar pra depois` (Outline/Borda fina).

### C. Seção: Sua Fila

- **Cabeçalho:** Título "Sua Fila" com link "Ver todos" alinhado à direita.
- **Lista de Cards (Layout Horizontal):**
  - **Card 1:** Categoria "TECNOLOGIA", Título "Web Design Trends 2024", Fonte "Medium".
  - **Card 2:** Categoria "PRODUTIVIDADE", Título "Essentialism Guide", Fonte "YouTube".
  - **Card 3:** Categoria "CARREIRA", Título "Networking for Introverts", Fonte "Substack".
  - _Nota:_ Cada card possui uma imagem quadrada à esquerda (thumbnail) e um ícone de três pontos verticais (menu) à extrema direita.

### D. Navegação Inferior (Tab Bar)

Fixada no rodapé com fundo desfocado ou sólido escuro.

- **Início:** Ícone de casa (Estado ativo: Roxo).
- **Explorar:** Ícone de bússola.
- **Salvar:** Ícone de "+" dentro de um círculo.
- **Vistos:** Ícone de "Check" dentro de um círculo.

---

## 3. Mapeamento de Ícones e Caminhos (Assets)

| Nome do Ícone    | Função                      | Caminho Sugerido                   |
| :--------------- | :-------------------------- | :--------------------------------- |
| `menu`           | Abrir menu lateral          | `@images/icons/menu.png`           |
| `user_profile`   | Foto/Avatar do usuário      | `@images/icons/perfil.png`         |
| `ai_sparkle`     | Destaque de IA              | `@images/icons/sparkles.png`       |
| `youtube_brand`  | Logo da plataforma YouTube  | `@images/icons/youtube.png`        |
| `medium_brand`   | Logo da plataforma Medium   | `@images/icons/medium.png`         |
| `substack_brand` | Logo da plataforma Substack | `/assets/icons/brand-substack.svg` |
| `more_options`   | Menu de contexto (3 pontos) | `@images/icons/more.png`           |
| `nav_home`       | Navegação: Início           | `@images/icons/inicio.svg`         |
| `nav_explore`    | Navegação: Explorar         | `@images/icons/explorer.svg`       |
| `nav_add`        | Navegação: Salvar novo      | `@images/icons/save.svg`           |
| `nav_check`      | Navegação: Vistos           | `@images/icons/visto.svg`          |

---
