import assert from 'assert'
import LLMChatStream from '../../../../system/f/ai/LLMChatStream'
import { system } from '../../../util/system'
import { streamResponse, withMockFetch } from './_util'

void (async () => {
  const llmChatStream = new LLMChatStream(system)

  llmChatStream.play()

  const chunks: string[] = []
  llmChatStream.getOutput('chunk').addListener('data', (data) => {
    chunks.push(data)
  })

  let fetchCall: {
    init: RequestInit
  } | null = null

  let restoreFetch = withMockFetch(async (_, init) => {
    fetchCall = { init }

    return streamResponse([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n',
      'data: {"choices":[{"delta":{"content":"lo"}}]}',
    ])
  })

  try {
    await new Promise<void>((resolve, reject) => {
      llmChatStream.f(
        {
          messages: [{ role: 'user', content: 'hello' }],
          url: 'http://unit.test/v1/chat/completions',
          model: 'test-model',
          api_key: 'sk-stream',
        },
        () => resolve(),
        reject
      )
    })

    assert.equal(fetchCall?.init.headers?.['Authorization'], 'Bearer sk-stream')
    assert.deepEqual(JSON.parse(fetchCall?.init.body as string), {
      model: 'test-model',
      messages: [{ role: 'user', content: 'hello' }],
      stream: true,
    })
    assert.deepEqual(chunks, ['Hel', 'lo'])
    assert.equal(llmChatStream.take('done'), true)
  } finally {
    restoreFetch()
  }

  restoreFetch = withMockFetch(async () => streamResponse([], { noBody: true }))

  try {
    const error = await new Promise<string>((resolve) => {
      llmChatStream.f(
        {
          messages: [],
          url: 'http://unit.test/v1/chat/completions',
          model: 'test-model',
          api_key: '',
        },
        () => {
          throw new Error('expected failure')
        },
        resolve
      )
    })

    assert.equal(error, 'no response body')
  } finally {
    restoreFetch()
  }

  restoreFetch = withMockFetch(async () =>
    streamResponse([], { ok: false, status: 401 })
  )

  try {
    const error = await new Promise<string>((resolve) => {
      llmChatStream.f(
        {
          messages: [],
          url: 'http://unit.test/v1/chat/completions',
          model: 'test-model',
          api_key: '',
        },
        () => {
          throw new Error('expected failure')
        },
        resolve
      )
    })

    assert.equal(error, 'request failed with status 401')
  } finally {
    restoreFetch()
  }
})().catch((err) => {
  throw err
})
