import { overFlat } from '../src'

async function sleep (props: { ms: number }): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, props.ms)
  })
}

describe('overFlat', () => {
  test('flattens results from callback arrays', async () => {
    const letters = ['a', 'b', 'c']

    const result = await overFlat(letters, async (letter: string) => {
      return [letter.toUpperCase()]
    })

    expect(result).toEqual(['A', 'B', 'C'])
  })

  test('filters by returning empty arrays', async () => {
    const letters = ['a', 'b', 'c']

    const result = await overFlat(letters, async (letter: string) => {
      if (letter === 'b') {
        return []
      }
      return [letter.toUpperCase()]
    })

    expect(result).toEqual(['A', 'C'])
  })

  test('expands items by returning multiple elements', async () => {
    const numbers = [1, 2, 3]

    const result = await overFlat(numbers, async (num: number) => {
      return [num, num * 10]
    })

    expect(result).toEqual([1, 10, 2, 20, 3, 30])
  })

  test('handles empty array', async () => {
    const result = await overFlat([], async (id: number) => {
      return [id]
    })

    expect(result).toEqual([])
  })

  test('handles single item', async () => {
    const result = await overFlat([5], async (id: number) => {
      await sleep({ ms: 50 })
      return [id * 2]
    })

    expect(result).toEqual([10])
  })

  test('returns results in original input order', async () => {
    const delays = [300, 100, 200, 50]

    const result = await overFlat(delays, async (delay: number) => {
      await sleep({ ms: delay })
      return [`completed-${delay}`]
    })

    expect(result).toEqual([
      'completed-300',
      'completed-100',
      'completed-200',
      'completed-50'
    ])
  })

  test('transforms input type to different output type', async () => {
    const items = ['a', 'bb', 'ccc']

    const result = await overFlat(items, async (item: string) => {
      await sleep({ ms: item.length * 50 })
      return [item.length]
    })

    expect(result).toEqual([1, 2, 3])
  })

  test('handles async function that throws error', async () => {
    const ids = [1, 2, 3]

    await expect(
      overFlat(ids, async (id: number) => {
        if (id === 2) {
          throw new Error('Test error')
        }
        return [id]
      })
    ).rejects.toThrow('Test error')
  })

  test('passes correct index arguments to callback', async () => {
    const items = ['a', 'b', 'c']
    const receivedIndexes: number[] = []

    const result = await overFlat(items, async (item: string, index: number) => {
      receivedIndexes.push(index)
      await sleep({ ms: 10 })
      return [`${item}-${index}`]
    })

    expect(receivedIndexes).toEqual([0, 1, 2])
    expect(result).toEqual(['a-0', 'b-1', 'c-2'])
  })

  test('resolves concurrently', async () => {
    const executionOrder: string[] = []
    const delays = [100, 50, 150]

    await overFlat(delays, async (delay: number, index: number) => {
      executionOrder.push(`start-${index}`)
      await sleep({ ms: delay })
      executionOrder.push(`end-${index}`)
      return [delay]
    })

    expect(executionOrder).toEqual([
      'start-0', 'start-1', 'start-2',
      'end-1', 'end-0', 'end-2'
    ])
  })

  test('handles all callbacks returning empty arrays', async () => {
    const items = [1, 2, 3]

    const result = await overFlat(items, async (_item: number) => {
      return []
    })

    expect(result).toEqual([])
  })
})
