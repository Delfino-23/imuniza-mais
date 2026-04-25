# Sistema de Vacinação

## Descrição

Este é um sistema web para gerenciamento de vacinação, desenvolvido em Node.js. Permite o cadastro e gerenciamento de cidadãos, vacinas, postos de saúde e agendamentos de vacinação. Inclui uma interface web para operações CRUD e um painel de gestão com estatísticas.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite com Sequelize ORM e better-sqlite3
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Gráficos**: Chart.js
- **Outros**: CORS, Express Session, Vanilla Masker para máscaras de entrada

## Instalação

1. Clone ou baixe o repositório.
2. Navegue até a pasta do projeto.
3. Instale as dependências:

   ```bash
   npm install
   ```

## Como Executar

1. Execute o servidor:

   ```bash
   npm start
   ```

2. Abra o navegador e acesse `http://localhost:3000`.

O sistema inicializará o banco de dados automaticamente se necessário.

## Funcionalidades

- **Gestão de Cidadãos**: Cadastrar, listar, atualizar e excluir cidadãos.
- **Gestão de Vacinas**: Cadastrar, listar, atualizar e excluir vacinas.
- **Gestão de Postos de Saúde**: Cadastrar, listar, atualizar e excluir postos de saúde.
- **Agendamentos**: Cadastrar, listar, atualizar e excluir agendamentos de vacinação.
- **Painel de Gestão**: Visualizar estatísticas gerais (total de cidadãos, vacinas em estoque, agendamentos).

## Estrutura do Projeto

- `index.js`: Arquivo principal do servidor Express.
- `config/`: Configurações do banco de dados.
- `controllers/`: Controladores para lógica de negócio.
- `models/`: Modelos Sequelize para as entidades (Cidadãos, Vacinas, Postos, Agendamentos, etc.).
- `routes/`: Definições das rotas da API.
- `public/`: Arquivos estáticos (HTML, CSS, JS) para o frontend.
- `utils/`: Utilitários diversos (formatação, tratamento de erros).

## API Endpoints

- `GET /`: Página inicial.
- `GET /gestao/dados`: Dados para o painel de gestão.
- Rotas para cidadãos: `/cidadao/*`
- Rotas para vacinas: `/vacina/*`
- Rotas para postos: `/posto/*`
- Rotas para agendamentos: `/agendamento/*`

## Contribuição

Para contribuir, faça um fork do projeto e envie um pull request com suas alterações.

## Licença

Este projeto é de uso educacional.</content>
<parameter name="filePath">c:\dev\TCC\projeto-vacinacao\README.md
