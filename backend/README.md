# LicitHub Backend

Backend em Node.js, Express e TypeScript para o agregador de licitações LicitHub.

## Stack

- Runtime: Node.js
- Framework: Express
- Linguagem: TypeScript
- Porta padrão: `3001`

## Estrutura

```text
backend/
├── src/
│   ├── controllers/   # Controllers HTTP
│   ├── data/          # Dados auxiliares/mock
│   ├── middleware/    # Error handler
│   ├── routes/        # Rotas Express
│   ├── services/      # Integração com PNCP
│   ├── types/         # Interfaces TypeScript
│   ├── app.ts         # Setup Express
│   └── server.ts      # Entry point
├── package.json
└── tsconfig.json
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

## Endpoints

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/licitacoes` | Lista licitações com filtros |
| GET | `/api/licitacoes/:id` | Detalhes de uma licitação |
| GET | `/api/licitacoes/modalidades` | Lista modalidades disponíveis |
| GET | `/api/licitacoes/categorias` | Lista categorias disponíveis |
| GET | `/api/categorias` | Alias para categorias |
| GET | `/api/health` | Health check |

## Filtros

`/api/licitacoes` aceita `search`, `query`, `category`, `status`, `uf`, `modalidade`, `valorMin`, `valorMax`, `dataInicial`, `dataFinal`, `pagina` e `tamanhoPagina`.
