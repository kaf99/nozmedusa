---
title: 'White Screen on Admin Dashboard'
---

## White Screen in Production Mode

If you're experiencing a white screen in the Admin Dashboard when running in production mode, it may be related to dependency resolution issues, particularly with the `@swc/core` package.

The issue is specifically related to version 1.11.22 of `@swc/core` released on April 23, 2025, so any version prior to 1.11.22 should resolve the problem.

To resolve this issue, add a specific version of `@swc/core` to the `resolutions` or `overrides` fields in your `package.json` file:

```json
{
  "overrides": {
    "@swc/core": "1.11.21"
  },
  "resolutions": {
    "@swc/core": "1.11.21"
  }
}
```

After adding this package override, reinstall your dependencies and try running in production mode again.

This ensures that all dependencies across your dependency graph use a compatible version of `@swc/core` that doesn't cause rendering issues in the admin dashboard.