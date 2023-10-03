/**
 * @athenna/tsconfig
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { spawn } from 'node:child_process'

const bin = `${process.cwd()}${sep}node_modules${sep}.bin`

const tsc = `${bin}${sep}tsc`
const rimraf = `${bin}${sep}rimraf`
const copyfiles = `${bin}${sep}copyfiles`

const options = { shell: true, stdio: 'inherit' }

spawn(`${rimraf} build`, options)
spawn(`${tsc} --project node_modules/@athenna/tsconfig/tsconfig.lib-build.json`, options)
spawn(`${copyfiles} templates configurer package.json package-lock.json LICENSE.md README.md build`, options)
