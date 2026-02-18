import assert from 'assert'
import PromptTemplate from '../../../../system/f/ai/PromptTemplate'
import { system } from '../../../util/system'

const promptTemplate = new PromptTemplate(system)

promptTemplate.play()

promptTemplate.push('template', 'Hello {name}, role {role}')
promptTemplate.push('vars', { name: 'Unit', role: 'assistant' })
assert.equal(promptTemplate.take('text'), 'Hello Unit, role assistant')

promptTemplate.push('template', 'Missing {x} remains')
promptTemplate.push('vars', {})
assert.equal(promptTemplate.take('text'), 'Missing {x} remains')
