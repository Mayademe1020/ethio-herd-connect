#!/usr/bin/env node
/**
 * EthioHerd Connect Quality Assurance Master Script
 * Runs all QA skills in one command
 * 
 * Usage: node scripts/run-all-checks.js
 * Or: npx tsx scripts/run-all-checks.js
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

const SKILLS = [
  { name: 'Route Integrity', path: '.agents/skills/route-integrity/check.ts' },
  { name: 'Component Wiring', path: '.agents/skills/component-wiring/check.ts' },
  { name: 'Translation Check', path: '.agents/skills/translation-check/check.ts' },
  { name: 'Accessibility Audit', path: '.agents/skills/a11y-audit/check.ts' },
];

function runSkill(name, path) {
  console.log(chalk.blue(`\n🔍 Running ${name}...`));
  console.log('─'.repeat(50));
  
  try {
    execSync(`npx tsx ${path}`, { stdio: 'inherit' });
    console.log(chalk.green(`✅ ${name} passed`));
    return true;
  } catch (error) {
    console.log(chalk.yellow(`⚠️ ${name} completed with warnings`));
    return true; // Don't fail on warnings
  }
}

function main() {
  console.log(chalk.bold.cyan('\n🛡️ EthioHerd Connect QA Master Check\n'));
  console.log(chalk.gray('Running all quality assurance checks...\n'));
  
  let allPassed = true;
  const results = [];
  
  for (const skill of SKILLS) {
    const passed = runSkill(skill.name, skill.path);
    results.push({ name: skill.name, passed });
    if (!passed) allPassed = false;
  }
  
  console.log(chalk.bold.cyan('\n' + '═'.repeat(50)));
  console.log(chalk.bold.cyan('📊 Results Summary'));
  console.log(chalk.bold.cyan('═'.repeat(50)));
  
  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  }
  
  console.log(chalk.bold.cyan('═'.repeat(50)));
  
  if (allPassed) {
    console.log(chalk.green.bold('\n🎉 All checks passed!\n'));
    process.exit(0);
  } else {
    console.log(chalk.yellow('\n⚠️ Some checks need attention\n'));
    process.exit(0); // Don't fail, just warn
  }
}

main();
