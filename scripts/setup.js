#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function checkNodeVersion() {
  log.title('Checking Node.js version...');
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (major < 18) {
    log.error(`Node.js 18+ required. You have ${nodeVersion}`);
    process.exit(1);
  }
  
  log.success(`Node.js ${nodeVersion} detected`);
}

async function setupEnvironment() {
  log.title('Setting up environment variables...');
  
  const envExample = path.join(process.cwd(), '.env.example');
  const envLocal = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envLocal)) {
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envLocal);
      log.success('Created .env.local from .env.example');
      log.warn('Please update .env.local with your actual values');
    } else {
      log.error('.env.example not found');
      return false;
    }
  } else {
    log.success('.env.local already exists');
  }
  
  // Check for critical environment variables
  const envContent = fs.readFileSync(envLocal, 'utf8');
  const missingVars = [];
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'DIFY_API_KEY',
  ];
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    if (!match || match[1].includes('your_') || match[1] === '""') {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    log.warn('Missing or placeholder values for:');
    missingVars.forEach(v => console.log(`  - ${v}`));
    console.log('\n📝 Next steps:');
    console.log('1. Create a Firebase project at https://console.firebase.google.com');
    console.log('2. Get your Firebase config from Project Settings');
    console.log('3. Generate a service account key from Project Settings > Service Accounts');
    console.log('4. Get your Dify API key from https://dify.ai');
    console.log('5. Update .env.local with these values\n');
    return false;
  }
  
  return true;
}

async function installDependencies() {
  log.title('Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    log.success('Dependencies installed');
  } catch (error) {
    log.error('Failed to install dependencies');
    process.exit(1);
  }
}

async function setupHusky() {
  log.title('Setting up Git hooks...');
  
  try {
    execSync('npx husky install', { stdio: 'pipe' });
    log.success('Husky Git hooks installed');
  } catch (error) {
    log.warn('Git hooks setup skipped (not a git repository or Husky error)');
  }
}

async function checkFirebaseCLI() {
  log.title('Checking Firebase CLI...');
  
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    log.success('Firebase CLI is installed');
    
    // Check if firebase.json exists
    if (!fs.existsSync('firebase.json')) {
      log.info('Run `firebase init` to configure your Firebase project');
    }
  } catch (error) {
    log.warn('Firebase CLI not found');
    console.log('\nTo install Firebase CLI globally:');
    console.log('  npm install -g firebase-tools\n');
    
    const install = await question('Install Firebase CLI now? (y/N): ');
    if (install.toLowerCase() === 'y') {
      try {
        execSync('npm install -g firebase-tools', { stdio: 'inherit' });
        log.success('Firebase CLI installed');
      } catch (e) {
        log.error('Failed to install Firebase CLI. Try: sudo npm install -g firebase-tools');
      }
    }
  }
}

async function runChecks() {
  log.title('Running setup verification...');
  
  const checks = [
    { name: 'Node.js 18+', check: () => parseInt(process.version.split('.')[0].substring(1)) >= 18 },
    { name: '.env.local exists', check: () => fs.existsSync('.env.local') },
    { name: 'node_modules exists', check: () => fs.existsSync('node_modules') },
    { name: '.husky directory exists', check: () => fs.existsSync('.husky') },
  ];
  
  let allPassed = true;
  checks.forEach(({ name, check }) => {
    try {
      if (check()) {
        log.success(name);
      } else {
        log.error(name);
        allPassed = false;
      }
    } catch (e) {
      log.error(name);
      allPassed = false;
    }
  });
  
  return allPassed;
}

async function main() {
  console.log(`
${colors.bright}🚀 Dify Firebase Boilerplate Setup${colors.reset}
===================================
`);

  const isCheckOnly = process.argv.includes('--check');
  
  if (isCheckOnly) {
    const passed = await runChecks();
    rl.close();
    process.exit(passed ? 0 : 1);
  }
  
  // Run setup steps
  await checkNodeVersion();
  await installDependencies();
  const envReady = await setupEnvironment();
  await setupHusky();
  await checkFirebaseCLI();
  
  console.log('\n' + '='.repeat(40));
  
  if (envReady) {
    log.success('Setup complete! 🎉');
    console.log('\nRun the development server:');
    console.log(`  ${colors.cyan}npm run dev${colors.reset}`);
  } else {
    log.warn('Setup partially complete');
    console.log('\n⚠️  Please configure your environment variables in .env.local');
    console.log('Then run:');
    console.log(`  ${colors.cyan}npm run dev${colors.reset}`);
  }
  
  console.log('\nFor more info, check the README.md\n');
  
  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});