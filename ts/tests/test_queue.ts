import { Queue } from "../containers.js";

export function testQueue() {
  const table = {
    growth: () => {
      const queue = new Queue<number>(2);
      if (!queue.empty()) {
        return `queue should be empty, got ${queue}`;
      }
      queue.pushright(1, 2);
      queue.pushright(2);
      let popped = queue.popleft();
      if (popped !== 1) {
        return `should pop 1, got ${popped}`;
      }
      queue.pushright(3);

      // now the queue is full, so it has to grow
      queue.pushright(4);
      popped = queue.popleft();
      if (popped !== 2) {
        return `should pop 2, got ${popped}`;
      }
    },

    wrapping: () => {
      const queue = new Queue<number>(4);

      queue.pushright(1, 2, 3, 4);
      let popped = queue.popleft();
      if (popped !== 1) {
        return `should pop 1, got ${popped}`;
      }
      queue.pushright(5);
      popped = queue.popleft();
      if (popped !== 2) {
        return `should pop 2, got ${popped}`;
      }

      // cause overflow
      queue.pushright(6, 7, 8);

      for (let value of [3, 4, 5, 6, 7, 8]) {
        popped = queue.popleft();

        if (popped !== value) {
          return `should be pop ${value}, got ${popped}`;
        }
      }
    },

    full: () => {
      const queue = new Queue<number>(2);
      if (!queue.empty()) {
        return `queue is empty but queue.empty() is false`;
      }
      queue.pushright(1, 2);
      if (!queue.full()) {
        console.error(queue.start, queue.end, queue.array.length);
        return `queue is full but queue.full() is false`;
      }
      queue.popleft();
      queue.pushright(3);
      if (!queue.full()) {
        return `queue is full after wrapping but queue.full() is false`;
      }
    },
  };

  let numberSuccess = 0;
  const failures = [];
  const errors = [];

  for (let [testname, func] of Object.entries(table)) {
    let result;
    try {
      result = func();
    } catch (e) {
      failures.push({
        arguments: testname,
        error: e,
      });
      continue;
    }
    if (result === undefined) {
      numberSuccess++;
    } else {
      errors.push({
        arguments: testname,
        actualOutput: result,
        expectedOutput: null,
      });
    }
  }
  return { numberSuccess, errors, failures };
}
