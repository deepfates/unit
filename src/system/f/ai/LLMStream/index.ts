import { Done } from '../../../../Class/Functional/Done'
import { Fail } from '../../../../Class/Functional/Fail'
import { Holder } from '../../../../Class/Holder'
import { System } from '../../../../system'
import { ID_LLM_STREAM } from '../../../_ids'

interface Message {
  role: string
  content: string
}

export interface I {
  messages: Message[]
  url: string
  model: string
  api_key: string
  done: any
}

export interface O {
  text: string
  chunk: string
  done: any
}

export default class LLMStream extends Holder<I, O> {
  private _reader: ReadableStreamDefaultReader | null = null

  constructor(system: System) {
    super(
      {
        fi: ['messages', 'url', 'model', 'api_key'],
        fo: ['text'],
        i: [],
        o: ['chunk', 'done'],
      },
      {},
      system,
      ID_LLM_STREAM
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

    const body = JSON.stringify({
      model,
      messages,
      stream: true,
    })

    let response: Response

    try {
      response = await fetch(
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
    } catch (err) {
      fail(err.message?.toLowerCase() ?? 'fetch failed')

      return
    }

    if (!response.ok) {
      fail(`request failed with status ${response.status}`)

      return
    }

    if (!response.body) {
      fail('no response body')

      return
    }

    const reader = response.body.getReader()
    this._reader = reader

    const decoder = new TextDecoder()
    let accumulated = ''
    let pending = ''

    try {
      const processLine = (rawLine: string): void => {
        const line = rawLine.trim()

        if (!line.startsWith('data:')) {
          return
        }

        const data = line.slice(5).trim()

        if (!data || data === '[DONE]') {
          return
        }

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content

          if (content) {
            accumulated += content
            this._output.chunk.push(content)
          }
        } catch {
          // skip malformed JSON chunks
        }
      }

      while (true) {
        const { done: streamDone, value } = await reader.read()

        if (streamDone) {
          break
        }

        pending += decoder.decode(value, { stream: true })
        const lines = pending.split('\n')
        pending = lines.pop() ?? ''

        for (const rawLine of lines) {
          processLine(rawLine)
        }
      }

      if (pending) {
        processLine(pending)
      }
    } catch (err) {
      if (this._reader) {
        fail(err.message?.toLowerCase() ?? 'stream error')

        return
      }

      // reader was nulled by d() — clean shutdown
    }

    this._reader = null

    done({ text: accumulated })
  }

  d() {
    if (this._reader) {
      const reader = this._reader
      this._reader = null

      reader.cancel().catch(() => {})
    }
  }

  b() {
    this._output.done.push(true)
  }
}
