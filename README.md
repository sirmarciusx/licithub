# LicitHub

Agregador de licitações com frontend em React/Vite e backend em Node.js/Express integrado ao PNCP.

## Como rodar

### Backend

```bash
cd backend
npm install
npm run dev
```

O backend roda por padrão em `http://localhost:3001`.

### Frontend

```bash
npm install
npm run dev
```

O frontend roda em `http://localhost:3000` e encaminha `/api` para o backend.

## Scripts úteis

- `npm.cmd run lint`: checagem de tipos do frontend.
- `npm.cmd run build`: build de produção do frontend.
- `cd backend && npm.cmd run lint`: checagem de tipos do backend.
- `cd backend && npm.cmd run build`: compilação do backend.
