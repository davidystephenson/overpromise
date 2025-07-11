# Overpromise

Iterate with promises.

## Installation

```bash
npm install overpromise
```

## Usage

```ts
import { overAll } from "overpromise";

const ids = [1, 2, 3];
const result = await overAll(ids, async (id) => {
  const data = await fetch(`https://api.example.com/items/${id}`);
  return data.json();
});
```
