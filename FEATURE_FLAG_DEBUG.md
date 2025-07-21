# Debugging Feature Flags

## Steps to Enable the Feature Flag

### Option 1: Environment Variable (Highest Priority)
```bash
export MEDUSA_FF_VIEW_CONFIGURATIONS=true
npm run dev
```

### Option 2: medusa-config.js
```javascript
module.exports = {
  projectConfig: {
    // ... other config
  },
  featureFlags: {
    view_configurations: true
  }
}
```

**Note**: Make sure `featureFlags` is at the root level, not inside `projectConfig`.

## Debugging Steps

1. **Test the feature flag directly**:
   ```bash
   curl http://localhost:9000/admin/test-feature-flag
   ```
   This will show:
   - Current flag value
   - Environment variable value
   - All loaded flags

2. **Check feature flags API**:
   ```bash
   curl http://localhost:9000/admin/feature-flags \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Browser Console**:
   - Open browser dev tools
   - Navigate to Orders page
   - Check console for:
     - "Feature flags loaded: ..."
     - "view_configurations flag: ..."
     - "Checking feature flag view_configurations: ..."

## Common Issues

1. **Config not loading**: Make sure to restart the server after changing medusa-config.js
2. **Cache issues**: Clear browser cache or open in incognito mode
3. **Wrong config format**: Ensure featureFlags is at root level, not nested

## Verification

When the flag is enabled:
- `/admin/view-configurations` endpoints should return data (not 404)
- Orders page should show view selector dropdown
- Console should show "view_configurations flag: true"

When the flag is disabled:
- `/admin/view-configurations` endpoints should return 404
- Orders page should show legacy table
- Console should show "view_configurations flag: false"