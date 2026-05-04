# LicitHub

Agregador de licitações governamentais integrado ao PNCP (Portal Nacional de Contratações Públicas).

## Visão Geral

O LicitHub é uma aplicação full-stack que permite consultar e filtrar licitações públicas do governo brasileiro. O backend integra-se diretamente à API do PNCP para obter dados atualizados de oportunidades de negócio.

### Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Motion
- **Backend**: Node.js, Express, TypeScript
- **API**: PNCP (Portal Nacional de Contratações Públicas)

## Funcionalidades

- Listagem de licitações públicas
- Filtros por modalidade, UF, órgão comprador e tipo de objeto
- Busca por palavra-chave
- Modal de detalhes com informações completas
- Interface responsiva e amigável

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/sirmarciusx/licithub.git
cd licithub
```

### 2. Configure as variáveis de ambiente

```bash
# Frontend
cp .env.example .env

# Backend
cd backend
cp .env.example .env
# Edite o arquivo .env com as configurações desejadas
```

### 3. Instale as dependências

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

## Executando o Projeto

### Desenvolvimento

**Backend** (porta 3001):
```bash
cd backend
npm run dev
```

**Frontend** (porta 3000):
```bash
npm run dev
```

O frontend já está configurado com proxy reverso — todas as requisições para `/api` são encaminhadas automaticamente ao backend.

### Produção

**Frontend**:
```bash
npm run build
```

**Backend**:
```bash
cd backend
npm run build
npm start
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o frontend em modo desenvolvimento |
| `npm run build` | Gera build de produção do frontend |
| `npm run lint` | Verificação de tipos TypeScript |
| `npm run clean` | Remove diretório de build |

**Backend** (dentro de `/backend`):

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o backend em modo desenvolvimento |
| `npm run build` | Compila o TypeScript |
| `npm run lint` | Verificação de tipos do backend |
| `npm start` | Inicia o backend em produção |

## Estrutura do Projeto

```
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── controllers/  # Controllers da API
│   │   ├── middleware/   # Middlewares (erros)
│   │   ├── routes/       # Rotas da API
│   │   ├── services/     # Lógica de negócio e integração PNCP
│   │   ├── types/        # Tipos TypeScript
│   │   └── data/         # Dados mock (desenvolvimento)
│   └── package.json
│
├── src/                  # Frontend React
│   ├── components/       # Componentes React
│   ├── services/         # Chamadas à API
│   ├── types/            # Tipos TypeScript
│   ├── constants/        # Constantes da aplicação
│   └── App.tsx           # Componente principal
│
├── package.json
└── vite.config.ts        # Configuração do Vite e proxy
```

## Integração com PNCP

O backend fetching dados diretamente da API pública do PNCP:

- Endpoint base: API do Portal Nacional de Contratações Públicas
- Autenticação via header `chave-apiPncp` (quando necessário)
- Dados retornados em formato padronizado

Consulte a documentação oficial do PNCP para mais informações sobre a API.

## Licença

MIT