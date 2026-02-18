import assert from 'assert'
import LLMChatStream from '../../../../system/f/ai/LLMChatStream'
import { system } from '../../../util/system'

const llmChatStream = new LLMChatStream(system)

llmChatStream.play()

assert.equal(llmChatStream.getInputNames().includes('token'), true)
assert.equal(llmChatStream.getOutputNames().includes('chunk'), true)
assert.equal(llmChatStream.getOutputNames().includes('done'), true)
