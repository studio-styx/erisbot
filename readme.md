<div align="center">
  <img src="assets/readme/eris_avatar.png" alt="Avatar da Éris" width="150"/>
  <h1>Éris</h1>
  
  <p>
    <strong>STATUS: DESCONTINUADO / ARQUIVADO</strong>
  </p>

  [![SUPPORT SERVER](https://img.shields.io/badge/DISCORD_SUPPORT_SERVER-Rio_Styx_&_Botlist-EB459E.svg?style=flat-square)](https://shields.io/)
  [![Maintenance](https://img.shields.io/badge/Maintained%3F-no-red.svg?style=flat-square)](https://GitHub.com/studio-styx/erisbot/graphs/commit-activity)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
  
  <br />

  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
  ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
  ![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
  <br/>
  ![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
  ![Prisma](https://img.shields.io/badge/prisma-%23000000.svg?style=for-the-badge&logo=prisma&logoColor=white)
  ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
  
</div>

<br />

## 📖 Sobre o Projeto

A **Éris** foi um bot de Discord desenvolvido com foco em performance e escalabilidade, utilizando **TypeScript** e **Discord.js**. A persistência de dados foi feita com **PostgreSQL** através do ORM **Prisma**.

Além das funcionalidades de chat, a Éris contava com uma API integrada via **Fastify**. Essa API servia principalmente como backend para o dashboard web, mas também expunha endpoints para outros bots realizarem transações de economia (STX), consultarem saldos e obterem perguntas para o sistema de Trivia.

Este repositório agora serve como **portfólio e material de estudo**, demonstrando uma arquitetura robusta de bot com integração API/DB.

## 📂 Estrutura do Código

O projeto segue uma arquitetura modular para facilitar a manutenção e escalabilidade:

```text
└── src/
    ├── index.ts               # Ponto de entrada da aplicação
    ├── functions/             # Funções utilitárias globais (helpers)
    ├── database/              # Camada de Dados
    │   ├── devzone.ts
    │   ├── erisHelper.ts
    │   └── index.ts           # Exporta clientes Redis e Prisma (Éris, Helper e DevZone)
    ├── server/                # Servidor API (Fastify)
    │   ├── index.ts
    │   ├── types/
    │   └── routes/            # Rotas da API (ex: v2/ para uso externo)
    ├── settings/              # Configurações gerais e validação de env
    ├── tools/                 # Ferramentas e bibliotecas externas
    ├── @types/                # Definições de tipos TypeScript
    ├── locale/                # Arquivos de tradução (código puro)
    ├── menus/                 # Configurações de Menus interativos
    └── discord/               # Lógica do Bot
        ├── index.ts
        ├── base/              # Core do bot (Clients, Handlers)
        ├── events/            # Listeners de eventos (join, message, etc.)
        ├── responders/        # Handlers para interações (Buttons, SelectMenus, Modals)
        └── commands/          # Comandos Slash
            ├── minigames/     # Cassino, Trivia, XP
            ├── economy/       # Comandos financeiros (STX, Investimentos)
            ├── utility/       # Utilidades gerais
            ├── help/          # Sistema de ajuda
            ├── mail/          # Sistema de correio/cartas
            ├── configuration/ # Configuração por servidor (Guild)
            └── private/       # Comandos administrativos/Dev

```

## 🏗️ Arquitetura e Configuração

### Variáveis de Ambiente (.env)

A estrutura ideal está localizada em `.env.example`. É estritamente necessário seguir o esquema definido em `src/settings/env.schema.ts`, que valida os dados na inicialização.

> **Dica:** Para rodar em ambiente de desenvolvimento, utilize o sufixo `:dev`.
> Exemplo: `yarn dev:dev`

### Base

O projeto foi construído sobre a base do **[Rincko](https://github.com/rinckodev/rinckodev)** (v1.3.4).

Os arquivos *core* de inicialização estão em `src/discord/base`. Alterações nesta pasta não são recomendadas a menos que você conheça bem a estrutura original.

### Banco de Dados & Segurança

A aplicação gerencia múltiplas conexões (Principal e Suporte) usando a importação `#asPrisma` de `#database`.

**Certificados SSL:**
O projeto implementa conexão segura via certificado. Se o seu banco exigir:

1. Crie um arquivo `.p12` usando seu `client.crt` e `client.key`.
2. Defina a senha do certificado.
3. Aponte o caminho do `.p12` na URL de conexão do Prisma (recomendado armazenar em `/prisma/certs/`).

## 🚀 Instalação

### Requisitos

* [Node.js](https://nodejs.org/) ou [Bun](https://bun.sh/)
* [Yarn](https://yarnpkg.com/) (Opcional, mas recomendado)
* PostgreSQL

### Passo a passo

```bash
# Clone o repositório
git clone [https://github.com/studio-styx/erisbot.git](https://github.com/studio-styx/erisbot.git)

# Entre na pasta
cd erisbot

# Instale as dependências
yarn install

# Gere o client do Prisma
yarn prisma generate

# Inicie em modo de desenvolvimento
yarn dev

```

## ✨ Funcionalidades Principais

| Categoria | Detalhes |
| --- | --- |
| **🎮 Minigames** | Cassino completo, Trivia com API externa, Sistema de XP e Níveis. |
| **💰 Economia** | Moeda virtual (STX), transferências e sistema de investimentos. |
| **⚽ Apostas** | Sistema de apostas em jogos de futebol (integração real). |
| **📨 Social** | Sistema de cartas e correio entre usuários. |
| **⚙️ Gestão** | Painel de configuração completo para administradores de servidores. |
| **🔌 API** | API RESTful integrada via Fastify para dashboard e integrações externas. |

## 🏁 Motivo do Encerramento

A Éris foi um projeto ambicioso que me ensinou muito sobre arquitetura de software, bancos de dados e gerenciamento de projetos complexos.

O projeto foi encerrado devido à baixa adesão da comunidade em relação ao custo de tempo e manutenção exigidos. Apesar de não ter atingido as metas de usuários esperadas, o conhecimento adquirido na construção deste sistema — especialmente na integração entre Bot, Banco de Dados e API — foi inestimável.

## 🤝 Contribuição e Licença

Como o projeto foi **encerrado**, não aceitamos mais Pull Requests ou Issues.

Este projeto está licenciado sob a **Licença MIT**.
Você é livre para fazer um fork, estudar o código, modificar e usar em seus próprios projetos, desde que mantenha os devidos créditos ao autor original (**BirdTool** / Studio Styx) e inclua a licença original.
