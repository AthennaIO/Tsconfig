/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ts from 'typescript'
import Module from 'node:module'

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Extensions that need to be transpiled before Node.js can run them.
 */
const TS_EXTENSIONS = ['.ts', '.mts', '.tsx']

/**
 * Options that always win over the ones defined by the application, no
 * matter what is set in its "tsconfig.json" file.
 *
 * The hook always hands ESM back to Node.js, so the module kind cannot be
 * left to the application. And since the transpiled code never touches the
 * disk, source maps have to be inlined to be resolved by "--enable-source-maps".
 */
const FORCED_OPTIONS = {
  sourceMap: false,
  declaration: false,
  declarationMap: false,
  inlineSources: true,
  inlineSourceMap: true,
  module: ts.ModuleKind.ESNext
}

/**
 * Used when the application has no "tsconfig.json". Mirrors "tsconfig.base.json"
 * so a project without one behaves the same way it does today under "ts-node".
 */
const FALLBACK_OPTIONS = {
  strict: false,
  target: ts.ScriptTarget.ESNext,
  esModuleInterop: true,
  removeComments: false,
  resolveJsonModule: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  useDefineForClassFields: false,
  verbatimModuleSyntax: true
}

/**
 * Read the "compilerOptions" of the application "tsconfig.json".
 *
 * The transpiler needs to agree with the compiler that "node artisan build"
 * runs. Hardcoding the options here would let dev and build drift apart
 * for applications that customize them.
 */
function getCompilerOptions() {
  const path = ts.findConfigFile(process.cwd(), ts.sys.fileExists)

  if (!path) {
    return { ...FALLBACK_OPTIONS, ...FORCED_OPTIONS }
  }

  const { config, error } = ts.readConfigFile(path, ts.sys.readFile)

  if (error) {
    return { ...FALLBACK_OPTIONS, ...FORCED_OPTIONS }
  }

  /**
   * "readDirectory" is stubbed out because only the "compilerOptions" are
   * needed here. Letting it run would walk the entire application looking
   * for the files matched by "include" on every single boot.
   */
  const { options } = ts.parseJsonConfigFileContent(
    config,
    { ...ts.sys, readDirectory: () => [] },
    process.cwd()
  )

  return { ...options, ...FORCED_OPTIONS }
}

/**
 * "file:" URLs have a null origin and may carry a query used for cache
 * busting, like "import(`${path}.js?version=${Math.random()}`)". Both need
 * to be dropped to get a path the file system understands.
 */
function toPath(url) {
  const clean = new URL(url)

  clean.search = ''
  clean.hash = ''

  return fileURLToPath(clean)
}

/**
 * "registerHooks()" is only available on Node.js v22.15.0 and above. Older
 * versions keep using the loader that has always been shipped here.
 */
if (!Module.registerHooks) {
  Module.register('ts-node/esm', pathToFileURL('./'))
} else {
  const compilerOptions = getCompilerOptions()

  Module.registerHooks({
    resolve(specifier, context, next) {
      try {
        return next(specifier, context)
      } catch (err) {
        if (err.code !== 'ERR_MODULE_NOT_FOUND' || !err.url) {
          throw err
        }

        const url = new URL(err.url)

        if (!url.pathname.endsWith('.js')) {
          throw err
        }

        url.pathname = `${url.pathname.slice(0, -3)}.ts`

        if (!existsSync(toPath(url))) {
          throw err
        }

        return { url: url.href, format: 'module', shortCircuit: true }
      }
    },

    load(url, context, next) {
      const { pathname } = new URL(url)

      if (!TS_EXTENSIONS.some(extension => pathname.endsWith(extension))) {
        return next(url, context)
      }

      const fileName = toPath(url)
      const { outputText } = ts.transpileModule(readFileSync(fileName, 'utf8'), {
        fileName,
        compilerOptions
      })

      return { format: 'module', shortCircuit: true, source: outputText }
    }
  })
}
