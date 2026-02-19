import assert from 'assert'
import { fromSpec } from '../../../spec/fromSpec'
import _specs from '../../../system/_specs'
import { system } from '../../util/system'

const spec = require('../../../system/core/ai/ChatLoop/spec.json')

const ChatLoop = fromSpec(spec, _specs)

const chatLoop = new ChatLoop(system)

chatLoop.play()

assert.equal(chatLoop.getInputNames().includes('api_key'), true)
