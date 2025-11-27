import fs from 'fs/promises'
import { URL } from "url"
import StyleDictionary from "style-dictionary"
import chalk from "chalk"
import generateStyleDictionaryConfig from "./style-dictionary/sd.config.js"

const TOKENS_PATH = "tokens/"
const TOKENS_DIR = new URL(TOKENS_PATH, import.meta.url)

async function buildMiracleDesignTokens() {
  console.log(chalk.blue("\n✨ Building Miracle Design Tokens...\n"))
  const files = await fs.readdir(TOKENS_DIR)
  const themes = files
    .filter(file => file !== 'global.json')
    .filter(file => file.startsWith('alias-'))
    .map(file => file.replace('alias-', '').replace('.json', ''))
  for (const theme of themes) {
    const source = [`${TOKENS_PATH}global.json`, `${TOKENS_PATH}alias-${theme}.json`]
    const SD_CONFIG = generateStyleDictionaryConfig(source, theme)
    const SD = new StyleDictionary(SD_CONFIG)
    await SD.buildAllPlatforms()
    console.log(chalk.green(`✅  Built Miracle Design Tokens Global & Alias ${theme}`))
  }
  console.log(chalk.blue("\n🎉 Finished Building Design Tokens!\n"))
}

buildMiracleDesignTokens().catch(error => {
  console.error(chalk.red("❌ Error Building Design Tokens:"), error)
  process.exit(1)
})
