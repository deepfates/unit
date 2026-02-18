import assert from 'assert'
import ToolCallParser from '../../../../system/f/ai/ToolCallParser'
import { system } from '../../../util/system'

const toolCallParser = new ToolCallParser(system)

toolCallParser.play()

toolCallParser.push(
  'response',
  JSON.stringify({
    choices: [{ message: { content: 'hello' } }],
  })
)
assert.equal(toolCallParser.take('text'), 'hello')
assert.deepEqual(toolCallParser.take('tool_calls'), [])
assert.equal(toolCallParser.take('has_tool_calls'), false)

toolCallParser.push(
  'response',
  JSON.stringify({
    choices: [
      {
        message: {
          content: '',
          tool_calls: [
            {
              id: 'call_0',
              function: {
                name: 'set_state',
                arguments: '{"k":"value"}',
              },
            },
          ],
        },
      },
    ],
  })
)
assert.equal(toolCallParser.take('has_tool_calls'), true)
assert.deepEqual(toolCallParser.take('tool_calls'), [
  {
    id: 'call_0',
    name: 'set_state',
    arguments: { k: 'value' },
  },
])
