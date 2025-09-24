# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-09-24

### 🚀 Major Enhancements
- **Environment Variables**: Automatic replacement of hardcoded domains with configurable environment variables
- **Collection Support**: Full support for converting arrays of Runscope tests into organized Postman folder structures
- **Postman v2 Compliance**: Complete rewrite to generate proper Postman Collection v2.1.0 format

### 🐛 Critical Bug Fixes
- **Fixed Assertions**: Status codes and response times now use proper numeric types instead of strings
  - Before: `pm.response.code === '200'` (fails)
  - After: `pm.response.code === 200` (works)
- **Fixed URL Parsing**: Environment variables now work correctly with proper host/path separation
- **Fixed Collection Structure**: Proper v2 format with `item` arrays instead of legacy `requests`/`folders`

### ✨ New Features
- **CLI Interface**: Enhanced command-line tool with better error handling and progress reporting
- **Update Script**: Tool to add environment variables to existing Postman collections
- **Validation Tool**: Verify Postman v2 format compliance before importing
- **Smart Type Detection**: Automatic detection of numeric, boolean, and string values in assertions

### 🔧 Environment Variables Added
| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `https://www.newhomesource.com` | Main website URLs |
| `NHS_BASE_URL` | `https://www.newhomesource.com` | NHS service URLs |

### 📦 New Scripts
- `npm run convert` - Convert Runscope files to Postman collections
- `npm run update-env-vars` - Add environment variables to existing collections
- `npm run validate` - Validate Postman collection format

### 🏗️ Technical Improvements
- Updated to use Postman Collection Schema v2.1.0
- Enhanced error handling and logging
- Better URL parsing for complex query parameters
- Improved header conversion to v2 format
- Smart assertion generation based on data types

### 📚 Documentation
- Comprehensive README with usage examples
- Environment variables setup guide
- Assertion fixes documentation
- Contributing guidelines

## [0.0.8] - Original Release
- Basic Runscope to Postman conversion
- Single test file support only
- Postman v1 format output
- Original Postman Labs implementation
