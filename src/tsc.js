/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import lodash from 'lodash'

import {
  rmSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'node:fs'
import { join, dirname, relative, basename } from 'node:path'

/**
 * Directories that are never worth walking while looking for nested
 * TypeScript projects.
 */
const IGNORED_DIRS = ['node_modules', 'build', 'dist', 'coverage', 'public']

/**
 * How deep the search for nested TypeScript projects goes. Applications
 * keep them one or two levels down, like "resources" or "src/resources".
 */
const MAX_DEPTH = 2

/**
 * Find the directories that declare their own "tsconfig.json".
 *
 * A directory with its own TypeScript project is compiled by whoever owns
 * it, usually the frontend bundler, and type checking it with the settings
 * of the server only produces errors that belong to another project.
 *
 * Excluding them is safe because "exclude" filters the root file list and
 * never the files reached through an import: whatever the server actually
 * imports from there is still compiled and emitted.
 *
 * @param {string} root
 * @param {number} depth
 * @return {string[]}
 */
function findNestedProjects(root, depth = 0) {
  if (depth >= MAX_DEPTH) {
    return []
  }

  const projects = []

  let entries = []

  try {
    entries = readdirSync(root, { withFileTypes: true })
  } catch {
    return projects
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue
    }

    if (IGNORED_DIRS.includes(entry.name)) {
      continue
    }

    const path = join(root, entry.name)

    if (existsSync(join(path, 'tsconfig.json'))) {
      projects.push(path)
      continue
    }

    projects.push(...findNestedProjects(path, depth + 1))
  }

  return projects
}

/**
 * Read the raw content of a tsconfig file, tolerating the comments that
 * TypeScript allows inside them.
 *
 * @param {string} path
 * @return {any}
 */
function readTsConfig(path) {
  try {
    const content = readFileSync(path, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')

    return JSON.parse(content)
  } catch {
    return {}
  }
}

/**
 * Build the list of paths that must not be type checked.
 *
 * TypeScript replaces the "exclude" of the config it extends instead of
 * merging it, so the one declared by the application is dropped by the
 * config used to build. Both are joined here, together with the nested
 * TypeScript projects found inside the application.
 *
 * @param {string} tsConfigPath
 * @return {string[]}
 */
function getExcludes(tsConfigPath) {
  const cwd = process.cwd()
  const configDir = dirname(tsConfigPath)
  const toConfigDir = path => relative(configDir, path).replace(/\\/g, '/')

  const config = readTsConfig(tsConfigPath)
  const project = readTsConfig(join(cwd, 'tsconfig.json'))

  return [
    ...new Set([
      ...(config.exclude || []),
      ...(project.exclude || []).map(path => toConfigDir(join(cwd, path))),
      ...findNestedProjects(cwd).map(toConfigDir)
    ])
  ]
}

/**
 * Run tsc compiler "programmatically".
 *
 * @param {string} tsConfigPath
 * @return {Promise<void>}
 */
export async function tsc(tsConfigPath) {
  const originalArgv = lodash.cloneDeep(process.argv)
  const originalExit = process.exit

  /**
   * The excludes cannot be merged declaratively, so the compilation runs
   * against a temporary config that extends the given one carrying the
   * complete list.
   */
  const configPath = join(
    dirname(tsConfigPath),
    `.${basename(tsConfigPath, '.json')}.tmp.json`
  )

  writeFileSync(
    configPath,
    JSON.stringify(
      {
        extends: `./${basename(tsConfigPath)}`,
        exclude: getExcludes(tsConfigPath)
      },
      null,
      2
    )
  )

  let exitCode = 0

  /**
   * The tsc CLI ends by calling "process.exit()", which would take down
   * whatever is running the compilation. The code it asked for is captured
   * instead of being dropped, otherwise a failed compilation is reported
   * as a successful one.
   */
  process.exit = code => {
    exitCode = code || 0
  }

  process.argv = process.argv.slice(0, 2)
  process.argv.push('--project', configPath)

  try {
    await import('typescript/lib/tsc.js')
  } finally {
    process.argv = originalArgv
    process.exit = originalExit

    rmSync(configPath, { force: true })
  }

  if (exitCode) {
    throw new Error(
      `The tsc compiler has finished with errors using the "${tsConfigPath}" config file.`
    )
  }
}
