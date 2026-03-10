import { Command } from 'commander'
import ora from 'ora'
import chalk from 'chalk'
import * as fs from 'fs'
import { captureApp, analyzeScreenshot, buildContextFile } from '@glos/core'

export function captureCommand(): Command {
  return new Command('capture')
    .description('Screenshot your app and extract UI context')
    .requiredOption('--url <url>', 'URL of your running app')
    .option('--routes <routes>', 'Comma-separated routes')
    .option('--messages <dir>', 'Messages directory', './messages')
    .option('--output <file>', 'Context output path', './glos.context.json')
    .action(async (opts) => {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) { console.error(chalk.red('❌ GEMINI_API_KEY missing')); process.exit(1) }

      console.log(chalk.bold('\n👁  glos capture\n'))
      const routes = opts.routes ? opts.routes.split(',').map((r: string) => r.trim()) : undefined

      const captureSpinner = ora('Screenshotting routes...').start()
      const screenshots = await captureApp({ url: opts.url, routes })
      captureSpinner.succeed(`Captured ${screenshots.length} routes`)

      const visionResults = []
      for (const s of screenshots) {
        const spin = ora(`  Analyzing ${s.route}...`).start()
        const result = await analyzeScreenshot(s.screenshotPath, s.route, apiKey)
        spin.succeed(`  ${s.route} → ${result.elements.length} elements`)
        visionResults.push(result)
      }

      let messages: Record<string, string> = {}
      const enPath = `${opts.messages}/en.json`
      if (fs.existsSync(enPath)) messages = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

      const contextFile = buildContextFile(visionResults, opts.url, messages)
      fs.writeFileSync(opts.output, JSON.stringify(contextFile, null, 2))

      console.log(chalk.green(`\n✅ ${opts.output} — ${contextFile.routes_analyzed} routes · ${contextFile.keys_mapped} keys`))
      console.log(chalk.dim('Next: glos translate --locales ja,de,ar\n'))
    })
}
