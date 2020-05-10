// Queue system which grows dynammically, but only when it needs to (otherwise,
// it just wraps around the underlying array buffer)
export class Queue<T> {
  start: number;
  end: number;
  array: T[];

  _empty: boolean;

  constructor(initialLength: number, initialElements: T[] = []) {
    if (initialLength <= initialElements.length) {
      console.error("initial length:", initialLength);
      console.error("initial elements:", initialElements);
      throw new Error(
        "initial length is less than the length of the initial elements"
      );
    }
    this.array = new Array(initialLength);
    for (let i in initialElements) {
      this.array[i] = initialElements[i];
    }
    this.start = 0;
    this.end = initialElements.length;

    this._empty = true;
  }

  public pushright(...elements: T[]) {
    for (let element of elements) {
      if (this.end === this.array.length) {
        this.end = 0;
      }

      if (this.full()) {
        this.extend();
      }

      this.array[this.end] = element;
      this.end += 1;
      this._empty = false;
    }
  }

  public popleft() {
    if (this.empty()) {
      throw new Error("queue is empty");
    }
    const element = this.array[this.start];
    delete this.array[this.start];
    this.start += 1;
    if (this.start === this.end) {
      this._empty = true;
    }
    return element;
  }

  public full() {
    return (
      !this._empty &&
      this.start % this.array.length === this.end % this.array.length
    );
  }

  public empty() {
    return this._empty && this.start === this.end;
  }

  extend() {
    // doubles the length of the queue, and moves every object that is wrapped around
    // back to the end. For example, if we have added a b c d e f g to the queue
    // and the underlying array is: f g a b c d e, then we would get
    // . . a b c d e f g . . . . .

    this.end = this.array.length;
    this.array.length *= 2;
    for (let i = 0; i < this.start; i++) {
      this.array[this.end] = this.array[i];
      delete this.array[i];
      this.end++;
    }
  }
}

export class Stream<T> {
  items: readonly T[];
  index: number;

  constructor(items: T[]) {
    this.items = items;
    this.index = 0;
  }

  consume() {
    if (this.index + 1 > this.length()) {
      return null;
    }
    this.index += 1;
    return this.items[this.index - 1];
  }

  peek() {
    if (this.index + 1 > this.length()) {
      return null;
    }
    return this.items[this.index];
  }

  length() {
    return this.items.length;
  }
}

export class StringStream {
  items: string;
  index: number;

  constructor(items: string) {
    this.items = items;
    this.index = 0;
  }

  consume(): string | null {
    if (this.index + 1 > this.length()) {
      return null;
    }
    this.index += 1;
    return this.items[this.index - 1];
  }

  peek(): string | null {
    if (this.index + 1 > this.length()) {
      return null;
    }
    return this.items[this.index];
  }

  length(): number {
    return this.items.length;
  }
}
