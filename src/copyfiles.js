/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import copyfilesSync from 'copyfiles'

/**
 *  Promisified version of copyfiles.
 *
 * @param {string[]} files
 * @param {string} dest
 * @return {Promise<void>}
 */
export function copyfiles(files, dest) {
  return new Promise((resolve, reject) => {
    copyfilesSync(files.push(dest), '', (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}
