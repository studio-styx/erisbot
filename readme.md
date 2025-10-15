<div align="center">
<h1>Éris</h1>

[![SUPPORT SERVER](https://img.shields.io/badge/DISCORD_SUPPORT_SERVER-Rio_Styx_&_Botlist-EB459E.svg)](https://shields.io/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/studio-styx/erisbot/graphs/commit-activity)
[![Github Licence](https://img.shields.io/badge/Licence-Creative_Commons_BY_NC_4.0-%230078D7.svg)](https://github.com/studio-styx/erisbot/blob/main/licence.md)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/studio-styx/erisbot)

<img src="assets/readme/eris_avatar.png" alt="Avatar da Éris" width="200"/>

![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/prisma-%23000000.svg?style=for-the-badge&logo=prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Debian](https://img.shields.io/badge/Debian-D70A53?style=for-the-badge&logo=debian&logoColor=white)

</div>

## O que é

A Éris é uma bot de discord feita usando **TypeScript** e **Discord.js**, sua database é **postgresql**, usando o orm **Prisma**. Ela tem uma api integrada usando o **fastify**, sua função principal é servir de dashboard pro site, mas também pode ser usado por outros bots as funções de dar stx, receber stx, ver quantos stx tem cada usuário e pegar perguntas de tryvia.

## Código

Meu código é divido em várias pastas, organizadas assim:

```
└── src/
    ├── index.ts
    ├── functions/ // armazena todas as funções e utilidades para que outros códigos possam usar
    ├── database/
    │   ├── devzone.ts
    │   ├── erisHelper.ts
    │   └── index.ts // exporta os clients redis e prisma, tanto ta própria Éris, tanto da bot helper do servidor de suporte e da devzone
    ├── server/ // servidor api
    │   ├── index.ts
    │   ├── types/
    │   │   └── fastify.d.ts
    │   └── routes/ // rotas da api
    │       └── v1/ // rotas liberadas para bots usarem
    │           ├── economy/
    │           │   ├── takeStx.ts
    │           │   ├── balance.ts
    │           │   ├── transactions.ts
    │           │   └── giveStx.ts
    │           ├── botlist/
    │           │   └── votes.ts
    │           └── tryvia/
    │               ├── generateToken.ts
    │               └── getQuestions.ts
    ├── settings/ // configurações
    ├── tools/ // ferramentas do gemini
    │   ├── gemini.ts
    │   └── index.ts
    ├── @types/ // tipos do typescript
    ├── discord/ // conexão com o discord
    │   ├── index.ts
    │   ├── base/ // essencial para a bot funcionar
    │   ├── events/ // todos os eventos, como memberJoin e messageCreate
    │   ├── commands/
    │   │   ├── minigames/ // comandos de minigames
    │   │   ├── user/ // comandos de usuário
    │   │   ├── economy/ // comandos de economia Vale ressaltar que os arquivos são organizados em subcomandos e grupos de subcomandos
    │   │   │   ├── cassinoCommands/
    │   │   │   ├── generalCommands/
    │   │   │   └── investmentCommands/
    │   │   ├── utility/ // comandos de utilidades
    │   │   ├── help/ // comandos de ajuda
    │   │   ├── mail/ // comandos de cartas
    │   │   ├── configuration/ // configurações do servidor
    │   │   ├── tryvia/ // comandos de tryvia
    │   │   ├── private/ // comandos de dev ou de administrador
    │   │   ├── xp/ // comandos de xp
    │   │   └── miscelanius/ // outros comandos
    │   └── responders/ // mesma coisa da pasta commands, só que essa pasta serve para gerenciar as interações como de botão, selectMenu, modal e etc...
    └── menus/ // todos os menus são guardados aqui

```

Vale ressaltar que essa não é a estrutura completa de pastas, é uma breve explicação de cada uma delas

## Rotas api

A Éris possui uma API interna, utilizada pela dashboard e disponível para outros bots aprovados.  
Alguns exemplos de rotas:

- `GET /v1/economy/balance/:userId` → retorna o saldo de um usuário
- `GET /v1/economy/balance` → retorna o próprio saldo
- `POST /v1/economy/give-stx` → adiciona STX para um usuário, usando seu próprio saldo
- `POST /v1/economy/take-stx` → remove STX de um usuário, com seu consentimento
- `GET /v1/tryvia/generateToken` → retorna um token de seção que evita retornar perguntas repetidas
- `GET /v1/tryvia/questions` → retorna perguntas para o minigame de trivia  
- `GET /v1/botlist/votes` → retorna perguntas para o minigame de trivia

Para a documentação completa de rotas, veja [routesData.md](./routesData.md).

## Instalação e uso

### Requisitos

- Ter o node ou bun instalado
- Ter o yarn instalado (não obrigatório)
- Colocar seu token no arquivo .env

### Instalação

```
git clone https://github.com/studio-styx/erisbot.git
cd erisbot
yarn install
yarn dev
```

## ✨ Features:

- 🎮 Minigames: cassino, trivia, xp

- 💰 Economia virtual (STX)

- 📨 Sistema de cartas

- ⚙️ Configuração de servidor

- 📊 API integrada

## Contribuindo
Contribuições são bem-vindas!  
Faça um fork do projeto, crie uma branch com sua feature ou correção e abra um Pull Request.

## Licença
Este projeto está licenciado sob a [Creative Commons BY-NC 4.0](./licence.md).  
Uso permitido para estudo e referência, mas proibido uso comercial e cópias diretas.
