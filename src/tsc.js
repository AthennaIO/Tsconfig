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
  const originalExit = lodash.cloneDeep(process.exit)

  process.exit = () => {}

  process.argv = process.argv.slice(0, 2)
  process.argv.push('--project', tsConfigPath)

  try {
    await import('typescript/lib/tsc.js')
  } finally {
    process.argv = originalArgv
    process.exit = originalExit
  }
}
