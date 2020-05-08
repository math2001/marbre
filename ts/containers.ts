export class Queue<T> {

    start: number
    end: number
    array: T[]

    constructor(initialLength: number, initialElements: T[] = []) {
        if (initialLength <= initialElements.length) {
            console.error("initial length:", initialLength)
            console.error("initial elements:", initialElements)
            throw new Error("initial length is less than the length of the initial elements")
        }
        this.array = new Array(initialLength)
        for (let i in initialElements) {
            this.array[i] = initialElements[i]
        }
        this.start = 0
        this.end = initialElements.length
    }

    pushright(element: T) {
        if (this.end >= this.array.length - 1) {
            console.error("array length", this.array.length)
            console.error("end", this.end)
            throw new Error("queue wrapping not implemented")
        }

        this.array[this.end] = element
        this.end += 1
    }

    popleft() {
        if (this.empty()) {
            throw new Error("queue is empty")
        }
        const object = this.array[this.start]
        delete this.array[this.start]
        this.start += 1
        return object
    }

    empty() {
        return this.start === this.end
    }
}

export class Stream<T> {

    items: T[]
    index: number
    length: number

    constructor(items: T[]) {
        this.items = items
        this.index = 0
        this.length = this.items.length
    }

    consume() {
        if (this.index + 1 > this.length) {
            return null
        }
        this.index += 1
        return this.items[this.index - 1]
    }

    peek() {
        if (this.index + 1 > this.length) {
            return null
        }
        return this.items[this.index]
    }

    preview() {
        return this.items.slice(this.index, this.length)
    }
}