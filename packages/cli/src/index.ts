#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('glos')
  .description('Context-aware i18n scanning for your app')
  .version('1.0.0');

program
  .command('capture')
  .description('Scan a running app and build a context map')
  .requiredOption('--url <url>', 'URL of your running app', 'http://localhost:3000')
  .option('--out <path>', 'Output path for context file', './glos.context.json')
  .option('--dashboard', 'Open dashboard after scan', false)
  .action(async (options) => {
    const ora = (await import('ora')).default;
    
    console.log(chalk.bold('\n  glos.io — context-aware i18n\n'));
    
    const spinner = ora('Discovering routes...').start();
    
    try {
      // Dynamic import - internal core module
      const corePackage = await import('./core/index');
      const captureApp = corePackage.captureApp;
      
      const discoveredRoutes: string[] = [];
      
      await captureApp({ 
        url: options.url,
        onProgress: (event: any) => {
          if (event.type === 'screenshot') {
            spinner.text = chalk.dim(`Captured ${event.route}`);
          }
          if (event.type === 'vision_done') {
            spinner.text = chalk.dim(`Analyzed ${event.route} — ${event.elements} elements`);
          }
        }
      });

      spinner.succeed(chalk.green('Scan complete'));
      
      console.log(chalk.dim('\n  Results:'));
      console.log(chalk.white(`  Routes scanned : ${chalk.bold(chalk.green(String(discoveredRoutes.length || '—')))}`));
      console.log(chalk.white(`  Context file   : ${chalk.bold(options.out)}`));
      console.log('');
      console.log(chalk.dim('  Open your dashboard:'));
      console.log(chalk.bold('  http://localhost:3002\n'));

    } catch (err: any) {
      spinner.fail(chalk.red('Scan failed'));
      console.error(chalk.dim(err.message));
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Print a summary of the last scan')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const fs = await import('fs');
    const path = await import('path');
    
    const candidates = [
      path.join(process.cwd(), 'glos.context.json'),
      path.join(process.cwd(), 'apps/dashboard/glos.context.json'),
    ];
    
    const contextPath = candidates.find(p => fs.existsSync(p));
    if (!contextPath) {
      console.error(chalk.red('No context file found. Run: glos capture --url <url>'));
      process.exit(1);
    }
    
    const raw = JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
    const keys = raw.keys ? Object.keys(raw.keys) : [];
    
    if (options.json) {
      console.log(JSON.stringify({ 
        routes: raw.routes_analyzed,
        keys: keys.length,
        generated: raw.generated 
      }, null, 2));
      return;
    }
    
    console.log(chalk.bold('\n  glos report\n'));
    console.log(`  App         : ${chalk.green(raw.app_url)}`);
    console.log(`  Scanned     : ${chalk.dim(new Date(raw.generated).toLocaleString())}`);
    console.log(`  Routes      : ${chalk.bold(raw.routes_analyzed)}`);
    console.log(`  Keys mapped : ${chalk.bold(keys.length)}`);
    console.log('');
    
    keys.slice(0, 10).forEach(key => {
      const data = raw.keys[key];
      console.log(`  ${chalk.green('✓')} ${chalk.bold(key)} ${chalk.dim('—')} ${chalk.dim(data.value)}`);
    });
    
    if (keys.length > 10) {
      console.log(chalk.dim(`  ... and ${keys.length - 10} more keys\n`));
    }
  });

program.parse(process.argv);
