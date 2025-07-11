export default async function overAll<Item, Result> (
  items: Item[],
  callback: (item: Item, index: number) => Promise<Result>
): Promise<Result[]> {
  const promises = items.map(async (item, index) => {
    const result = await callback(item, index)
    return result
  })

  const completed = await Promise.all(promises)
  return completed
}
