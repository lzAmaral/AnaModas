# 🛍️ Sistema de Gestão para Loja de Roupas (PDV e Estoque)

Um sistema completo de Ponto de Venda (PDV) e controle de estoque desenvolvido especificamente para lojas de roupas. Ele permite registrar pedidos, gerenciar clientes e controlar o estoque de mercadorias de forma automatizada e eficiente, com uma interface responsiva otimizada para uso em tablets e computadores.

---

## 🚀 Funcionalidades Principais

- **Gestão de Pedidos (PDV):** Criação rápida de novos pedidos, adição de produtos com múltiplos tamanhos e cálculo automático do valor total baseado nos preços cadastrados no sistema.
- **Controle de Estoque Inteligente:** O sistema valida automaticamente se há estoque disponível no momento da compra e realiza a baixa (desconto) imediata da quantidade ao finalizar o pedido.
- **Cancelamento e Estorno Seguro:** Caso um pedido seja cancelado ou deletado, os produtos retornam automaticamente para o estoque.
- **Dashboard de Visão Geral:** Painel inicial (Dashboard) exibindo o total de vendas (faturamento), quantidade de pedidos realizados, produtos mais vendidos e alertas de produtos com *estoque baixo*.
- **Gestão de Status:** Controle do andamento do pedido (`pendente`, `separado`, `entregue`) e status de pagamento (`pago`, `não pago`).

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna de JavaScript:

### Frontend
- **React.js** (com **Vite** para build super rápida)
- Componentização eficiente para uma interface limpa e reativa
- Totalmente responsivo e focado na usabilidade, em especial para telas touch (Tablets)

### Backend (API RESTful)
- **Node.js** com **Express**
- **PostgreSQL** hospedado no **Supabase**
- **Arquitetura Baseada em Camadas (Layered Architecture/MVC):**
  - **Routes:** Definição clara dos endpoints da API.
  - **Controllers:** Gerenciamento da requisição HTTP e envio das respostas.
  - **Services:** Isolamento total das regras de negócio (validação de estoque, soma de totais), evitando que a complexidade suje os controladores.
  - **Models:** Concentração das queries ao banco de dados, facilitando a troca ou manutenção das tabelas (Products, Orders, Clients, etc.).
  - **Middlewares:** Captura global de erros garantindo respostas padronizadas da API.

---

## ⚙️ Como executar o projeto localmente

Siga os passos abaixo para rodar o projeto na sua máquina:

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/clothing-store.git
cd clothing-store
```

### 2. Configurar o Backend
Acesse a pasta do backend, instale as dependências e inicie o servidor:

```bash
cd backend

# Instalar as dependências (Express, pg, cors, etc.)
npm install

# Iniciar a API do servidor localmente (por padrão na porta 3001)
node server.js
```
*(Certifique-se de que a string de conexão no `/src/config/db.js` está apontando para o seu banco PostgreSQL correto).*

### 3. Configurar o Frontend
Em um novo terminal, acesse a pasta do frontend, instale as dependências e rode a versão de desenvolvimento:

```bash
cd frontend

# Instalar as dependências do React (Vite)
npm install

# Rodar a aplicação na porta padrão do Vite (geralmente 5173)
npm run dev
```

Abra o seu navegador no endereço indicado pelo `Vite` (ex: `http://localhost:5173`) para visualizar o sistema funcionando!

---

## Sobre o Autor

Desenvolvido por **[Luiz Amaral]**.

- **LinkedIn:** https://www.linkedin.com/in/luiz-gustavo-de-campos-amaral-122622278/ 
- **Portfólio:** https://luizamaral.vercel.app/ 
