var _ = require('lodash'),
	//SDK = require('postman-collection'),
	uuidv4 = require('uuid/v4');

// var runscopeConverterV2 = {
// 	validateRunscope: function (runscopeJson) {
// 		//validate
// 		if (typeof runscopeJson === 'string') {
// 			runscopeJson = JSON.parse(runscopeJson);
// 		}

// 		if (runscopeJson.hasOwnProperty('name') && 
// 			runscopeJson.hasOwnProperty('trigger_url')) {
// 			return runscopeJson;
// 		}
// 		else {
// 			throw {
// 				'message': 'Not a runscope test'
// 			};
// 		}
// 	},

// 	getHeadersForStep: function (runscopeJson, step) {
// 		var retVal = [];
// 		for (var prop in step) {
// 			if (step.hasOwnProperty(prop)) {
// 				retVal.push(new SDK.Header({
// 					key: prop,
// 					value: step[prop][0]
// 				}));
// 			}
// 		}
// 		return retVal;
// 	},

// 	getRequestsFromSteps: function (runscopeJson) {
// 		var oldThis = this;
// 		return _.map(runscopeJson.steps, function(step) {
// 			console.log('URL: ' + step.url);
// 			var r = new SDK.Request({
// 				url: step.url,
// 				method: step.method
// 			});
// 			r.headers = oldThis.getHeadersForStep(runscopeJson, step);
// 			return r;
// 		});
// 	},

// 	convert: function (runscopeJson) {
// 		var oldThis = this;
// 		runscopeJson = oldThis.validateRunscope(runscopeJson);
// 		var collection = new SDK.Collection({
// 			info: {
// 				name: runscopeJson.name,
// 				description: runscopeJson.description
// 			}
// 		});


// 		var items = oldThis.getRequestsFromSteps(runscopeJson);
// 		_.each(items, function (rItem) {
// 			var cItem = new SDK.Item({
// 				id: uuid.v4(),
// 				version: '1.0.0',
// 				name: rItem.name,
// 				request: rItem
// 			});
// 			console.log('Added request: ' , rItem.toJSON());
// 			collection.items.add(cItem);
// 		});
// 		//console.log(JSON.stringify(collection));
// 	}
// };


var runscopeConverterV1 = {
	validateRunscope: function (runscopeJson) {
		if(!runscopeJson) {
			throw {
				'message': 'No runscope test provided'
			};
		}

		//validate
		if(typeof runscopeJson === 'string') {
			runscopeJson = JSON.parse(runscopeJson);
		}

		// Handle collections (arrays of tests)
		if(Array.isArray(runscopeJson)) {
			return runscopeJson;
		}

		// Handle single test
		if(runscopeJson.hasOwnProperty('name') && 
			runscopeJson.hasOwnProperty('trigger_url')) {
			return [runscopeJson]; // Wrap single test in array for consistent processing
		}
		else {
			throw {
				'message': 'Not a valid runscope test or collection'
			};
		}
	},

	initCollection: function (runscopeTests, collectionName) {
		// Use provided collection name or generate one from tests
		var name = collectionName || 'Converted Runscope Tests';
		if (runscopeTests.length === 1) {
			name = runscopeTests[0].name;
		}
		
		return {
			info: {
				_postman_id: uuidv4(),
				name: name,
				description: runscopeTests.length > 1 ? 
					`Collection of ${runscopeTests.length} Runscope tests` : 
					runscopeTests[0].description || '',
				schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
			},
			item: [],
			variable: [
				{
					key: "BASE_URL",
					value: "https://www.newhomesource.com",
					type: "string"
				},
				{
					key: "NHS_BASE_URL", 
					value: "https://www.newhomesource.com",
					type: "string"
				}
			]
		};
	},

	getPostmanHeadersFromRunscopeHeaders: function (runscopeHeaders) {
		var str = '';
		for(var key in runscopeHeaders) {
			if(runscopeHeaders.hasOwnProperty(key)) {
				str += key+':'+runscopeHeaders[key]+'\n';
			}
		}
		return str;
	},

	addRequest: function (collection, request, folder) {
		if (folder) {
			// Add to folder
			folder.item.push(request);
		} else {
			// Add to collection root
			collection.item.push(request);
		}
	},

	handleAuth: function (request, step) {
		if(step.auth) {
			if (step.auth.auth_type === 'basic') {
				request.currentHelper = 'basicAuth';
				request.helperAttributes = {
					id: 'basic',
					saveToRequest: true,
					username: step.auth.username,
					password: step.auth.password,
				};
			}
		}
		//no other auth types supported yet
		//do oauth1 next
	},

	handleData: function (request, step) {
		if((typeof step.body === 'string') && JSON.stringify(step.form) == '{}') {
			request.dataMode = 'raw';
			request.data = step.body;
		}

		else if(step.form) {
			request.dataMode = 'urlencoded';
			var formArray = [];
			for(var key in step.form) {
				if(step.form.hasOwnProperty(key)) {
					formArray.push({
						key: key,
						value: step.form[key][0]
					});
				}
			}
			request.data = formArray;
		}
	},

	// handleAssertions: function (request, step) {
	// 	var tests = '';
	// 	_.each(step.assertions, function(ass) {
	// 	});
	// 	return tests;
	// },

	handleScripts: function (request, step) {
		if(!step.before_scripts) {
			step.before_scripts = [];
		}

		request.preRequestScript = '';

		var runscopePrScript = step.before_scripts.join('\n');
		runscopePrScript = runscopePrScript.replace(/\n/g,'\n//');
		if(!_.isEmpty(runscopePrScript)) {
			request.preRequestScript = '//==== You will need to convert this to a ' + 
				'Postman-compliant script ====\n' + 
				'//==== (Select text and use Ctrl + / (Win) or Cmd + / (Mac) to uncomment ====\n' + 
				'//' + runscopePrScript;
		}


		if(!step.scripts) {
			step.scripts = [];
		}
		var runscopeTestScript = step.scripts.join('\n');
		runscopeTestScript = runscopeTestScript.replace(/\n/g,'\n//');
		if(!_.isEmpty(runscopeTestScript)) {
			request.tests += '//==== You will need to convert this to a ' + 
				'Postman-compliant script ====\n' + 
				'//==== (Select text and use Ctrl + / (Win) or Cmd + / (Mac) to uncomment ====\n' + 
				'//' + runscopeTestScript;
		}
	},

	// V2 format handlers
	handleDataV2: function (request, step) {
		if (step.body && typeof step.body === 'string' && (!step.form || JSON.stringify(step.form) === '{}')) {
			request.request.body = {
				mode: 'raw',
				raw: step.body
			};
		} else if (step.form) {
			var formArray = [];
			for (var key in step.form) {
				if (step.form.hasOwnProperty(key)) {
					formArray.push({
						key: key,
						value: step.form[key][0] || step.form[key],
						type: 'text'
					});
				}
			}
			request.request.body = {
				mode: 'urlencoded',
				urlencoded: formArray
			};
		}
	},

	handleAuthV2: function (request, step) {
		if (step.auth && step.auth.auth_type === 'basic') {
			request.request.auth = {
				type: 'basic',
				basic: [
					{
						key: 'username',
						value: step.auth.username,
						type: 'string'
					},
					{
						key: 'password',
						value: step.auth.password,
						type: 'string'
					}
				]
			};
		}
	},

	handleScriptsV2: function (request, step) {
		// Handle pre-request scripts
		if (step.before_scripts && step.before_scripts.length > 0) {
			var runscopePrScript = step.before_scripts.join('\n');
			runscopePrScript = runscopePrScript.replace(/\n/g, '\n//');
			if (!_.isEmpty(runscopePrScript)) {
				request.event.push({
					listen: 'prerequest',
					script: {
						type: 'text/javascript',
						exec: [
							'//==== You will need to convert this to a Postman-compliant script ====',
							'//==== (Select text and use Ctrl + / (Win) or Cmd + / (Mac) to uncomment ====',
							'//' + runscopePrScript
						]
					}
				});
			}
		}

		// Handle test scripts and assertions
		var testScripts = [];
		
		// Add custom scripts
		if (step.scripts && step.scripts.length > 0) {
			var runscopeTestScript = step.scripts.join('\n');
			runscopeTestScript = runscopeTestScript.replace(/\n/g, '\n//');
			if (!_.isEmpty(runscopeTestScript)) {
				testScripts.push('//==== You will need to convert this to a Postman-compliant script ====');
				testScripts.push('//==== (Select text and use Ctrl + / (Win) or Cmd + / (Mac) to uncomment ====');
				testScripts.push('//' + runscopeTestScript);
				testScripts.push('');
			}
		}

		// Add converted assertions
		if (step.assertions && step.assertions.length > 0) {
			testScripts.push('//==== This section is Postman-compliant ====');
			this.handleAssertionsV2(testScripts, step);
		}

		if (testScripts.length > 0) {
			request.event.push({
				listen: 'test',
				script: {
					type: 'text/javascript',
					exec: testScripts
				}
			});
		}
	},

	handleAssertionsV2: function (testScripts, step) {
		var oldThis = this;
		_.each(step.assertions, function (ass) {
			var testName = '';
			var oper1 = null;
			var oper2 = '\'' + ass.value + '\''; // Default to string
			var testScript = '';

			// Helper function to determine if value should be quoted
			function shouldQuoteValue(source, comparison, value) {
				// Don't quote numeric values for these sources
				if (source === 'response_status' || source === 'response_time') {
					return false;
				}
				// Don't quote if it's a numeric comparison and the value is numeric
				if ((comparison === 'equal_number' || comparison === 'is_less_than' || 
					 comparison === 'is_less_than_or_equal' || comparison === 'is_greater_than' || 
					 comparison === 'is_greater_than_or_equal') && !isNaN(value)) {
					return false;
				}
				// Quote boolean values properly
				if (value === 'true' || value === 'false') {
					return false;
				}
				return true;
			}

			// Set default oper2 based on whether it should be quoted
			oper2 = shouldQuoteValue(ass.source, ass.comparison, ass.value) ? 
				'\'' + ass.value + '\'' : ass.value;

			// Handle source (LHS)
			switch (ass.source) {
				case 'response_status':
					testName += 'Status Code is correct';
					oper1 = 'pm.response.code';
					break;
				case 'response_headers':
					testName += '\'' + ass.property + '\' Response Header is correct';
					oper1 = 'pm.response.headers.get(\'' + ass.property + '\')';
					break;
				case 'response_json':
					if (ass.property) {
						testName += 'Response.' + ass.property + ' is correct';
						oper1 = 'pm.response.json().' + ass.property;
					} else {
						testName += 'JSON Response is correct';
						oper1 = 'pm.response.json()';
					}
					break;
				case 'response_text':
					testName += 'Response text is correct';
					oper1 = 'pm.response.text()';
					break;
				case 'response_time':
					testName += 'Response time is correct';
					oper1 = 'pm.response.responseTime';
					break;
			}

			if (oper1) {
				testScript = 'pm.test("' + testName + '", function () {';
				testScript += '\n    pm.expect(' + oldThis.getRHSFromComparisonAndOperandsV2(ass.comparison, oper1, oper2) + ').to.be.true;';
				testScript += '\n});';
				
				if (testScript.indexOf('.json()') > -1) {
					testScript = 'pm.test("' + testName + '", function () {\n    try {\n        pm.expect(' + 
						oldThis.getRHSFromComparisonAndOperandsV2(ass.comparison, oper1, oper2) + ').to.be.true;\n    } catch(e) {\n        pm.test.skip("Could not parse JSON");\n    }\n});';
				}
				testScripts.push(testScript);
				testScripts.push('');
			}
		});
	},

	getRHSFromComparisonAndOperandsV2: function(comparison, oper1, oper2) {
		switch(comparison) {
			case 'equal_number':
			case 'equal':
				return oper1 + ' === ' + oper2;
			case 'not_equal':
				return oper1 + ' !== ' + oper2;
			case 'empty':
				return '!' + oper1 + ' || ' + oper1 + '.length === 0';
			case 'not_empty':
				return oper1 + ' && ' + oper1 + '.length > 0';
			case 'contains':
				return oper1 + '.includes(' + oper2 + ')';
			case 'does_not_contain':
				return '!' + oper1 + '.includes(' + oper2 + ')';
			case 'is_a_number':
				return '!isNaN(' + oper1 + ')';
			case 'is_less_than':
				return oper1 + ' < ' + oper2;
			case 'is_less_than_or_equal':
				return oper1 + ' <= ' + oper2;
			case 'is_greater_than':
				return oper1 + ' > ' + oper2;
			case 'is_greater_than_or_equal':
				return oper1 + ' >= ' + oper2;
			case 'has_key':
				return oper1 + '.hasOwnProperty(' + oper2 + ')';
			case 'has_value':
				return 'Object.values(' + oper1 + ').includes(' + oper2 + ')';
			default:
				return '<comparison here>';
		}
	},

	replaceDomainsWithVariables: function(url) {
		if (!url) return url;
		
		// Define domain mappings
		var domainMappings = {
			'www.newhomesource.com': '{{BASE_URL}}',
			'features-beta.newhomesource.com': '{{NHS_BASE_URL}}',
			'leads.newhomesource.com': '{{NHS_BASE_URL}}',
			'leadsv4.newhomesource.com': '{{NHS_BASE_URL}}',
			'irs.newhomesource.com': '{{NHS_BASE_URL}}'
		};
		
		var processedUrl = url;
		
		// Replace each domain with its corresponding variable
		for (var domain in domainMappings) {
			if (domainMappings.hasOwnProperty(domain)) {
				var variable = domainMappings[domain];
				// Replace https://domain and http://domain
				processedUrl = processedUrl.replace(new RegExp('https?://' + domain.replace(/\./g, '\\.'), 'g'), variable);
				
				// Also handle cases where the domain appears in query parameters or paths
				processedUrl = processedUrl.replace(new RegExp(domain.replace(/\./g, '\\.'), 'g'), variable.replace(/[{}]/g, ''));
			}
		}
		
		return processedUrl;
	},

	getRHSFromComparisonAndOperands: function(comparison, oper1, oper2) {
		switch(comparison) {
			case 'equal_number':
			case 'equal':
				return oper1 + ' == ' + oper2;
			case 'not_equal':
				return oper1 + '!=' + oper2;
			case 'empty':
				return '_.isEmpty(' + oper1 + ')';
			case 'not_empty':
				return '!_.isEmpty(' + oper1 + ')';
			case 'contains':
				return '_.contains(' + oper1 + ')';
			case 'does_not_contain':
				return '!_.contains(' + oper1 + ')';
			case 'is_a_number':
				return '!isNaN('+oper1+')';
			case 'is_less_than':
				return oper1 + ' < ' + oper2;
			case 'is_less_than_or_equal':
				return oper1 + ' <= ' + oper2;
			case 'is_greater_than':
				return oper1 + ' > ' + oper2;
			case 'is_greater_than_or_equal':
				return oper1 + ' >= ' + oper2;
			case 'has_key':
				return oper1 + '.hasOwnProperty(' + oper2 + ')';
			case 'has_value':
				return '_.contains(_.values(' + oper1 + '), ' + oper2 + ')';
			default:
				return '<comparison here>';
		}
	},

	handleAssertions: function (request, step) {
		var tests = '',
			oldThis = this;
		_.each(step.assertions, function (ass) {

			var testName = '',
				oper1 = null,
				oper2 = '\'' + ass.value + '\'',
				testScript = '';

			// Handle source (LHS)
			switch(ass.source) {
				case 'response_status':
					testName += 'Status Code is correct';
					oper1 = 'responseCode.code';
					break;
				case 'response_headers':
					// this will have a property
					testName += '\''+ass.property+'\' Response Header is correct';
					oper1 = 'postman.getResponseHeader(\''+ass.property+'\')';
					break;
				case 'response_json':
					if(ass.property) {
						testName += 'Response.' + ass.property + ' is correct';
						oper1 = 'JSON.parse(responseBody).'+ass.property;
					}
					else {
						testName += 'JSON Response is correct';
						oper1 = 'JSON.parse(responseBody)';
					}
					break;
				case 'response_size':
					testName += '//';
					break;
				case 'response_text':
					testName += 'Response text is correct';
					oper1 = 'responseBody';
					break;
				case 'response_time':
					testName += 'Response time is correct';
					oper1 = 'responseTime';
					break;
			}

			if(oper1) {
				testScript = 'tests["' + testName + '"] = ' + 
					oldThis.getRHSFromComparisonAndOperands(ass.comparison, oper1, oper2) + ';';
				if(testScript.indexOf('JSON.parse') > -1) {
					testScript = 'try {\n\t' + testScript + '\n}\ncatch(e) {\n\t'+
					'tests["' + testName + '"] = false;\n\t' +
					'console.log(\"Could not parse JSON\");\n}';
				}
				tests += testScript + '\n\n';
			}
		});

		if(!_.isEmpty(tests)) {
			request.tests += '//==== This section is Postman-compliant ====\n' + 
				tests + '\n';
		}
	},

	getRequestFromStep: function (step) {
		var oldThis = this;

		// Convert headers to v2 format
		var headers = [];
		if (step.headers) {
			for (var key in step.headers) {
				if (step.headers.hasOwnProperty(key)) {
					headers.push({
						key: key,
						value: step.headers[key],
						type: 'text'
					});
				}
			}
		}

		// Parse original URL first, then replace domains
		var originalUrl = step.url || '';
		var urlParts = originalUrl ? originalUrl.split('/') : [];
		var host = [];
		var path = [];
		
		// Parse the original URL structure
		if (urlParts.length > 2 && urlParts[2]) {
			host = urlParts[2].split('.');
			path = urlParts.slice(3);
		}
		
		// Now replace domains with environment variables in the raw URL
		var processedUrl = oldThis.replaceDomainsWithVariables(originalUrl);
		
		// If we replaced the domain with a variable, update the host to reflect that
		if (processedUrl !== originalUrl && processedUrl.includes('{{')) {
			// Extract the variable part
			var processedParts = processedUrl.split('/');
			if (processedParts.length > 0 && processedParts[0].includes('{{')) {
				host = [processedParts[0]]; // Use the variable as host
			}
		}

		var request = {
			name: step.note || processedUrl || 'Unnamed Request',
			request: {
				method: step.method || 'GET',
				header: headers,
				url: {
					raw: processedUrl,
					host: host,
					path: path
				}
			},
			response: [],
			event: []
		};

		// Handle body data
		oldThis.handleDataV2(request, step);

		// Handle auth
		oldThis.handleAuthV2(request, step);

		// Handle scripts and tests
		oldThis.handleScriptsV2(request, step);

		return request;
	},

	convert: function (runscopeJson, collectionName) {
		var oldThis = this;
		var runscopeTests = this.validateRunscope(runscopeJson);
		var collection = this.initCollection(runscopeTests, collectionName);

		// Process each test in the collection
		_.each(runscopeTests, function(test, testIndex) {
			// Validate individual test
			if (!test.hasOwnProperty('name') || !test.hasOwnProperty('trigger_url')) {
				console.warn(`Skipping invalid test at index ${testIndex}: missing name or trigger_url`);
				return;
			}

			console.log(`Processing test: ${test.name} (${test.steps ? test.steps.length : 0} steps)`);

			// Add a folder for each test if we have multiple tests
			var testFolder = null;
			if (runscopeTests.length > 1) {
				testFolder = {
					name: test.name,
					description: test.description || '',
					item: []
				};
				collection.item.push(testFolder);
			}

			// Process each step in the test
			_.each(test.steps, function(step) {
				var request = oldThis.getRequestFromStep(step);
				oldThis.addRequest(collection, request, testFolder);
			});
		});

		return collection;
	}
};

module.exports = runscopeConverterV1;