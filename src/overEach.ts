export default async function overEach<Item, Result> (
  items: Item[],
  callback: (item: Item, index: number) => Promise<Result>
): Promise<Result[]> {
  let index = 0
  const results: Result[] = []
  for (const item of items) {
    const result = await callback(item, index)
    results.push(result)
    index += 1
  }
  return results
}
