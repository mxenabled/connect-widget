/**
 * i18n
 *
 * To use run:
 *   `npm run i18n [command]`
 *   `npm run i18n -- --help`
 *
 * Commands:
 *   extract - extract new strings from code in current branch
 *   clean - Removes unused strings from the po files
 *   po2json - Convert translated .po files to .json
 */

/* eslint no-console: "off" */

const LANG_FILE_DIRECTORY = 'src/const/language'

import colors from 'colors/safe.js'
import { Command } from 'commander'

const logInfo = (text) => console.log(colors.green(text))
const logCommand = (text) => console.log(colors.cyan(text))
const logError = (text) => console.log(colors.red(text))
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const program = new Command()

program.usage('npm run i18n <command>')

program
  .command('extract')
  .description('Extract new strings and update file references from code in current branch')
  .action(() => i18nExtract())

program
  .command('po2json')
  .description('Convert translated .po files to .json')
  .action(() => po2json())

program
  .command('clean')
  .description('Remove unused translations')
  .action(() => clean())

const currentBranch = getCurrentBranch()
const supportedLocales = ['frCa', 'es']

/**
 * This command will do a few useful operations
 * 1. It will extract new messages into the translation files
 * 2. It will update all message location information
 */
const i18nExtract = () => {
  logInfo(`Extracting text in ${colors.bold(currentBranch)}...\n`)

  try {
    supportedLocales.map((locale) => {
      // Extract new messages, and clear old location information
      logInfo(
        colors.magenta.bold(`Extracting new messages, and clearing location info from ${locale}:`),
      )
      execRemoveLocations(locale)

      // Add up-to-date location information
      logInfo(colors.magenta.bold(`Inserting current location info for ${locale}:`))
      execUpdateLocations(locale)
    })
  } catch (err) {
    logError(`${colors.bold('ERROR:')} Error extracting strings`)
    logInfo(`Make sure gettext is installed:\n
        - https://ftp.gnu.org/pub/gnu/gettext/gettext-0.20.2.tar.gz`)
  }

  logDone(
    `Extracted strings were updated at:\n${supportedLocales
      .map((locale) => `${LANG_FILE_DIRECTORY}/${locale}.po\n`)
      .join('')}\nTemporarily machine translate strings at https://translate.google.com\n`,
  )
  logInfo('**Always ensure all strings were extracted, updated, and/or removed**')
}

const po2json = () => {
  try {
    logInfo(`Converting ${colors.bold('.po')} files to ${colors.bold('.json')}...\n`)
    supportedLocales.map((locale) => {
      logInfo(colors.magenta.bold(`CONVERTING and FORMATTING ${locale}:`))
      execPrint(
        `./node_modules/.bin/po2json-gettextjs ${LANG_FILE_DIRECTORY}/${locale}.po ${LANG_FILE_DIRECTORY}/${locale}.json`,
      )
      execPrint(`npx prettier --write ${LANG_FILE_DIRECTORY}/${locale}.json`)
    })

    logDone(
      `Converted .json is available at:\n${supportedLocales
        .map((locale) => `    - ${LANG_FILE_DIRECTORY}/${locale}.json\n`)
        .join('')}`,
    )
  } catch (err) {
    logError(`${colors.bold('ERROR:')} Error converting .po to .json`)
  }
}

// Helper functions
function getCurrentBranch() {
  const match = execSync('git branch')
    .toString()
    .match(/\* (.+)/)

  return match && match[1]
}

function logDone(postMsg) {
  logInfo(`\n${colors.bold('Finished.')}`)
  logInfo(postMsg)
}

function execPrint(command) {
  logCommand(`Running: ${colors.bold(command)}\n`)
  execSync(command, { stdio: 'inherit' })
}

/**
 *
 * @param {'full'|'file'|'never'} addLocation
 * 'full' adds file:line reference,
 * 'file' adds file references,
 * 'never' removes location references completely,
 * @param {string} locale
 * @returns xgettext commandString
 */
function getCommand(addLocation, locale, outputDirectory = LANG_FILE_DIRECTORY) {
  return `find src -type f \\( -name "*.js" -o -name "*.tsx" -o -name "*.ts" \\) \
  ! \\( -name "Intl.js" -o -name "Intl-test.tsx" -o -name "Personalization.js" \\)  \
  | xgettext -L lua -f - \
       --add-comments='TR' \
       --add-location='${addLocation}' \
       --copyright-holder='MX Technologies Inc.' \
       --join-existing \
       --omit-header \
       --keyword='__:1'  \
       --keyword='_n:1,2' \
       --keyword='_p:1c,2' \
       --keyword='_np:1c,2,3' \
       --force-po \
       --output=${outputDirectory}/${locale}.po \
       --from-code=utf-8`
}

/**
 *
 * @description This will remove location comments from translations
 * We do this to prevent having lingering location information.
 * @param {string} locale
 * @returns commandString
 */
function execRemoveLocations(locale) {
  execPrint(getCommand('never', locale))
}

/**
 *
 * @description This adds back in the most recent location information
 * @param {string} locale
 * @returns commandString
 */
function execUpdateLocations(locale) {
  /**
   * 'full' for file and lines,
   * 'file' for excluding file numbers
   */
  execPrint(getCommand('file', locale))
}

/**
 * @description This works through all supported language files
 * and removes any orphaned translation strings.
 */
function clean() {
  supportedLocales.forEach((locale) => {
    const file = `${LANG_FILE_DIRECTORY}/${locale}.po`
    console.log('file: ', file)

    // const fs = require('node:fs'

    let cleanData = ''
    try {
      const data = fs.readFileSync(file, 'utf8')
      console.log('Raw file length:', data.length)

      cleanData = data.replace(/\n\n[^#].*([^#])*/g, '\n\n')
      console.log('Cleaned length:', data.length)
    } catch (err) {
      console.error(err)
    }

    try {
      console.log('Writing length:', cleanData.length)
      fs.writeFileSync(file, cleanData)
      // file written successfully
    } catch (err) {
      console.error(err)
    }
  })
}

/**
 * MAIN LOGIC
 */
const noArgsProvided = !process.argv.slice(2).length

if (noArgsProvided) program.outputHelp(colors.red)

program.parse(process.argv)
