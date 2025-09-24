#!/usr/bin/env node

const fs = require('fs');

function validatePostmanCollection(filePath) {
    try {
        const collection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log('🔍 Validating Postman Collection v2 format...\n');
        
        // Check required v2 fields
        const checks = [
            {
                name: 'Has info object',
                test: () => collection.info && typeof collection.info === 'object',
                fix: 'Collection must have an "info" object'
            },
            {
                name: 'Has schema definition',
                test: () => collection.info && collection.info.schema && 
                         collection.info.schema.includes('schema.getpostman.com'),
                fix: 'info.schema should point to Postman schema'
            },
            {
                name: 'Has name in info',
                test: () => collection.info && collection.info.name,
                fix: 'info.name is required'
            },
            {
                name: 'Has item array',
                test: () => Array.isArray(collection.item),
                fix: 'Collection should have "item" array instead of "requests"'
            },
            {
                name: 'No v1 legacy fields',
                test: () => !collection.requests && !collection.order && !collection.folders,
                fix: 'Remove v1 fields: requests, order, folders'
            }
        ];
        
        let allPassed = true;
        checks.forEach(check => {
            const passed = check.test();
            console.log(`${passed ? '✅' : '❌'} ${check.name}`);
            if (!passed) {
                console.log(`   ${check.fix}`);
                allPassed = false;
            }
        });
        
        if (allPassed) {
            console.log('\n🎉 Collection is valid Postman v2 format!');
            
            // Count items
            function countItems(items) {
                let requests = 0;
                let folders = 0;
                
                items.forEach(item => {
                    if (item.item) {
                        folders++;
                        const counts = countItems(item.item);
                        requests += counts.requests;
                        folders += counts.folders;
                    } else {
                        requests++;
                    }
                });
                
                return { requests, folders };
            }
            
            const stats = countItems(collection.item);
            console.log(`📊 Collection contains: ${stats.requests} requests in ${stats.folders} folders`);
            console.log(`📝 Name: "${collection.info.name}"`);
            console.log(`🔗 Schema: ${collection.info.schema}`);
            
        } else {
            console.log('\n❌ Collection format issues found.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Error validating collection:', error.message);
        process.exit(1);
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: node validate.js <postman-collection.json>');
    process.exit(1);
}

validatePostmanCollection(args[0]);
