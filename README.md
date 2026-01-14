# Front-end Social Meli

Aplicação front-end (React) do **Social Meli**, com:

- **Seleção de usuário** para simular autenticação (sem login).
- **Follow/Unfollow** de usuários.
- **Feed de publicações** e **Produtos em promoção**.
- **Criação de publicação** normal e promocional com validação.
- **Ordenação** (A-Z / Z-A e data) via query param `order`.

---

## Requisitos

- Node.js (recomendado: LTS)
- npm
- Back-end rodando (API do Social Meli)

---

## Configuração

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (mesmo nível do `package.json`) com:

```bash
REACT_APP_BASE_URL=http://localhost:8080
```

Se você não configurar, o app usa o fallback `http://localhost:8080`.

---

## Como rodar

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm start
```

A aplicação ficará disponível em:

- `http://localhost:3000`

Build de produção:

```bash
npm run build
```

---

## Rotas

- **`/`**
  - Home (lista de usuários + seguir/deixar de seguir)
- **`/quem-me-segue`**
  - Seguidores do usuário selecionado
  - Ordenação A-Z / Z-A
  - Follow/Unfollow usando a mesma lógica da Home
- **`/quem-eu-sigo`**
  - Lista de usuários seguidos
  - Ordenação A-Z / Z-A
  - Unfollow com recarregamento mantendo ordenação
- **`/feed-de-publicacoes`**
  - Feed de posts de usuários seguidos
  - Ordenação por data (`date_asc` / `date_desc`)
  - Like/Unlike com atualização otimista
- **`/produtos-em-promocao`**
  - Lista de promo posts
  - Like/Unlike e botão de recarregar
- **`/criar-publicacao`**
  - Formulário para criar post normal ou promocional

---

## Integração com a API (resumo)

As chamadas ficam em `src/services/api.js` e o estado compartilhado em `src/services/UserContext.js`.

Principais endpoints utilizados:

- **Usuários**
  - `GET /users/top`
  - `GET /users/{id}/followers/list?order=name_asc|name_desc`
  - `GET /users/{id}/followed/list?order=name_asc|name_desc`
  - `POST /users/{follower}/follow/{followed}`
  - `POST /users/{follower}/unfollow/{followed}`

- **Posts**
  - `GET /products/followed/{userId}/list?order=date_asc|date_desc`
  - `POST /products/{postId}/like/{userId}`
  - `POST /products/{postId}/unlike/{userId}`
  - `POST /products/publish`
  - `POST /products/promo-pub`

- **Promo posts**
  - `GET /products/promo-pub/list?userId={userId}`

---

## Observações importantes

- A tela **Criar publicação** força o `userId` do payload a ser sempre o **usuário selecionado**.
- Erros vindos da API são exibidos usando o campo `message` do JSON de erro.
- Algumas respostas `201` podem vir sem body; o front trata parse de JSON de forma segura.

