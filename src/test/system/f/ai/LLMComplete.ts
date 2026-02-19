import assert from 'assert'
import LLMComplete from '../../../../system/f/ai/LLMComplete'
import { system } from '../../../util/system'
import { withMockFetch } from './_util'

void (async () => {
  const llmComplete = new LLMComplete(system)

  llmComplete.play()

  let fetchCall: {
    init: RequestInit
  } | null = null

  let restoreFetch = withMockFetch(async (_, init) => {
    fetchCall = { init }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'completed text' } }],
      }),
    } as Response
  })

  try {
    const doneData = await new Promise<any>((resolve, reject) => {
      llmComplete.f(
        {
          prompt: 'write a summary',
          url: 'http://unit.test/v1/chat/completions',
          model: 'test-model',
          api_key: 'sk-complete',
        },
        resolve,
        reject
      )
    })

    assert.deepEqual(doneData, { response: 'completed text' })
    assert.equal(
      fetchCall?.init.headers?.['Authorization'],
      'Bearer sk-complete'
    )
    assert.deepEqual(JSON.parse(fetchCall?.init.body as string), {
      model: 'test-model',
      messages: [{ role: 'user', content: 'write a summary' }],
    })
  } finally {
    restoreFetch()
  }

  restoreFetch = withMockFetch(async () => {
    return {
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response
  })

  try {
    const error = await new Promise<string>((resolve) => {
      llmComplete.f(
        {
          prompt: 'write a summary',
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

    assert.equal(error, 'no completion in response')
  } finally {
    restoreFetch()
  }
})().catch((err) => {
  throw err
})
