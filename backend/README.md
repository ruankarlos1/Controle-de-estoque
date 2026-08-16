# Controle de Estoque

Sistema simples de controle de mercadorias (compras e vendas), com cálculo automático
de estoque atual e lucro/prejuízo por produto, controle de clientes e vendas fiado.
Projeto criado para ajudar no controle de um pequeno negócio de compra e revenda de
mercadorias.

## O que o sistema faz

- **Login protegido** (cada usuário com email/senha própria, senha nunca salva em texto puro)
- Cadastro de produtos
- Cadastro de clientes (só nome)
- Registro de **entradas** (compras) e **saídas** (vendas)
- Vendas podem ser **à vista** ou **fiado** (a prazo), vinculadas ou não a um cliente
- Controle de fiado: lista de pendências, resumo por cliente, marcar como pago
  (pagamento sempre único — não há suporte a pagamento parcelado)
- Cálculo automático de:
  - Estoque atual por produto (entradas - saídas)
  - Custo médio de compra
  - Total investido em compras e total vendido (valores separados)
  - Lucro ou prejuízo por produto e geral
  - Total a receber (soma de todos os fiados pendentes)

## Autenticação

Antes de usar qualquer endpoint de produtos/clientes/movimentações/relatórios/fiado, é preciso:

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
| POST | `/movimentacoes/` | Registra entrada ou saída (venda pode ter `fiado: true`) |
| GET | `/movimentacoes/?produto_id=X` | Lista movimentações |
| GET | `/fiado/pendentes` | Lista todas as vendas fiado ainda não pagas |
| GET | `/fiado/por-cliente` | Soma quanto cada cliente deve |
| POST | `/fiado/{id}/pagar` | Marca uma venda fiado como paga |
| GET | `/relatorios/produto/{id}` | Estoque, custo médio, investido, vendido e lucro de um produto |
| GET | `/relatorios/geral` | Resumo de todos os produtos + totais gerais + total a receber |

## Decisões técnicas

- **Custo médio, não FIFO**: quando um produto é comprado por preços diferentes ao
  longo do tempo, o sistema usa a média ponderada dos preços de compra para calcular
  o lucro nas vendas.
- **Fiado sempre pagamento único**: não há suporte a pagamento parcelado. Uma venda
  fiado fica "pendente" até ser marcada como totalmente paga de uma vez.
- **Cliente é opcional na venda**: permite registrar vendas avulsas sem identificar
  o comprador. Só é obrigatório vincular cliente quando a venda é fiado (a interface
  deve garantir isso, o backend aceita fiado sem cliente mas ele não aparecerá nos
  relatórios de "quem deve").
- **Sem estoque "fixo" salvo no banco**: o estoque atual e o lucro são sempre
  *calculados* a partir do histórico de movimentações, nunca armazenados como um
  número solto.
- **SQLite** para começar: zero configuração de servidor de banco.

## Próximos passos (v2)

- [ ] Front-end em React consumindo essa API (com clientes, fiado e nova navegação)
- [ ] Alerta de estoque baixo
- [ ] Filtro de relatório por período (mês/semana)
- [ ] Deploy (Railway/Render para a API, Vercel para o front)
