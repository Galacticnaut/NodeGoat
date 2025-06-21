#!/usr/bin/env node

const needle = require('needle');

console.log('Testing challenge endpoints...\n');

// Test 1: Check our local endpoint
console.log('1. Testing local endpoint:');
needle.get('http://localhost:4000/.well-known/xb-challenge/b4df4853f0e1d21112dd', (error, response) => {
    if (error) {
        console.log('   Error:', error.message);
    } else {
        console.log('   Status:', response.statusCode);
        console.log('   Content:', response.body);
    }
    console.log();
    
    // Test 2: Try to access the remote endpoint
    console.log('2. Testing remote endpoint:');
    needle.get('https://nodegoat.victoriousbay-31bbfba9.eastus.azurecontainerapps.io/.well-known/xb-challenge/b4df4853f0e1d21112dd', (error2, response2) => {
        if (error2) {
            console.log('   Error:', error2.message);
        } else {
            console.log('   Status:', response2.statusCode);
            console.log('   Content:', response2.body);
        }
        console.log();
        
        // Test 3: Try uploading to remote endpoint
        console.log('3. Testing upload to remote endpoint:');
        const challengeContent = '8f9b4ae678386e546c8c';
        needle.post('https://nodegoat.victoriousbay-31bbfba9.eastus.azurecontainerapps.io/.well-known/xb-challenge/b4df4853f0e1d21112dd', challengeContent, {
            content_type: 'text/plain'
        }, (error3, response3) => {
            if (error3) {
                console.log('   Error:', error3.message);
            } else {
                console.log('   Status:', response3.statusCode);
                console.log('   Response:', response3.body);
            }
            
            // Test 4: Try PUT request
            console.log('\n4. Testing PUT to remote endpoint:');
            needle.put('https://nodegoat.victoriousbay-31bbfba9.eastus.azurecontainerapps.io/.well-known/xb-challenge/b4df4853f0e1d21112dd', challengeContent, {
                content_type: 'text/plain'
            }, (error4, response4) => {
                if (error4) {
                    console.log('   Error:', error4.message);
                } else {
                    console.log('   Status:', response4.statusCode);
                    console.log('   Response:', response4.body);
                }
                console.log('\nTest completed.');
            });
        });
    });
});
