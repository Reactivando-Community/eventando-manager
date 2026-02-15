# Passo a Passo: Configuração de Eventos

Este guia descreve como configurar um evento completo no sistema, incluindo produtos, lotes (batches) e cupons.

## 1. Criando o Evento

O Evento é a entidade central. Ele agrupa todos os produtos, vendas e configurações de integração.

### Campos Obrigatórios
- **name**: Nome do evento (ex: "Conferência Tech 2026").
- **slug**: Identificador único para a URL (ex: "conf-tech-2026"). Deve seguir o padrão `texto-com-hifen`.
- **uuid**: Identificador único (UID) para referências externas.
- **pixai_token_integration**: Token para integração com o PixAI.

### Campos Opcionais
- **max_slots**: Quantidade máxima de vagas totais para o evento.
- **payment_option**: Opções de pagamento configuradas para o evento.

---

## 2. Criando um Produto

Produtos representam os tipos de ingressos ou itens que podem ser comprados para um evento.

### Campos Obrigatórios
- **name**: Descrição do produto (ex: "Ingresso VIP", "Inscrição Geral").
- **event**: O evento ao qual este produto pertence.

### Campos Opcionais
- **description**: Detalhes sobre o que o produto inclui.
- **enabled**: Define se o produto está ativo (padrão: `true`).
- **can_be_listed**: Define se o produto aparece na listagem pública (padrão: `true`).

---

## 3. Criando um Lote (Batch)

Lotes definem o preço e a disponibilidade temporal para um produto específico.

### Campos Obrigatórios
- **batch_number**: Número do lote (ex: 1 para o primeiro lote).
- **value**: Valor em centavos (ex: `10000` para R$ 100,00).
- **product**: O produto que este lote precifica.

### Campos Opcionais
- **max_quantity**: Limite de vendas para este lote.
- **valid_from**: Data e hora de início das vendas deste lote.
- **valid_until**: Data e hora de término das vendas deste lote.
- **enabled**: Define se o lote está ativo (padrão: `true`).
- **exclusive_label**: Rótulo especial (ex: "Exclusivo para Membros").
- **half_price_eligible**: Indica se este lote permite meia-entrada (padrão: `false`).

---

## 4. Criando um Cupom

Cupons permitem aplicar descontos em percentual para as vendas do evento.

### Campos Obrigatórios
- **code**: O código que o usuário digitará (ex: "PROMO20", "VERAO"). Deve ser único.
- **discount_percentage**: Valor do desconto de 1 a 100.
- **event**: O evento ao qual este cupom se aplica.

### Campos Opcionais
- **max_uses**: Limite total de vezes que o cupom pode ser usado.
- **expires_at**: Data e hora de expiração.
- **enabled**: Define se o cupom está ativo (padrão: `true`).
