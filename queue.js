class Queue {
    constructor(initialLength, initialElements=[]) {
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

    pushright(object) {
        if (this.end >= this.array.length - 1) {
            console.error("array length", this.array.length)
            console.error("end", this.end)
            throw new Error("queue wrapping not implemented")
        }

        this.array[this.end] = object
        this.end += 1
    }

    popleft() {
        if (this.empty()) {
            throw new Error("queue is empty")
        }
        const object = this.array[this.start]
        this.array[this.start] = null
        this.start += 1
        return object
    }

    empty() {
        return this.start === this.end
    }
}