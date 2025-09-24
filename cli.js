#!/usr/bin/env node

const converter = require('./index.js');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
    console.log('Usage: node cli.js <input-runscope-file.json> [output-postman-file.json] [collection-name]');
    console.log('');
    console.log('Examples:');
    console.log('  node cli.js test/runscope1.json output.json');
    console.log('  node cli.js HealthMonitoring.json health-tests.json "Health Monitoring Tests"');
    console.log('  node cli.js collection.json  # Uses default output filename and collection name');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || 'converted-postman.json';
const collectionName = args[2]; // Optional collection name

try {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file "${inputFile}" not found.`);
        process.exit(1);
    }

    // Read the Runscope JSON file
    console.log(`Reading Runscope file: ${inputFile}`);
    const runscopeJson = fs.readFileSync(inputFile, 'utf8');

    // Convert to Postman format
    console.log('Converting to Postman collection...');
    const postmanCollection = converter.convert(runscopeJson, collectionName);

    // Write the output file
    console.log(`Writing Postman collection to: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(postmanCollection, null, 2));

    console.log('✅ Conversion completed successfully!');
    console.log(`📁 Output file: ${path.resolve(outputFile)}`);
    
    // Show collection stats
    function countItems(items) {
        let requestCount = 0;
        let folderCount = 0;
        
        items.forEach(item => {
            if (item.item) {
                // This is a folder
                folderCount++;
                const subCounts = countItems(item.item);
                requestCount += subCounts.requests;
                folderCount += subCounts.folders;
            } else {
                // This is a request
                requestCount++;
            }
        });
        
        return { requests: requestCount, folders: folderCount };
    }
    
    const stats = countItems(postmanCollection.item || []);
    stats.name = postmanCollection.info.name;
    console.log(`📊 Collection stats: ${stats.requests} requests in ${stats.folders} folders`);
    console.log(`📝 Collection name: "${stats.name}"`);

} catch (error) {
    console.error('❌ Error during conversion:', error.message);
    process.exit(1);
}
