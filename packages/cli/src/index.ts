#!/usr/bin/env node
import 'dotenv/config'
import { Command } from 'commander'
import { captureCommand } from './commands/capture'
import { translateCommand } from './commands/translate'
import { reportCommand } from './commands/report'

const program = new Command()
program.name('glos').description('Give your translations context.').version('1.0.0')
program.addCommand(captureCommand())
program.addCommand(translateCommand())
program.addCommand(reportCommand())
program.parse()
