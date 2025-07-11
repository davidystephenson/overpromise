import { overAll, overEach } from "overpromise";

const ids = [2, 3, 1];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const result = await overAll(ids, async (id) => {
  await sleep(id * 100);
  return id;
});
// 1, 2, 3

const result = await overEach(ids, async (id) => {
  await sleep(id * 100);
  return id;
});
// 2, 3, 1