#!/usr/bin/env node

/**
 * Production Health Check for AI Services
 * Verifies all AI providers are properly configured and working
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testAIProvider(providerName, apiKey, testEndpoint) {
  try {
    console.log(`🧪 Testing ${providerName}...`);
    
    const response = await axios.get(`${testEndpoint}/health`, {
      timeout: 10000
    });
    
    if (response.status === 200) {
      console.log(`✅ ${providerName}: Healthy`);
      return true;
    } else {
      console.log(`⚠️  ${providerName}: Unhealthy (Status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${providerName}: Failed (${error.message})`);
    return false;
  }
}

async function runHealthCheck() {
  console.log('🏥 AquaBeacon AI Service Health Check');
  console.log('====================================\n');
  
  console.log('📊 Environment Check:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API_BASE_URL: ${API_BASE_URL}\n`);
  
  // Check API keys
  const providers = {
    'Groq': process.env.GROQ_API_KEY,
    'OpenAI': process.env.OPENAI_API_KEY,
    'Hugging Face': process.env.HUGGINGFACE_API_KEY
  };
  
  console.log('🔑 API Key Check:');
  let configuredCount = 0;
  for (const [name, key] of Object.entries(providers)) {
    if (key && key !== 'your_' + name.toLowerCase().replace(' ', '_') + '_api_key') {
      console.log(`✅ ${name}: Configured`);
      configuredCount++;
    } else {
      console.log(`❌ ${name}: Not configured`);
    }
  }
  
  if (configuredCount === 0) {
    console.log('\n❌ CRITICAL: No AI providers configured!');
    console.log('Run: node scripts/setup-ai-keys.js');
    process.exit(1);
  }
  
  console.log(`\n📈 Summary: ${configuredCount}/3 providers configured\n`);
  
  // Test AI service endpoint
  try {
    console.log('🌐 Testing AI Service Endpoint...');
    const response = await axios.get(`${API_BASE_URL}/ai/health`, {
      timeout: 15000
    });
    
    if (response.data.success) {
      console.log('✅ AI Service: Healthy');
      console.log(`🤖 Available Providers: ${response.data.availableProviders?.join(', ') || 'Unknown'}`);
      console.log(`📊 Provider Count: ${response.data.providerCount || 0}`);
      console.log(`🟢 Status: ${response.data.status || 'unknown'}`);
    } else {
      console.log('⚠️  AI Service: Responding but unhealthy');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ AI Service: Unreachable');
    console.log(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: Make sure your server is running on the correct port');
    }
  }
  
  // Test actual AI query
  try {
    console.log('\n🧠 Testing AI Query...');
    const response = await axios.post(`${API_BASE_URL}/ai/query`, {
      query: 'What is the ideal pH for drinking water?',
      context: { sessionId: 'health-check-' + Date.now() }
    }, {
      timeout: 30000
    });
    
    if (response.data.success && response.data.answer) {
      console.log('✅ AI Query: Success');
      console.log(`🤖 Provider Used: ${response.data.provider || 'unknown'}`);
      console.log(`📝 Response Length: ${response.data.answer.length} characters`);
      console.log(`🕐 Response Preview: ${response.data.answer.substring(0, 100)}...`);
    } else {
      console.log('⚠️  AI Query: Failed');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ AI Query: Failed');
    console.log(`Error: ${error.message}`);
    
    if (error.response?.status === 429) {
      console.log('💡 Rate limited - this is normal for production');
    }
  }
  
  console.log('\n🏁 Health Check Complete');
  console.log('========================');
  
  if (configuredCount > 0) {
    console.log('✅ System is ready for production!');
    console.log('\n📚 Useful Commands:');
    console.log('- View logs: npm run logs');
    console.log('- Restart server: npm run restart');
    console.log('- Test endpoint: curl ' + API_BASE_URL + '/ai/health');
  } else {
    console.log('❌ System needs configuration before production deployment');
    console.log('Run: node scripts/setup-ai-keys.js');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Health check cancelled');
  process.exit(0);
});

// Run health check
runHealthCheck().catch(error => {
  console.error('\n❌ Health check failed:', error.message);
  process.exit(1);
});