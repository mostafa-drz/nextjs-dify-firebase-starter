#!/usr/bin/env node

/**
 * Dify API Connection Test Script
 * Validates Dify API connectivity and configuration for CI/CD
 */

const https = require('https');

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

async function testDifyConnection() {
  console.log('🤖 Testing Dify API Connection...\n');

  if (!DIFY_API_KEY) {
    console.log('❌ DIFY_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Test basic API connectivity
    const response = await makeRequest('/chat-messages', 'POST', {
      inputs: {},
      query: 'Hello, this is a test message',
      response_mode: 'blocking',
      user: 'test-user'
    });

    if (response.status === 200) {
      console.log('✅ Dify API connection successful');
      console.log(`✅ API Key is valid`);
      console.log(`✅ Base URL: ${DIFY_BASE_URL}`);
      
      // Test response structure
      if (response.data && response.data.answer) {
        console.log('✅ API response structure is correct');
        console.log(`✅ Test response: ${response.data.answer.substring(0, 50)}...`);
      } else {
        console.log('⚠️  API response structure unexpected');
      }
      
      console.log('\n🎉 Dify API validation passed!');
      return true;
    } else {
      console.log(`❌ API request failed with status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Dify API connection failed: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('   Check if DIFY_BASE_URL is correct');
    } else if (error.response?.status === 401) {
      console.log('   Check if DIFY_API_KEY is valid');
    } else if (error.response?.status === 403) {
      console.log('   Check if API key has proper permissions');
    }
    
    return false;
  }
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, DIFY_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'dify-firebase-boilerplate/1.0.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the test
testDifyConnection()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
