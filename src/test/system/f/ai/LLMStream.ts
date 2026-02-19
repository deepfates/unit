import assert from 'assert'
import LLMStream from '../../../../system/f/ai/LLMStream'
import { system } from '../../../util/system'
import { streamResponse, withMockFetch } from './_util'

void (async () => {
  const llmStream = new LLMStream(system)

  llmStream.play()

  const chunks: string[] = []
  llmStream.getOutput('chunk').addListener('data', (data) => {
    chunks.push(data)
  })

  let restoreFetch = withMockFetch(async () => {
    return streamResponse([
      'data: {"choices":[{"delta":{"content":"He"}}]}\n',
      'data: {"choices":[{"delta":{"content":"ll"}}]}\n',
      'data: {"choices":[{"delta":{"content":"o"}}]}',
    ])
  })

  try {
    const doneData = await new Promise<any>((resolve, reject) => {
      llmStream.f(
        {
          messages: [{ role: 'user', content: 'hello' }],
          url: 'http://unit.test/v1/chat/completions',
          model: 'test-model',
          api_key: 'sk-stream',
          done: null,
        },
        resolve,
        reject
      )
    })

    assert.equal(doneData.text, 'Hello')
    assert.deepEqual(chunks, ['He', 'll', 'o'])
  } finally {
    restoreFetch()
  }

  let cancelled = false
  ;(llmStream as any)._reader = {
    cancel: async () => {
      cancelled = true
    },
  }

  llmStream.d()

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(cancelled, true)
  assert.equal((llmStream as any)._reader, null)
})().catch((err) => {
  throw err
})
