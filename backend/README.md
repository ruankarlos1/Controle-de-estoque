# Controle de Estoque

Sistema simples de controle de mercadorias (compras e vendas), com cálculo automático
de estoque atual e lucro/prejuízo por produto, controle de clientes e vendas pendentes.
Projeto criado para ajudar no controle de um pequeno negócio de compra e revenda de
mercadorias.

## O que o sistema faz

- **Login protegido** (cada usuário com email/senha própria, senha nunca salva em texto puro)
- Cadastro de produtos
- Cadastro de clientes (só nome)
- Registro de **entradas** (compras) e **saídas** (vendas)
- Vendas podem ser **à vista** ou **pendentes** (a prazo), vinculadas ou não a um cliente
- Controle de pendências: lista quem deve, resumo por cliente, marcar como pago
  (pagamento sempre único — não há suporte a pagamento parcelado)
- Cálculo automático de:
  - Estoque atual por produto (entradas - saídas)
  - Custo médio de compra
  - Total investido em compras e total vendido (valores separados)
  - Lucro ou prejuízo por produto e geral
  - Total a receber (soma de tudo que ainda está pendente)

## Autenticação

Antes de usar qualquer endpoint de produtos/clientes/movimentações/relatórios/pendentes, é preciso:

1. `POST /auth/registrar` — criar uma conta (nome, email, senha)
2. `POST /auth/login` — recebe email/senha, retorna um `access_token`
3. Usar esse token em todas as outras requisições, no header:
   `Authorization: Bearer <token>`

O token expira em 7 dias — depois disso, é preciso logar de novo.

**Antes de rodar pela primeira vez:** copie `.env.example` para `.env` e gere uma
chave secreta própria (o arquivo `.env.example` explica como). Sem isso, o sistema
ainda funciona, mas gera uma chave aleatória a cada reinício — o que faria todo
mundo perder a sessão (token) sempre que o servidor reiniciasse.

## Endpoints principais

| Método | Rota | O que faz |
|---|---|---|
| POST | `/auth/registrar` | Cria uma conta |
| POST | `/auth/login` | Faz login, retorna token |
| POST | `/produtos/` | Cadastra um produto |
| GET | `/produtos/` | Lista todos os produtos |
| POST | `/clientes/` | Cadastra um cliente |
| GET | `/clientes/` | Lista todos os clientes |
| POST | `/movimentacoes/` | Registra entrada ou saída (venda pode ter `pendente: true`) |
| GET | `/movimentacoes/?produto_id=X` | Lista movimentações |
| GET | `/pendentes/` | Lista todas as vendas pendentes ainda não pagas |
| GET | `/pendentes/por-cliente` | Soma quanto cada cliente deve |
| POST | `/pendentes/{id}/pagar` | Marca uma venda pendente como paga |
| GET | `/relatorios/produto/{id}` | Estoque, custo médio, investido, vendido e lucro de um produto |
| GET | `/relatorios/geral?apenas_mes_atual=true` | Resumo de todos os produtos + totais gerais + total a receber (com opção de filtrar só o mês atual) |

## Decisões técnicas

- **Custo médio, não FIFO**: quando um produto é comprado por preços diferentes ao
  longo do tempo, o sistema usa a média ponderada dos preços de compra para calcular
  o lucro nas vendas.
- **Pendência sempre pagamento único**: não há suporte a pagamento parcelado. Uma
  venda pendente fica assim até ser marcada como totalmente paga de uma vez.
- **Cliente é opcional na venda**: permite registrar vendas avulsas sem identificar
  o comprador. Só é obrigatório vincular cliente quando a venda é pendente (a interface
  garante isso, mas o backend aceita pendente sem cliente — só que aí ela não aparece
  nos relatórios de "quem deve").
- **Sem estoque "fixo" salvo no banco**: o estoque atual e o lucro são sempre
  *calculados* a partir do histórico de movimentações, nunca armazenados como um
  número solto.
- **SQLite** para começar: zero configuração de servidor de banco.

## Próximos passos (v2)

- [x] Front-end em React consumindo essa API (com clientes, pendentes e navegação por abas)
- [x] Filtro de relatório por período (mês atual / histórico completo)
- [ ] Alerta de estoque baixo
- [ ] Deploy (Railway/Render para a API, Vercel ou Netlify para o front)
