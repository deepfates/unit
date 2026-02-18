import assert from 'assert'
import {
  markdownToHtml,
  sanitize,
} from '../../../system/platform/component/markdownUtils'

const blockedLinkHtml = sanitize(markdownToHtml('[x](javascript:alert(1))'))
assert.equal(blockedLinkHtml.includes('javascript:'), false)
assert.equal(blockedLinkHtml.includes('href="#"'), true)

const safeLinkHtml = sanitize(markdownToHtml('[x](https://example.com)'))
assert.equal(safeLinkHtml.includes('href="https://example.com"'), true)
