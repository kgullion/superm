// https://docs.python.org/3/library/itertools.html#itertools.combinations
export function* combinations<T>(iterable: Iterable<T>, r?: number) {
  const pool = [...iterable];
  if (r === undefined) r = pool.length;
  const n = pool.length;
  if (r > n) return;
  let indices = [...Array(r).keys()];
  yield indices.map((i) => pool[i]);
  for (;;) {
    let i = r - 1;
    for (; i >= 0; --i) if (indices[i] !== i + n - r) break;
    if (i < 0) return;
    ++indices[i];
    for (let j = i + 1; j < r; ++j) indices[j] = indices[j - 1] + 1;
    yield indices.map((i) => pool[i]);
  }
}

// https://docs.python.org/3/library/itertools.html#itertools.permutations
export function* permutations<T>(iterable: Iterable<T>, r?: number) {
  const pool = [...iterable];
  const n = pool.length;
  if (r === undefined) r = n;
  if (r > n) return;
  let indices: number[] = [...Array(n).keys()];
  let cycles: number[] = [];
  let i;
  for (i = n; i > n - r; --i) cycles.push(i);
  yield indices.slice(0, r).map((k) => pool[k]);
  while (i >= 0) {
    for (i = r - 1; i >= 0; --i) {
      --cycles[i];
      if (cycles[i] == 0) {
        indices.push(...indices.splice(i, 1));
        cycles[i] = n - i;
      } else {
        const j = n - cycles[i];
        const tmp = indices[i];
        indices[i] = indices[j];
        indices[j] = tmp;
        yield indices.slice(0, r).map((k) => pool[k]);
        break;
      }
    }
  }
}
