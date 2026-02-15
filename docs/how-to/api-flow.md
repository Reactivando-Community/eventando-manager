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
