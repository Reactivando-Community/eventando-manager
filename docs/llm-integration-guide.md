# Eventando API: LLM-First Integration Guide

This document is optimized for LLM assistance (ChatGPT, Claude, Gemini, etc.). It provides structured information, business rules, and schemas to help you integrate with the Eventando Manager API efficiently.

## Core Concepts & Terminology

| Term        | Description                                            | Relationships                            |
| :---------- | :----------------------------------------------------- | :--------------------------------------- |
| **Event**   | The main entity representing an event.                 | Owns `Products`.                         |
| **Product** | A category of ticket (e.g., VIP, Student).             | Belongs to `Event`, owns `Batches`.      |
| **Batch**   | A specific lot of a product with a price and quantity. | Belongs to `Product`, tracks `Payments`. |
| **Payment** | An instance of a signup attempt/successful purchase.   | Linked to a `Batch`.                     |

---

## 🏗️ Data Models (Schemas)

### Event

- `max_slots` (Integer): Global capacity limit for the entire event.

### Product

- `name` (String): Display name.
- `enabled` (Boolean): Global toggle for the ticket type.

### Batch

- `batch_number` (Integer): Serial number (1, 2, ...).
- `value` (BigInt): Price in cents (e.g., 10000 = R$ 100,00).
- `max_quantity` (Integer): Max tickets for this specific batch (Null = Unlimited).
- `valid_from` (DateTime): Start of sales.
- `valid_until` (DateTime): End of sales.
- `enabled` (Boolean): Toggle for this specific batch.

---

## 🛡️ Business Rules & Validations

### 1. Capacity Calculation (Lifecycle)

The system enforces `Event.max_slots` by calculating **Occupancy**.

- **Occupancy Formula:** SUM(Batch_Occupancy)
- **Batch Occupancy Rule:**
  - If Batch is **OPEN** (Enabled & within validity): `Max(Sold_Payments, Batch.max_quantity)`
  - If Batch is **CLOSED** (Disabled or Expired): `Count(Confirmed_or_Pending_Payments)`

> [!IMPORTANT]
> This "Reservation" logic prevents overbooking by counting the `max_quantity` of open batches even if they haven't sold out yet.

### 2. Signup Validation Flow

1. **Status Check:** Batch and Product must be `enabled: true`.
2. **Timeline Check:** `now` must be between `valid_from` and `valid_until`.
3. **Stock Check:** `Confirmed_Payments < Batch.max_quantity` (if set).
4. **Global Capacity:** `Total_Occupancy <= Event.max_slots`.

---

## 🚀 Key Workflows

### Listing Available Options

To fetch everything needed for a frontend:
`GET /api/events/:id?populate[products][populate][batches]=*`

### Performing a Signup

**Endpoint:** `POST /api/signup/:id`

```json
{
  "name": "Developer Name",
  "email": "dev@example.com",
  "batch_id": 123,
  "coupon_code": "OPTIONAL",
  "is_student": false
}
```

---

## ❌ Error Mapping

| Message                | Cause                                           |
| :--------------------- | :---------------------------------------------- |
| `Capacidade excedida!` | Total calculated occupancy > `Event.max_slots`. |
| `Lote vencido`         | Current time > `valid_until`.                   |
| `Lote esgotado`        | `Batch.max_quantity` reached.                   |
| `Inscrição Duplicada`  | Email already exists for this event.            |

---

## 🤖 Prompt Snippets for LLMs

Copy and paste these snippets into your LLM to get context-aware help:

### Context Snippet (The System)

> "I am integrating a React/Mobile frontend with the Eventando Strapi API. The system uses a hierarchical structure: Event -> Products -> Batches. Prices are in cents. Validations are handled via Strapi lifecycle hooks (`beforeCreate`/`beforeUpdate`) for batch capacity and a custom Signup controller for ticket sales."

### Helper Snippet (Validations)

> "Explain how the 'Reservation Logic' works in Eventando when a Batch is OPEN versus when it is CLOSED, based on the `Batch.max_quantity` and actual payment counts."
