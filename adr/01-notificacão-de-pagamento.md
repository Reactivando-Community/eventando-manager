# Notificaçõao de Pagamento

## Descrição

Este ADR descreve a decisão de implementar um sistema de notificação de pagamento para informar os usuários sobre o status de pagamento dos eventos.

## Contexto

Atualmente, para verificar o status de pagamento de um evento, os sistemas integrados precisam constantemente consultar a API do sistema de pagamentos. Isso pode levar a atrasos na atualização do status e aumentar a carga na API, especialmente durante períodos de alta demanda.

## Decisão

Decidimos implementar um sistema de notificação de pagamento que enviará atualizações em tempo real para os sistemas integrados sempre que houver uma mudança no status de pagamento de um evento. Isso será feito através do uso de webhooks, onde o Eventando enviará uma notificação HTTP POST para um endpoint configurado pelos sistemas integrados.

O fluxo de notificação será o seguinte:

1. O pagamento é gerado e o status inicial é "Pendente".
2. Quando o Eventando receber uma atualização do sistema de pagamentos (por exemplo, "Aprovado" ou "Recusado"), ele enviará uma notificação para o endpoint configurado.
3. O sistema integrado processará a notificação e atualizará o status do pagamento conforme necessário.

## Consequências

- Redução da carga na API do sistema de pagamentos, pois os sistemas integrados não precisarão mais consultar o status de pagamento constantemente.
- Atualizações em tempo real do status de pagamento, melhorando a experiência do usuário.
- Necessidade de garantir a segurança e autenticidade das notificações enviadas via webhooks, para evitar fraudes ou notificações falsas.
- Implementação de mecanismos de retry para garantir que as notificações sejam entregues com sucesso, mesmo em caso de falhas temporárias na rede ou no sistema integrado.