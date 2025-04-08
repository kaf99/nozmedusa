---
"@medusajs/core-flows": minor
"@medusajs/utils": minor
---

Introduces (breaking changes to) the following events emitted from core flows:

- cart.updated (refactored)
- payment-session.created (added)
- payment-session.deleted(added)
- cart.customer_updated (removed)
- cart.region_updated (removed)

All cart updates now emit a cart.updated event with the following payload:

```
{
  id: string; // Cart ID
  changes: {
    [field: string]: {
      action: "added" | "updated" | "deleted"; // What happened
      value?: any; // Input value
    };
  };
}
```
