/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import copyfiles from 'copyfiles'

import { tsc } from './tsc.js'
import { rimraf } from 'rimraf'

/**
 * Delete old build folder.
 */
rimraf('build')

/**
 * Copy default files to build folder.
 */
copyfiles([
  'templates',
  'configurer',
  'package.json',
  'package-lock.json',
  'LICENSE.md',
  'README.md',
  'build'
], '', (err) => {
  if (err) throw err

  /**
   * Run tsc compiler after copyfiles because
   * `tsc` exits the process after compile.
   */
  tsc()
})
