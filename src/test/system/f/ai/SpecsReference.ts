import assert from 'assert'
import SpecsReference from '../../../../system/f/ai/SpecsReference'
import { system } from '../../../util/system'

const specsReference = new SpecsReference(system)

specsReference.play()

specsReference.push('specs', {
  keep_0: {
    name: 'kept',
    inputs: { a: { type: 'string' } },
    outputs: { b: { type: 'number' } },
    metadata: { tags: ['f'], description: 'kept unit' },
  },
  skip_render: {
    name: 'rendered',
    render: true,
    metadata: { tags: ['f'] },
  },
  skip_tag: {
    name: 'http unit',
    metadata: { tags: ['http'] },
  },
  skip_platform: {
    name: 'platform unit',
    metadata: { tags: ['platform'] },
  },
})

const reference = specsReference.take('reference')

assert.equal(reference.includes('keep_0|kept|a:string=>b:number|kept unit'), true)
assert.equal(reference.includes('skip_render'), false)
assert.equal(reference.includes('skip_tag'), false)
assert.equal(reference.includes('skip_platform'), false)
