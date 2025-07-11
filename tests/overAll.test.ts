import { overAll } from '../src'

async function sleep (props: { ms: number }): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, props.ms)
  })
}

describe('overAll', () => {
  test('returns results in original input order', async () => {
    const delays = [300, 100, 200, 50]

    const result = await overAll(delays, async (delay: number) => {
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

  test('handles empty array', async () => {
    const result = await overAll([], async (id: number) => {
      return id
    })

    expect(result).toEqual([])
  })

  test('handles single item', async () => {
    const result = await overAll([5], async (id: number) => {
      await sleep({ ms: 50 })
      return id * 2
    })

    expect(result).toEqual([10])
  })

  test('transforms input type to different output type', async () => {
    const items = ['a', 'bb', 'ccc']

    const result = await overAll(items, async (item: string) => {
      await sleep({ ms: item.length * 50 })
      return item.length
    })

    expect(result).toEqual([1, 2, 3])
  })

  test('handles async function that throws error', async () => {
    const ids = [1, 2, 3]

    await expect(
      overAll(ids, async (id: number) => {
        if (id === 2) {
          throw new Error('Test error')
        }
        return id
      })
    ).rejects.toThrow('Test error')
  })

  test('passes correct index arguments to callback', async () => {
    const items = ['a', 'b', 'c']
    const receivedIndexes: number[] = []

    const result = await overAll(items, async (item: string, index: number) => {
      receivedIndexes.push(index)
      await sleep({ ms: 10 })
      return `${item}-${index}`
    })

    expect(receivedIndexes).toEqual([0, 1, 2])
    expect(result).toEqual(['a-0', 'b-1', 'c-2'])
  })

  test('starts all promises before any resolve', async () => {
    const executionOrder: string[] = []
    const delays = [100, 50, 150]

    await overAll(delays, async (delay: number, index: number) => {
      executionOrder.push(`start-${index}`)
      await sleep({ ms: delay })
      executionOrder.push(`end-${index}`)
      return delay
    })

    expect(executionOrder.slice(0, 3)).toEqual(['start-0', 'start-1', 'start-2'])
  })

  test('waits for longest callback, not sum of callbacks', async () => {
    const delays = [100, 100, 100]

    const startTime = Date.now()
    await overAll(delays, async (delay: number) => {
      await sleep({ ms: delay })
      return delay
    })
    const totalTime = Date.now() - startTime

    expect(totalTime).toBeLessThan(150)
    expect(totalTime).toBeGreaterThan(90)
  })

  test('runs callbacks simultaneously', async () => {
    const activeCallbacks = new Set<number>()
    const maxConcurrent = { value: 0 }

    await overAll([1, 2, 3], async (item: number, index: number) => {
      activeCallbacks.add(index)
      maxConcurrent.value = Math.max(maxConcurrent.value, activeCallbacks.size)

      await sleep({ ms: 50 })

      activeCallbacks.delete(index)
      return item
    })

    expect(maxConcurrent.value).toBe(3)
  })
})
