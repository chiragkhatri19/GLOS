import { Command } from 'commander'
import ora from 'ora'
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import { translateWithContext } from '@glos/core'

export function translateCommand(): Command {
  return new Command('translate')
    .description('Translate with UI context injected into every key')
    .option('--context <file>', 'Context file path', './glos.context.json')
    .option('--messages <dir>', 'Messages directory', './messages')
    .requiredOption('--locales <locales>', 'Target locales e.g. ja,de,ar')
    .action(async (opts) => {
      const apiKey = process.env.LINGODOTDEV_API_KEY
      if (!apiKey) { console.error(chalk.red('❌ LINGODOTDEV_API_KEY missing')); process.exit(1) }

      const locales = opts.locales.split(',').map((l: string) => l.trim())

      // Save before snapshots for quality comparison
      for (const locale of locales) {
        const existing = path.join(opts.messages, `${locale}.json`)
        if (fs.existsSync(existing))
          fs.copyFileSync(existing, path.join(opts.messages, `${locale}.before.json`))
      }

      console.log(chalk.bold('\n🌍 glos translate\n'))
      const spinner = ora(`Translating to: ${locales.join(', ')}...`).start()
      await translateWithContext({ contextFile: opts.context, locales, messagesDir: opts.messages, apiKey })
      spinner.succeed('Done')
      console.log(chalk.dim('Next: glos report\n'))
    })
}
