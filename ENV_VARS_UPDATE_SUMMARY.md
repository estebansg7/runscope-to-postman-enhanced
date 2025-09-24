# Environment Variables Update Summary

## What Was Done

The runscope-to-postman converter has been updated to automatically replace hardcoded domain URLs with environment variables, making the converted collections more flexible and environment-agnostic.

## Changes Made

### 1. Updated Converter (`index.js`)
- Added automatic environment variable replacement during conversion
- Added predefined environment variables to collection
- Enhanced URL processing to use variables instead of hardcoded domains

### 2. Created Update Script (`update-with-env-vars.js`)
- Script to update existing collections with environment variables
- Handles URL replacements in requests, names, and test scripts
- Adds missing environment variables to collection

### 3. Created Validation Script (`validate.js`)
- Validates Postman Collection v2 format compliance
- Shows collection statistics and environment variables
- Helps ensure collections will import correctly into Postman

## Environment Variables Added

| Variable | Default Value | Usage |
|----------|---------------|-------|
| `BASE_URL` | `https://www.newhomesource.com` | Main website URLs |
| `NHS_BASE_URL` | `https://www.newhomesource.com` | NHS service URLs |

## Domain Mappings

The following domains are automatically replaced:

- `www.newhomesource.com` → `{{BASE_URL}}`
- `features-beta.newhomesource.com` → `{{NHS_BASE_URL}}`
- `leads.newhomesource.com` → `{{NHS_BASE_URL}}`
- `leadsv4.newhomesource.com` → `{{NHS_BASE_URL}}`
- `irs.newhomesource.com` → `{{NHS_BASE_URL}}`

## Usage Examples

### Convert with Environment Variables (New Collections)
```bash
node cli.js HealthMonitoring.json output-with-env-vars.json
```

### Update Existing Collections
```bash
node update-with-env-vars.js existing-collection.json updated-collection.json
```

### Validate Collection Format
```bash
node validate.js collection.json
```

### Using npm Scripts
```bash
npm run convert input.json output.json
npm run update-env-vars existing.json updated.json  
npm run validate collection.json
```

## Benefits

1. **Environment Flexibility**: Easy to switch between development, staging, and production environments
2. **Maintainability**: Central configuration of base URLs
3. **Postman Compatibility**: Proper v2 format with environment variables
4. **Bulk Updates**: Can update multiple collections at once

## Before and After

### Before:
```json
{
  "name": "https://www.newhomesource.com/mvcerror?statuscode={{status}}",
  "request": {
    "url": {
      "raw": "https://www.newhomesource.com/mvcerror?statuscode={{status}}"
    }
  }
}
```

### After:
```json
{
  "name": "{{BASE_URL}}/mvcerror?statuscode={{status}}",
  "request": {
    "url": {
      "raw": "{{BASE_URL}}/mvcerror?statuscode={{status}}"
    }
  }
}
```

With environment variables defined in the collection:
```json
{
  "variable": [
    {
      "key": "BASE_URL",
      "value": "https://www.newhomesource.com",
      "type": "string"
    }
  ]
}
```

This makes it easy to change environments by simply updating the variable values in Postman!
