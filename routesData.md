# 📖 API de Economia – Éris

## 🔗 Base URL

```
https://apieris.squareweb.com/v1/
```

---

## 📌 Endpoints

### 1. **`POST /economy/give-stx`**

Dá uma quantia de **stx** a um usuário.

#### 📥 Requisição

```json
{
  "guildId": "string",
  "channelId": "string",
  "memberId": "string",
  "amount": 1,
  "reason": "string (opcional)"
}
```

#### 📤 Respostas

| Status | Resposta                                                                                         | Descrição                           |
| ------ | ------------------------------------------------------------------------------------------------ | ----------------------------------- |
| 200    | `{ "message": "Success", "success": true }`                                                      | Operação realizada com sucesso      |
| 400    | `{ "message": "Not enough money", "success": false }`                                            | Usuário não possui saldo suficiente |
| 403    | `{ "message": "Missing Permissions", "success": false }`                                         | Bot sem permissões necessárias      |
| 403    | `{ "message": "You are not on this server", "success": false }`                                  | O bot não está no servidor          |
| 403    | `{ "message": "You do not have permission to send messages in this channel", "success": false }` | Bot sem permissão de envio          |
| 404    | `{ "message": "Guild not found", "success": false }`                                             | Servidor não encontrado             |
| 404    | `{ "message": "Channel not found", "success": false }`                                           | Canal não encontrado                |
| 404    | `{ "message": "Member not found", "success": false }`                                            | Usuário não encontrado              |

---

### 2. **`POST /economy/take-stx`**

Solicita a retirada de **stx** de um usuário. O usuário precisa confirmar ou cancelar a transação em até **1 minuto**.

#### 📥 Requisição

```json
{
  "guildId": "string",
  "channelId": "string",
  "memberId": "string",
  "amount": 1,
  "reason": "string (opcional)"
}
```

#### 📤 Respostas

| Status | Resposta                                                                                         | Descrição                        |
| ------ | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| 200    | `{ "message": "Success to take X from <user>", "success": true }`                                | Transação confirmada             |
| 400    | `{ "message": "Not enough money", "success": false }`                                            | Usuário sem saldo                |
| 403    | `{ "message": "Missing Permissions", "success": false }`                                         | Bot sem permissões necessárias   |
| 403    | `{ "message": "You are not on this server", "success": false }`                                  | O bot não está no servidor       |
| 403    | `{ "message": "You do not have permission to send messages in this channel", "success": false }` | Bot sem permissão de envio       |
| 404    | `{ "message": "Guild not found", "success": false }`                                             | Servidor não encontrado          |
| 404    | `{ "message": "Channel not found", "success": false }`                                           | Canal não encontrado             |
| 404    | `{ "message": "Member not found", "success": false }`                                            | Usuário não encontrado           |
| 408    | `{ "message": "User did not respond", "success": false }`                                        | Usuário não respondeu            |
| 409    | `{ "message": "You already have a transaction with this user in progress", "success": false }`   | Já existe uma transação pendente |
| 422    | `{ "message": "User canceled the transaction", "success": false }`                               | Usuário cancelou                 |

---

### 3. **`GET /economy/balance/:userId`**

Consulta o saldo de um usuário.

#### 📥 Parâmetros

* `userId` – ID do usuário (string)

#### 📤 Respostas

| Status | Resposta                          | Descrição                  |
| ------ | --------------------------------- | -------------------------- |
| 200    | `{ "money": 100, "bank": 250 }`   | Retorna o saldo do usuário |
| 404    | `{ "message": "User not found" }` | Usuário não encontrado     |

---

### 4. **`POST /economy/transactions/:userId`**

Lista as transações de um usuário.

#### 📥 Parâmetros

* `userId` – ID do usuário (string)

#### 📥 Body (opcional)

```json
{
  "limit": 10,
  "timeLimit": "2025-08-10T00:00:00.000Z"
}
```

#### 📤 Respostas

```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "message": "Transação confirmada",
      "type": "info",
      "tags": ["economy", "transaction"],
      "timestamp": "2025-08-15T20:00:00.000Z"
    }
  ]
}
```

| Status | Descrição                    |
| ------ | ---------------------------- |
| 200    | Logs encontrados com sucesso |

---

# 📖 API da Botlist – Éris

---

### 5. **`GET /v1/botlist/votes`**

Obtém informações sobre os votos da aplicação.

#### 📤 Respostas

| Status | Resposta                                 | Descrição                                 |
| ------ | ---------------------------------------- | ----------------------------------------- |
| 200    | `{ "votes": 15, "votesData": [...] }`    | Retorna a quantidade e os dados dos votos |
| 404    | `{ "message": "Application not found" }` | Aplicação não encontrada                  |

---
### 6. **`GET /v1/tryvia/generateToken`

Retorna um token de seção que evita retornar perguntas repitidas.

#### 📤 Resposta

| Status | Resposta                                 | Descrição                                 |
| ------ | ---------------------------------------- | ----------------------------------------- |
| 201    | `{ "token": "token" }`                   | Retorna o token de acesso                 |


---
### 7. **`GET /v1/tryvia/questions`

Retorna as perguntas de tryvia

#### 📤 Querys

sessionToken: string;
tags: "football+mbappe+...";
difficulty: "easy" | "medium" | "hard";
amount: number;
type: "multiple" | "boolean" | "writeinchat";


#### 📤 Respostas

```json
{
  "warnings": ["Your sessionToken has all the questions stored in the database.", "There are no questions based on these criteria, or your sessionToken has already stored all questions based on this criterion.", "It was not possible to obtain all 20 questions based on the provided criteria, found: 2"],
  "questions": [
    {
      "tags": ["football", "mbappe"],
      "difficulty": "easy" | "medium" | "hard",
      "type": "MULTIPLE" | "BOOLEAN" | "WRITEINCHAT",
      "id": 3,
      "question": "Qual seleção joga Mbappé?",
      "correct": boolean | null, // aqui é para caso seja uma pergunta de sim ou não, se for verdadeira será true, se for falsa será false
      "correctAnswer": "França",
      "correctAnswersVariation": ["Franca"],
      "explanation": "A nacionalidade de Mbappé é francesa, ele nasceu na França em Paris",
      "incorrectAnswers": ["Noruega", "Espanha", "Argentina"],
      "createdAt": Date,
      "updatedAt": Date,
  }
  ]
}
```


| Status | Resposta                                 | Descrição                                 |
| ------ | ---------------------------------------- | ----------------------------------------- |
| 200    | `warnings: string[] questions: [...],` | Retorna o token de acesso                 |

## ⚠️ Observações Importantes

* A API depende do Discord.js, Prisma e permissões adequadas no servidor para envio de mensagens.
* Algumas transações (como `/take-stx`) exigem **confirmação do usuário via interação no Discord**.
