# Controle de Estoque — Frontend

Interface web simples e feita para ser usada por qualquer pessoa, mesmo sem
experiência com tecnologia. Pensada para uso no celular.

## Design

- Poucas telas, fluxo direto: **Entrar** → **Ver resumo** → **Registrar compra/venda**
- Botões grandes, textos em português simples, sem termos técnicos visíveis
- Erros sempre traduzidos para mensagens claras (nunca mostra códigos técnicos)
- Visual de "recibo/livro-caixa" no resumo — números alinhados, fácil de ler

## Como rodar localmente

Pré-requisito: o **backend** (pasta `controle-estoque-v2`) já rodando em
`http://localhost:8000` (veja o README de lá).

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Antes de usar

Se o backend estiver rodando em outro endereço (por exemplo, depois do
deploy), troque a constante `API_URL` no arquivo `src/api.js`.

## Build para produção

```bash
npm run build
```

Gera a pasta `dist/` pronta para publicar (ex: Vercel, Netlify).
