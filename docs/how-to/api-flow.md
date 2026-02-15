# How-to: Fluxo de API para Eventos e Inscrições

Este guia descreve os passos necessários para configurar um evento com produtos e lotes (batches) e realizar uma inscrição.

## 1. Criar um Evento

**Endpoint:** `POST /api/events`

Crie o evento base que conterá os produtos.

**Payload:**

```json
{
  "data": {
    "name": "Meu Evento Incrível",
    "pixai_token_integration": "seu_token_aqui",
    "pixai_token_integration_id": "seu_id_aqui"
  }
}
```

---

## 2. Criar Produtos do Evento

**Endpoint:** `POST /api/products`

Produtos representam as categorias de ingressos (ex: "Profissional", "Estudante"). Eles devem estar vinculados ao ID do Evento criado no passo anterior.

**Payload:**

```json
{
  "data": {
    "name": "Ingresso VIP",
    "event": 1,
    "enabled": true,
    "can_be_listed": true
  }
}
```

---

## 3. Criar Lotes (Batches) do Evento

**Endpoint:** `POST /api/batches`

Lotes representam os preços e quantidades específicos para um produto em um determinado momento (ex: "Lote 1", "Lote 2"). Eles devem estar vinculados ao ID do Produto.

**Payload:**

```json
{
  "data": {
    "batch_number": 1,
    "value": 15000,
    "max_quantity": 100,
    "product": 1,
    "valid_from": "2024-02-15T00:00:00.000Z",
    "valid_until": "2024-03-15T23:59:59.000Z",
    "enabled": true
  }
}
```

---

## 4. Fazer a Inscrição (Signup)

**Endpoint:** `POST /api/signup/:id`
_(Onde `:id` é o ID do Evento)_

Para realizar a inscrição, você deve enviar o `batch_id` escolhido. O sistema validará se o lote está ativo, dentro do prazo e se há estoque.

**Payload:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone_number": "11999999999",
  "batch_id": 1,
  "t_shirt_size": "G"
}
```

---

## Dica: Consultar Eventos com Produtos e Lotes

Para listar os eventos e já trazer os produtos e lotes disponíveis, utilize o parâmetro `populate`:

`GET /api/events?populate[products][populate][batches]=*`

---

## 5. Regras Avançadas

### 5.1 Capacidade Total do Evento

Você pode definir um limite global de vagas no evento através do campo `max_slots` no modelo `Event`. O sistema negará novas inscrições assim que a soma de pagamentos confirmados e pendentes atingir esse valor.

### 5.2 Cupons de Desconto

Os cupons são vinculados a um evento e aplicam um desconto percentual.

- **Payload de Criação (`POST /api/coupons`):**

```json
{
  "data": {
    "code": "COMMUNITY50",
    "discount_percentage": 50,
    "max_uses": 20,
    "event": 1,
    "enabled": true
  }
}
```

- **Uso no Signup:** Envie o campo `coupon_code` no corpo da requisição de inscrição.

### 5.3 Meia-Entrada (Estudantes)

1. No modelo `Batch`, marque o campo `half_price_eligible` como `true`.
2. No momento da inscrição (`POST /api/signup/:id`), envie o campo `"is_student": true`.
3. O sistema aplicará automaticamente 50% de desconto sobre o valor do lote (ou sobre o valor já com desconto de cupom, se houver).

**Payload de Signup com Descontos:**

```json
{
  "name": "Maria Souza",
  "email": "maria@email.com",
  "batch_id": 1,
  "coupon_code": "WELCOMEOFF",
  "is_student": true
}
```
