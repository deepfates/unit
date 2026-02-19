import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { Fail } from '../../../../Class/Functional/Fail'
import { System } from '../../../../system'
import { ID_LLM_CHAT } from '../../../_ids'

interface Message {
  role: string
  content: string
}

export interface I {
  messages: Message[]
  url: string
  model: string
  api_key: string
}

export interface O {
  response: string
  message: Message
}

export default class LLMChat extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['messages', 'url', 'model', 'api_key'],
        o: ['response', 'message'],
      },
      {},
      system,
      ID_LLM_CHAT
    )
  }

  async f(
    { messages, url, model, api_key }: I,
    done: Done<O>,
    fail: Fail
  ): Promise<void> {
    const {
      api: {
        http: { fetch },
      },
      cache: { interceptors },
    } = this.__system

    const body = JSON.stringify({ model, messages })

    try {
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(api_key ? { Authorization: `Bearer ${api_key}` } : {}),
          },
          body,
        },
        interceptors
      )

      if (!response.ok) {
        fail(`request failed with status ${response.status}`)

        return
      }

      const json = await response.json()

      const text = json.choices?.[0]?.message?.content

      if (text === undefined) {
        fail('no completion in response')

        return
      }

      done({
        response: text,
        message: { role: 'assistant', content: text },
      })
    } catch (err) {
      fail(err.message?.toLowerCase() ?? 'unknown error')
    }
  }
}
