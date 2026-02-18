import assert from 'assert'
import LLMChat from '../../../../system/f/ai/LLMChat'
import { system } from '../../../util/system'

const llmChat = new LLMChat(system)

llmChat.play()

assert.equal(llmChat.getInputNames().includes('key'), true)
assert.equal(llmChat.getInputNames().includes('token'), false)
