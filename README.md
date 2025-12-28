# Order Management API

API backend para gerenciamento de pedidos com autenticação JWT, fluxo de estados controlado e arquitetura limpa.

---

## Visao Geral

Esta API foi desenvolvida como parte de um desafio tecnico backend. O sistema permite:

- Cadastro e autenticacao de usuarios
- Criacao e listagem de pedidos
- Avanco de pedidos atraves de um fluxo de estados controlado
- Validacao de regras de negocio
- Tratamento global de erros

O projeto segue os principios de Clean Architecture com Injecao de Dependencia manual, sem uso de frameworks de DI.

---

## Stack Utilizada

| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| Node.js | 22.x | Runtime JavaScript |
| Express | 5.x | Framework HTTP |
| TypeScript | 5.x | Tipagem estatica |
| MongoDB | 7.x | Banco de dados |
| Mongoose | 9.x | ODM para MongoDB |
| JWT | 9.x | Autenticacao |
| Vitest | 4.x | Testes unitarios |
| bcrypt | 6.x | Hash de senhas |

---

## Arquitetura

O projeto adota Clean Architecture com Injecao de Dependencia manual, seguindo o fluxo:

```
Controller -> Service -> Repository -> Model
```

### Principios Aplicados

- **Inversao de Dependencia**: Services dependem de interfaces, nao de implementacoes concretas
- **Injecao via Constructor**: Todas as dependencias sao recebidas pelo constructor
- **Composition Root**: A montagem das dependencias acontece nos arquivos de rotas
- **Separacao de Responsabilidades**: Controllers nao contem regras de negocio
- **Dominio Isolado**: Regras de negocio nao dependem de frameworks externos

### Exemplo de Injecao de Dependencia

```typescript
// order.routes.ts - Composition Root
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

router.post('/', orderController.create);
```

---

## Organizacao de Pastas

```
src/
├── config/
│   └── env.ts                 # Configuracoes de ambiente
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts # Controller de autenticacao
│   │   ├── auth.service.ts    # Service com regras de autenticacao
│   │   ├── auth.routes.ts     # Rotas e Composition Root
│   │   ├── auth.types.ts      # Tipos do modulo
│   │   ├── user.model.ts      # Schema Mongoose
│   │   └── user.repository.ts # Acesso ao banco de dados
│   └── orders/
│       ├── domain/
│       │   ├── order.rules.ts # Regras de validacao
│       │   └── order.state.ts # Maquina de estados
│       ├── order.controller.ts
│       ├── order.service.ts
│       ├── order.routes.ts
│       ├── order.types.ts
│       ├── order.model.ts
│       └── order.repository.ts
├── shared/
│   ├── database/
│   │   └── mongo.ts           # Conexao com MongoDB
│   ├── errors/
│   │   └── AppError.ts        # Classe de erro customizada
│   └── middlewares/
│       ├── auth.middleware.ts # Middleware de autenticacao
│       └── error.middleware.ts# Middleware de tratamento de erros
├── tests/
│   ├── domain/
│   │   ├── order.rules.spec.ts
│   │   └── order.state.spec.ts
│   └── services/
│       ├── auth.service.spec.ts
│       └── order.service.spec.ts
├── types/
│   └── express.d.ts           # Extensao de tipos do Express
├── app.ts                     # Configuracao do Express
└── server.ts                  # Ponto de entrada
```

---

## Configuracao do Ambiente

### Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no exemplo abaixo:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/order-management
JWT_SECRET=sua-chave-secreta-aqui
```

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| PORT | Nao | Porta do servidor (padrao: 3000) |
| MONGO_URI | Sim | String de conexao do MongoDB |
| JWT_SECRET | Sim | Chave secreta para assinatura JWT |

---

## Como Rodar o Projeto

### Pre-requisitos

- Node.js 22.x ou superior
- MongoDB rodando localmente ou em nuvem

### Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/Meints/order-management-challenge.git

# Acessar o diretorio
cd order-management-challenge

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar o arquivo .env com suas configuracoes
```

### Execucao

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo producao
npm run start
```

O servidor estara disponivel em `http://localhost:3000`.

### Verificar Status

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

---

## Autenticacao

A API utiliza JWT (JSON Web Token) para autenticacao.

### Fluxo de Autenticacao

1. Registrar um usuario em `POST /auth/register`
2. Fazer login em `POST /auth/login` para obter o token
3. Incluir o token no header `Authorization` das requisicoes protegidas

### Formato do Header

```
Authorization: Bearer <seu-token-jwt>
```

### Exemplo de Uso

```bash
# Registrar usuario
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@email.com", "password": "senha123"}'

# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@email.com", "password": "senha123"}'

# Usar token retornado
curl http://localhost:3000/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Endpoints

### Autenticacao

| Metodo | Rota | Descricao | Autenticado |
|--------|------|-----------|-------------|
| POST | /auth/register | Registrar novo usuario | Nao |
| POST | /auth/login | Autenticar usuario | Nao |

### Pedidos

| Metodo | Rota | Descricao | Autenticado |
|--------|------|-----------|-------------|
| POST | /orders | Criar novo pedido | Sim |
| GET | /orders | Listar pedidos | Sim |
| PATCH | /orders/:id/advance | Avancar estado do pedido | Sim |

### Exemplos de Requisicoes

**Criar Pedido**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "lab": "Laboratorio A",
    "patient": "Joao Silva",
    "customer": "Clinica X",
    "services": [
      { "name": "Exame de Sangue", "value": 150 },
      { "name": "Hemograma", "value": 80 }
    ]
  }'
```

**Listar Pedidos com Filtro**

```bash
curl "http://localhost:3000/orders?state=CREATED&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Avancar Estado**

```bash
curl -X PATCH http://localhost:3000/orders/64a1b2c3d4e5f6g7h8i9j0k1/advance \
  -H "Authorization: Bearer <token>"
```

---

## Regras de Negocio

### Criacao de Pedidos

- Todo pedido deve conter pelo menos um servico
- O valor total dos servicos deve ser maior que zero
- Pedidos sao criados com estado inicial `CREATED`
- Pedidos sao criados com status `ACTIVE`

### Fluxo de Estados

O pedido segue um fluxo linear de estados:

```
CREATED -> ANALYSIS -> COMPLETED
```

- Um pedido so pode avancar para o proximo estado
- Pedidos no estado `COMPLETED` nao podem mais avancar
- Nao e possivel retroceder estados

### Validacao de Servicos

Cada servico deve conter:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| name | string | Sim | Nome do servico |
| value | number | Sim | Valor do servico |
| status | enum | Nao | PENDING ou DONE (padrao: PENDING) |

---

## Tratamento de Erros

A API utiliza uma classe customizada `AppError` para tratamento de erros, com um middleware global que padroniza as respostas.

### Classe AppError

```typescript
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
  }
}
```

### Padrao de Resposta de Erro

```json
{
  "error": "Mensagem descritiva do erro"
}
```

### Codigos de Status HTTP

| Codigo | Significado | Exemplo |
|--------|-------------|---------|
| 400 | Bad Request | Validacao falhou |
| 401 | Unauthorized | Token invalido ou ausente |
| 404 | Not Found | Recurso nao encontrado |
| 409 | Conflict | Usuario ja existe |
| 500 | Internal Server Error | Erro inesperado |

### Exemplos de Erros

```json
// 400 - Validacao
{ "error": "Order must have at least one service" }

// 401 - Autenticacao
{ "error": "Invalid credentials" }

// 404 - Nao encontrado
{ "error": "Order not found" }

// 409 - Conflito
{ "error": "User already exists" }
```

---

## Testes

O projeto utiliza Vitest para testes unitarios.

### Executar Testes

```bash
# Executar todos os testes
npm run test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:coverage
```

### Estrutura de Testes

```
src/tests/
├── domain/
│   ├── order.rules.spec.ts  # Testes de validacao de servicos
│   └── order.state.spec.ts  # Testes da maquina de estados
└── services/
    ├── auth.service.spec.ts # Testes de autenticacao
    └── order.service.spec.ts# Testes de gerenciamento de pedidos
```

### O Que Esta Sendo Testado

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| order.rules.spec.ts | 6 | Validacao de servicos |
| order.state.spec.ts | 3 | Transicao de estados |
| auth.service.spec.ts | 5 | Registro e login |
| order.service.spec.ts | 9 | CRUD de pedidos |
| **Total** | **23** | |

### Exemplo de Saida

```
 ✓ src/tests/domain/order.state.spec.ts (3 tests)
 ✓ src/tests/domain/order.rules.spec.ts (6 tests)
 ✓ src/tests/services/order.service.spec.ts (9 tests)
 ✓ src/tests/services/auth.service.spec.ts (5 tests)

 Test Files  4 passed (4)
      Tests  23 passed (23)
```

---

## Pontos de Extensibilidade

O projeto foi estruturado para facilitar futuras extensoes:

- **Novos modulos**: Seguir a mesma estrutura de `auth` e `orders`
- **Novos estados**: Adicionar transicoes em `order.state.ts`
- **Novos middlewares**: Adicionar em `shared/middlewares`
- **Cache**: Injetar servico de cache nos repositories
- **Filas**: Injetar servico de mensageria nos services
- **Logs estruturados**: Adicionar logger injetavel nos services

---


