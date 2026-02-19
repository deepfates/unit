import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { Fail } from '../../../../Class/Functional/Fail'
import { System } from '../../../../system'
import { ID_LLM_COMPLETE } from '../../../_ids'

export interface I {
  prompt: string
  url: string
  model: string
  api_key: string
}

export interface O {
  response: string
}

export default class LLMComplete extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['prompt', 'url', 'model', 'api_key'],
        o: ['response'],
      },
      {},
      system,
      ID_LLM_COMPLETE
    )
  }

  async f(
    { prompt, url, model, api_key }: I,
    done: Done<O>,
    fail: Fail
  ): Promise<void> {
    const {
      api: {
        http: { fetch },
      },
      cache: { interceptors },
    } = this.__system

    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    })

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

      done({ response: text })
    } catch (err) {
      fail(err.message?.toLowerCase() ?? 'unknown error')
    }
  }
}
