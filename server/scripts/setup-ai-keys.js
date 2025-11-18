#!/usr/bin/env node

/**
 * Setup script for AI API keys
 * This script helps configure API keys for production deployment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_FILE_PATH = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

async function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAIKeys() {
  console.log('🤖 AquaBeacon AI Configuration Setup');
  console.log('=====================================\n');
  
  console.log('This script will help you configure AI providers for production.');
  console.log('You need at least one API key for AI functionality to work.\n');
  
  // Check if .env file exists
  let envContent = '';
  if (fs.existsSync(ENV_FILE_PATH)) {
    envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    console.log('✅ Found existing .env file\n');
  } else if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    envContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
    console.log('📋 Using .env.example as template\n');
  }
  
  const providers = {
    GROQ_API_KEY: {
      name: 'Groq',
      description: 'Fast and reliable (Recommended for production)',
      signup: 'https://console.groq.com/',
      priority: 1
    },
    OPENAI_API_KEY: {
      name: 'OpenAI',
      description: 'High quality responses',
      signup: 'https://platform.openai.com/api-keys',
      priority: 2
    },
    HUGGINGFACE_API_KEY: {
      name: 'Hugging Face',
      description: 'Free tier available',
      signup: 'https://huggingface.co/settings/tokens',
      priority: 3
    }
  };
  
  const configuredKeys = {};
  
  for (const [keyName, provider] of Object.entries(providers)) {
    console.log(`\n🔑 ${provider.name} Configuration`);
    console.log(`   ${provider.description}`);
    console.log(`   Sign up: ${provider.signup}`);
    
    const hasKey = await question(`Do you have a ${provider.name} API key? (y/n): `);
    
    if (hasKey.toLowerCase() === 'y' || hasKey.toLowerCase() === 'yes') {
      const apiKey = await question(`Enter your ${provider.name} API key: `);
      if (apiKey && apiKey.trim()) {
        configuredKeys[keyName] = apiKey.trim();
        console.log(`✅ ${provider.name} API key configured`);
      }
    } else {
      console.log(`⏭️  Skipping ${provider.name}`);
    }
  }
  
  if (Object.keys(configuredKeys).length === 0) {
    console.log('\n❌ No API keys configured!');
    console.log('You need at least one API key for AI functionality to work.');
    console.log('Please run this script again after obtaining API keys.');
    rl.close();
    return;
  }
  
  // Update .env file
  let updatedEnvContent = envContent;
  
  // Replace or add API keys
  for (const [keyName, keyValue] of Object.entries(configuredKeys)) {
    const regex = new RegExp(`^${keyName}=.*$`, 'm');
    const newLine = `${keyName}=${keyValue}`;
    
    if (regex.test(updatedEnvContent)) {
      updatedEnvContent = updatedEnvContent.replace(regex, newLine);
    } else {
      updatedEnvContent += `\n${newLine}`;
    }
  }
  
  // Write to .env file
  fs.writeFileSync(ENV_FILE_PATH, updatedEnvContent);
  
  console.log('\n✅ Configuration Complete!');
  console.log(`📁 Configuration saved to: ${ENV_FILE_PATH}`);
  console.log(`🔑 Configured providers: ${Object.keys(configuredKeys).map(k => providers[k].name).join(', ')}`);
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your server: npm run dev');
  console.log('2. Test AI functionality: GET /api/ai/health');
  console.log('3. Deploy to production with these environment variables');
  
  console.log('\n⚠️  Security Note:');
  console.log('Never commit your .env file to version control!');
  console.log('Use environment variables or secure key management in production.');
  
  rl.close();
}

// Handle errors gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled');
  rl.close();
  process.exit(0);
});

// Run setup
setupAIKeys().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});