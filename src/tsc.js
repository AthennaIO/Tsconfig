/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import lodash from 'lodash'

/**
 * Run tsc compiler "programmatically".
 *
 * @param {string} tsConfigPath
 * @return {Promise<void>}
 */
export async function tsc(tsConfigPath) {
  const originalArgv = lodash.cloneDeep(process.argv)
  const originalExit = process.exit

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
  process.argv.push('--project', tsConfigPath)

  try {
    await import('typescript/lib/tsc.js')
  } finally {
    process.argv = originalArgv
    process.exit = originalExit
  }

  if (exitCode) {
    throw new Error(
      `The tsc compiler has finished with errors using the "${tsConfigPath}" config file.`
    )
  }
}
