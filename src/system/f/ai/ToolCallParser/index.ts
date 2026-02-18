import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { Fail } from '../../../../Class/Functional/Fail'
import { System } from '../../../../system'
import { ID_TOOL_CALL_PARSER } from '../../../_ids'

interface ToolCall {
  id: string
  name: string
  arguments: object
}

export interface I {
  response: string
}

export interface O {
  text: string
  tool_calls: ToolCall[]
  has_tool_calls: boolean
}

export default class ToolCallParser extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['response'],
        o: ['text', 'tool_calls', 'has_tool_calls'],
      },
      {},
      system,
      ID_TOOL_CALL_PARSER
    )
  }

  f({ response }: I, done: Done<O>, fail: Fail): void {
    let json: any

    try {
      json = JSON.parse(response)
    } catch {
      fail('invalid json')

      return
    }

    const message = json.choices?.[0]?.message

    if (!message) {
      fail('no message in response')

      return
    }

    const text = message.content ?? ''

    const rawToolCalls = message.tool_calls

    if (!rawToolCalls || rawToolCalls.length === 0) {
      done({
        text,
        tool_calls: [],
        has_tool_calls: false,
      })

      return
    }

    const tool_calls: ToolCall[] = rawToolCalls.map((tc: any) => {
      let args: object

      try {
        args =
          typeof tc.function.arguments === 'string'
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments
      } catch {
        args = {}
      }

      return {
        id: tc.id ?? '',
        name: tc.function.name,
        arguments: args,
      }
    })

    done({
      text,
      tool_calls,
      has_tool_calls: true,
    })
  }
}
