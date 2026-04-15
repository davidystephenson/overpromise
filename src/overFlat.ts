export default async function overFlat<Item, Result> (
  items: Item[],
  callback: (item: Item, index: number) => Promise<Result[]>
): Promise<Result[]> {
  const promises = items.map(callback)
  const completed = await Promise.all(promises)
  return completed.flat()
}
