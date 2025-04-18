---
"@medusajs/core-flows": minor
"@medusajs/utils": minor
---

Introduces (breaking changes to) the following events emitted from core flows:

- cart.updated (refactored)
- payment-session.created (added)
- payment-session.deleted(added)

All cart updates now emit a `cart.updated` event. The payload structure has been updated for better type safety and to support multiple actions (added, updated, deleted) per field type in a single event:

```ts
export enum ChangeAction {
  ADDED = "added",
  UPDATED = "updated",
  DELETED = "deleted",
}

type Change<T> = {
  action: ChangeAction
  value: T
}

// Example structure, specific types depend on context (e.g., StoreCartLineItem, AddressDTO)
type CartWorkflowEventPayload = {
  id: string // Cart ID
  changes: {
    line_items?: Change<
      Partial</* StoreCartLineItem | CartLineItemDTO */ any>
    >[]
    promo_codes?: Change<string>[]
    region_id?: Change<string>
    customer_id?: Change<string>
    sales_channel_id?: Change<string>
    email?: Change<string>
    currency_code?: Change<string>
    metadata?: Change<Record<string, unknown>>
    shipping_address?: Change<Partial</* StoreCartAddress | AddressDTO */ any>>
    billing_address?: Change<Partial</* StoreCartAddress | AddressDTO */ any>>
  }
}
```
