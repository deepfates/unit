import assert from 'assert'
import LLMChat from '../../../../system/f/ai/LLMChat'
import { system } from '../../../util/system'
import { withMockFetch } from './_util'

void (async () => {
  const llmChat = new LLMChat(system)

  llmChat.play()

  let fetchCall: {
    url: string
    init: RequestInit
    interceptors: any
  } | null = null

  let restoreFetch = withMockFetch(async (url, init, interceptors) => {
    fetchCall = { url, init, interceptors }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'hello from model' } }],
      }),
    } as Response
  })

  try {
    const doneData = await new Promise<any>((resolve, reject) => {
      llmChat.f(
        {
          messages: [{ role: 'user', content: 'hello' }],
          url: 'http://unit.test/v1/chat/completions',
          model: 'test-model',
          api_key: 'sk-test',
        },
        resolve,
        reject
      )
    })

    assert.deepEqual(doneData, {
      response: 'hello from model',
      message: { role: 'assistant', content: 'hello from model' },
    })
    assert.equal(fetchCall?.url, 'http://unit.test/v1/chat/completions')
    assert.equal(fetchCall?.init.method, 'POST')
    assert.equal(fetchCall?.init.headers?.['Authorization'], 'Bearer sk-test')
    assert.deepEqual(JSON.parse(fetchCall?.init.body as string), {
      model: 'test-model',
      messages: [{ role: 'user', content: 'hello' }],
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
      llmChat.f(
        {
          messages: [{ role: 'user', content: 'hello' }],
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

  restoreFetch = withMockFetch(async () => {
    return { ok: false, status: 503 } as Response
  })

  try {
    const error = await new Promise<string>((resolve) => {
      llmChat.f(
        {
          messages: [{ role: 'user', content: 'hello' }],
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

    assert.equal(error, 'request failed with status 503')
  } finally {
    restoreFetch()
  }

  restoreFetch = withMockFetch(async () => {
    throw new Error('Network Down')
  })

  try {
    const error = await new Promise<string>((resolve) => {
      llmChat.f(
        {
          messages: [{ role: 'user', content: 'hello' }],
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

    assert.equal(error, 'network down')
  } finally {
    restoreFetch()
  }
})().catch((err) => {
  throw err
})
