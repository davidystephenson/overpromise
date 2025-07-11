import { overEach } from '../src'

async function sleep (props: { ms: number }): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, props.ms)
  })
}

describe('overEach', () => {
  test('handles empty array', async () => {
    const result = await overEach([], async (id: number) => {
      return id
    })

    expect(result).toEqual([])
  })

  test('handles single item', async () => {
    const result = await overEach([5], async (id: number) => {
      await sleep({ ms: 50 })
      return id * 2
    })

    expect(result).toEqual([10])
  })

  test('returns results in original input order', async () => {
    const delays = [300, 100, 200, 50]

    const result = await overEach(delays, async (delay: number) => {
      await sleep({ ms: delay })
      return `completed-${delay}`
    })

    expect(result).toEqual([
      'completed-300',
      'completed-100',
      'completed-200',
      'completed-50'
    ])
  })

  test('transforms input type to different output type', async () => {
    const words = ['cat', 'elephant', 'dog']

    const result = await overEach(words, async (word: string) => {
      await sleep({ ms: word.length * 10 })
      return word.length
    })

    expect(result).toEqual([3, 8, 3])
  })

  test('passes correct index arguments to callback', async () => {
    const items = ['x', 'y', 'z']
    const receivedIndexes: number[] = []

    const result = await overEach(items, async (item: string, index: number) => {
      receivedIndexes.push(index)
      await sleep({ ms: 10 })
      return `${item}-${index}`
    })

    expect(receivedIndexes).toEqual([0, 1, 2])
    expect(result).toEqual(['x-0', 'y-1', 'z-2'])
  })

  test('executes callbacks one at a time in sequence', async () => {
    const executionOrder: string[] = []
    const delays = [100, 50, 150]

    await overEach(delays, async (delay: number, index: number) => {
      executionOrder.push(`start-${index}`)
      await sleep({ ms: delay })
      executionOrder.push(`end-${index}`)
      return delay
    })

    expect(executionOrder).toEqual([
      'start-0', 'end-0',
      'start-1', 'end-1',
      'start-2', 'end-2'
    ])
  })

  test('completes in time equal to sum of all callbacks', async () => {
    const delays = [100, 100, 100]

    const startTime = Date.now()
    await overEach(delays, async (delay: number) => {
      await sleep({ ms: delay })
      return delay
    })
    const totalTime = Date.now() - startTime

    expect(totalTime).toBeGreaterThan(290)
    expect(totalTime).toBeLessThan(350)
  })

  test('prevents callback overlap by waiting for each to complete', async () => {
    const activeCallbacks = new Set<number>()
    const maxConcurrent = { value: 0 }

    await overEach([1, 2, 3], async (item: number, index: number) => {
      activeCallbacks.add(index)
      maxConcurrent.value = Math.max(maxConcurrent.value, activeCallbacks.size)

      await sleep({ ms: 50 })

      activeCallbacks.delete(index)
      return item
    })

    expect(maxConcurrent.value).toBe(1)
  })
})
