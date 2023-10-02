/**
 * @athenna/template
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Bootstrap } from '#src'
import { Test } from '@athenna/test'
import type { Context } from '@athenna/test/types'

export default class TemplateTest {
  @Test()
  public async shouldBeAbleToCreateAndRunTestsWithThisTemplate({ assert }: Context) {
    assert.equal(Bootstrap.main('Hello', 'World!'), 'Bootstrap: Hello World!')
  }
}
