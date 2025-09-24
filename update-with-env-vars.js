#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function updateCollectionWithEnvVars(filePath, outputPath) {
    try {
        console.log(`📖 Reading collection from: ${filePath}`);
        const collection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Define domain mappings
        const domainMappings = {
            'www.newhomesource.com': 'BASE_URL',
            'features-beta.newhomesource.com': 'NHS_BASE_URL',
            'leads.newhomesource.com': 'NHS_BASE_URL',
            'leadsv4.newhomesource.com': 'NHS_BASE_URL',
            'irs.newhomesource.com': 'NHS_BASE_URL'
        };
        
        // Add environment variables if they don't exist
        if (!collection.variable) {
            collection.variable = [];
        }
        
        // Add missing variables
        const existingVars = new Set(collection.variable.map(v => v.key));
        
        if (!existingVars.has('BASE_URL')) {
            collection.variable.push({
                key: "BASE_URL",
                value: "https://www.newhomesource.com",
                type: "string"
            });
        }
        
        if (!existingVars.has('NHS_BASE_URL')) {
            collection.variable.push({
                key: "NHS_BASE_URL", 
                value: "https://www.newhomesource.com",
                type: "string"
            });
        }
        
        let replacementCount = 0;
        
        function processItem(item) {
            if (item.request) {
                // Process request URL
                if (item.request.url) {
                    if (typeof item.request.url === 'string') {
                        const original = item.request.url;
                        item.request.url = replaceDomains(item.request.url);
                        if (original !== item.request.url) {
                            replacementCount++;
                        }
                    } else if (item.request.url.raw) {
                        const original = item.request.url.raw;
                        item.request.url.raw = replaceDomains(item.request.url.raw);
                        if (original !== item.request.url.raw) {
                            replacementCount++;
                            
                            // Update host array if needed
                            const urlParts = item.request.url.raw.split('/');
                            if (urlParts.length > 2 && urlParts[2]) {
                                const hostPart = urlParts[2];
                                if (hostPart.includes('{{')) {
                                    item.request.url.host = [hostPart];
                                } else {
                                    // Update individual host parts
                                    if (item.request.url.host && Array.isArray(item.request.url.host)) {
                                        item.request.url.host = item.request.url.host.map(hostSegment => {
                                            for (const [domain, varName] of Object.entries(domainMappings)) {
                                                if (hostSegment === domain) {
                                                    return varName.toLowerCase().replace('_', '.');
                                                }
                                            }
                                            return hostSegment;
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Update item name if it contains URLs
                if (item.name) {
                    const originalName = item.name;
                    item.name = replaceDomains(item.name);
                    if (originalName !== item.name) {
                        replacementCount++;
                    }
                }
                
                // Process events (scripts)
                if (item.event && Array.isArray(item.event)) {
                    item.event.forEach(event => {
                        if (event.script && event.script.exec && Array.isArray(event.script.exec)) {
                            event.script.exec = event.script.exec.map(line => {
                                const original = line;
                                const updated = replaceDomains(line);
                                if (original !== updated) {
                                    replacementCount++;
                                }
                                return updated;
                            });
                        }
                    });
                }
            }
            
            // Process child items
            if (item.item && Array.isArray(item.item)) {
                item.item.forEach(processItem);
            }
        }
        
        function replaceDomains(text) {
            if (!text) return text;
            
            let result = text;
            for (const [domain, varName] of Object.entries(domainMappings)) {
                // Replace https://domain and http://domain with {{VAR_NAME}}
                const httpsPattern = new RegExp(`https://${domain.replace(/\./g, '\\.')}`, 'g');
                const httpPattern = new RegExp(`http://${domain.replace(/\./g, '\\.')}`, 'g');
                
                result = result.replace(httpsPattern, `{{${varName}}}`);
                result = result.replace(httpPattern, `{{${varName}}}`);
                
                // Also replace bare domain references
                const barePattern = new RegExp(domain.replace(/\./g, '\\.'), 'g');
                result = result.replace(barePattern, varName.toLowerCase().replace('_', '.'));
            }
            
            return result;
        }
        
        // Process all items in the collection
        if (collection.item && Array.isArray(collection.item)) {
            collection.item.forEach(processItem);
        }
        
        // Write the updated collection
        console.log(`💾 Writing updated collection to: ${outputPath}`);
        fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
        
        console.log(`✅ Successfully updated collection!`);
        console.log(`🔄 Made ${replacementCount} URL replacements`);
        console.log(`📊 Added ${collection.variable.length} environment variables`);
        
        // Show variables
        console.log('\n📝 Environment Variables:');
        collection.variable.forEach(v => {
            console.log(`   ${v.key} = ${v.value}`);
        });
        
    } catch (error) {
        console.error('❌ Error updating collection:', error.message);
        process.exit(1);
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: node update-with-env-vars.js <input-collection.json> [output-collection.json]');
    console.log('');
    console.log('This script will:');
    console.log('  - Replace www.newhomesource.com URLs with {{BASE_URL}}');
    console.log('  - Replace other NHS domain URLs with {{NHS_BASE_URL}}');
    console.log('  - Add environment variables to the collection');
    console.log('');
    console.log('Example:');
    console.log('  node update-with-env-vars.js output-postman-v2-final.json output-updated.json');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace('.json', '-with-env-vars.json');

updateCollectionWithEnvVars(inputFile, outputFile);
