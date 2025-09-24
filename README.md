# Runscope-to-Postman Enhanced

Convert Runscope Radar Tests to Postman Collection v2 with enhanced features including environment variables, collection support, and improved assertions.

## 🚀 New Features

- ✅ **Environment Variables**: Automatically replace domains with configurable environment variables
- ✅ **Collection Support**: Convert arrays of Runscope tests into organized Postman folders
- ✅ **Fixed Assertions**: Proper data type handling for status codes and response times
- ✅ **Postman v2 Format**: Full compliance with Postman Collection v2.1.0 schema
- ✅ **CLI Tools**: Easy-to-use command line interface with validation
- ✅ **Bulk Updates**: Update existing collections with environment variables

## 📦 Installation

### Global Installation
```bash
npm install -g runscope-to-postman-enhanced
runscope-to-postman input.json output.json
```

### Local Installation
```bash
npm install runscope-to-postman-enhanced
npx runscope-to-postman input.json output.json
```

### Clone and Use
```bash
git clone https://github.com/estebansg7/runscope-to-postman-enhanced.git
cd runscope-to-postman-enhanced
npm install
node cli.js input.json output.json
```

## 🛠️ Usage

### Basic Conversion
```bash
# Convert single Runscope test
node cli.js runscope-test.json postman-collection.json

# Convert collection of tests with custom name
node cli.js health-monitoring.json "Health Monitoring Collection"
```

### Update Existing Collections
```bash
# Add environment variables to existing collections
node update-with-env-vars.js existing-collection.json updated-collection.json
```

### Validate Collections
```bash
# Validate Postman v2 format compliance
node validate.js collection.json
```

### Using npm Scripts
```bash
npm run convert input.json output.json
npm run update-env-vars existing.json updated.json  
npm run validate collection.json
npm test
```

## 🔧 Environment Variables

The converter automatically creates environment variables for common domains:

| Variable | Default Value | Usage |
|----------|---------------|-------|
| `BASE_URL` | `https://www.newhomesource.com` | Main website URLs |
| `NHS_BASE_URL` | `https://www.newhomesource.com` | NHS service URLs |

### Supported Domain Mappings
- `www.newhomesource.com` → `{{BASE_URL}}`
- `leads.newhomesource.com` → `{{NHS_BASE_URL}}`
- `features-beta.newhomesource.com` → `{{NHS_BASE_URL}}`
- `irs.newhomesource.com` → `{{NHS_BASE_URL}}`

## 📋 Input Formats

### Single Runscope Test
```json
{
  "name": "My API Test",
  "trigger_url": "https://api.runscope.com/...",
  "steps": [...]
}
```

### Collection of Tests
```json
[
  {
    "name": "Test 1",
    "trigger_url": "https://api.runscope.com/...",
    "steps": [...]
  },
  {
    "name": "Test 2", 
    "trigger_url": "https://api.runscope.com/...",
    "steps": [...]
  }
]
```

## 📤 Output Format

Generates Postman Collection v2.1.0 format with:
- ✅ Proper `info` object with schema validation
- ✅ Environment variables in `variable` array
- ✅ Organized folders for multiple tests
- ✅ Working assertions with correct data types
- ✅ Converted scripts and pre-request scripts

## 🐛 Bug Fixes from Original

- **Fixed Assertions**: Status codes and response times now use numbers instead of strings
- **Fixed URL Parsing**: Environment variables work correctly with proper host/path separation
- **Fixed Collection Structure**: Proper v2 format with `item` arrays instead of legacy format
- **Fixed Headers**: Proper v2 header format with key/value/type structure

## 🧪 Testing

```bash
npm test
```

## 📖 Examples

See the documentation files for detailed examples:
- `ENV_VARS_UPDATE_SUMMARY.md` - Environment variables guide
- `ASSERTIONS_FIX.md` - Assertion improvements
- `test/` directory - Sample input/output files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Credits

Based on the original [runscope-to-postman](https://github.com/postmanlabs/runscope-to-postman) by Postman Labs.

Enhanced with:
- Environment variable support
- Collection handling
- Assertion fixes
- Postman v2 compliance
- CLI improvements

## 📞 Support

- Create an issue on [GitHub Issues](https://github.com/estebansg7/runscope-to-postman-enhanced/issues)
- Check existing documentation in the repository