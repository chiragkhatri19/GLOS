import { Command } from 'commander'
import chalk from 'chalk'
import { compareTranslations } from '@glos/core'

export function reportCommand(): Command {
  return new Command('report')
    .description('Before/after translation quality report')
    .option('--messages <dir>', 'Messages directory', './messages')
    .option('--locales <locales>', 'Locales to compare', 'ja,de,ar')
    .option('--json', 'Output as JSON (for CI use)')
    .action((opts) => {
      const locales = opts.locales.split(',').map((l: string) => l.trim())
      const scores = compareTranslations(opts.messages, locales)

      if (opts.json) {
        const byLocale: Record<string, number> = {}
        for (const locale of locales) {
          const ls = scores.filter((s: any) => s.locale === locale)
          if (ls.length > 0) {
            byLocale[locale] = Math.round(
              ls.reduce((sum: number, s: any) => sum + s.improvement_percent, 0) / ls.length
            )
          }
        }
        const avg = scores.length > 0
          ? Math.round(scores.reduce((s: number, r: any) => s + r.improvement_percent, 0) / scores.length)
          : 0
        console.log(JSON.stringify({ scores, average_improvement: avg, by_locale: byLocale }))
        return
      }

      // Human-readable output
      console.log(chalk.bold('\n📊 glos report\n'))
      if (!scores.length) {
        console.log(chalk.dim('No before/after data. Run glos translate first.'))
        return
      }
      scores.slice(0, 15).forEach((s: any) => {
        console.log(
          chalk.white(s.key.padEnd(20)) +
          chalk.dim(s.locale.padEnd(6)) +
          chalk.red(s.before.substring(0, 20).padEnd(22)) +
          chalk.green(s.after.substring(0, 22).padEnd(24)) +
          chalk.bold(chalk.green(`+${s.improvement_percent}%`))
        )
      })
      const avg = scores.reduce((sum: number, s: any) => sum + s.improvement_percent, 0) / scores.length
      console.log(chalk.bold(`\nAverage: +${Math.round(avg)}%\n`))
    })
}
