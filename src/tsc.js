/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export async function tsc() {
  process.argv.push('--project', 'node_modules/@athenna/tsconfig/tsconfig.lib-build.json')

  await import('typescript/lib/tsc.js')
}
