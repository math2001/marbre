const TYPE_OPERATOR = "operator"

const TYPE_LITERAL_NUMBER = "literal number"

const TYPE_OPEN_BRACKET = 'open_bracket'
const TYPE_CLOSED_BRACKET = 'closed_bracket'

function tokenize(expression) {
    const tokens = []
    let currentToken = null;
    // add a space to add the final currentToken if there is one.
    for (let char of expression + ' ') {
        if ('1234567890'.includes(char)) {
            if (currentToken === null) {
                currentToken = {
                    type: TYPE_LITERAL_NUMBER,
                    value: char
                }
            } else if (currentToken.type === TYPE_LITERAL_NUMBER) {
                currentToken.value += char
            }tokens
            continue
        }
        if (currentToken !== null) {
            if (currentToken.type === TYPE_LITERAL_NUMBER) {
                tokens.push({
                    type: TYPE_LITERAL_NUMBER,
                    value: parseInt(currentToken.value)
                })
            } else {
                tokens.push(currentToken)
            }
            currentToken = null
        }

        if (' '.includes(char)) {
            // ignore
        } else if ('+-*/'.includes(char)) {
            tokens.push({
                value: char,
                type: TYPE_OPERATOR
            })
        } else if (char === '(') {
            tokens.push({
                value: char,
                type: TYPE_OPEN_BRACKET
            })
        } else if (char === ')') {
            tokens.push({
                value: char,
                type: TYPE_CLOSED_BRACKET
            })
        } else {
            throw new Error(`invalid char '${char}'`)
        }
    }
    return tokens
}

bindingPowers = {
    '+': 10,
    '-': 10,
    '*': 20,
    '/': 20,
    // '^': 
}

function greaterBindingPower(operator, lastOperator) {
    if (lastOperator === null) {
        return true
    }
    if (typeof operator !== "string" || typeof lastOperator !== "string") {
        throw new Error("not a string operator", operator, lastOperator)
    }
    return bindingPowers[operator] > bindingPowers[lastOperator]
}

function parse(tokens, lastOperator) {
    const first = tokens.consume()

    if (first.type !== TYPE_LITERAL_NUMBER) {
        console.error("token", first)
        throw new Error(`expected literal number`)
    }

    let leftNode = first.value
    let i = 0

    while (i < 100) {
        i++
        const nextToken = tokens.peek()
        if (nextToken !== null && nextToken.type === TYPE_OPERATOR && greaterBindingPower(nextToken.value, lastOperator)) {
            tokens.consume()
            leftNode = {
                leftNode: leftNode,
                operator: nextToken.value,
                rightNode: parse(tokens, nextToken.value)
            }
        } else {
            return leftNode
        }
    }
}


function render(expression) {
    const elements = {
        expression: document.querySelector("#expression"),
        tokens: document.querySelector("#tokens"),
        tree: document.querySelector("#tree"),
    }
    elements.expression.value = expression

    let tokens, tree

    try {
        tokens = tokenize(expression)
    } catch (e) {
        elements.tokens.innerHTML = `<span class="error">${e}</span>`
        console.error(e)
        return
    }

    elements.tokens.textContent = JSON.stringify(tokens, null, 2)

    try {
        tree = parse(new Stream(tokens), null)
    } catch (e) {
        elements.tree.innerHTML = `<span class="error">${e}</span>`
        console.error(e)
        return
    }
    elements.tree.textContent = JSON.stringify(tree, null, 2)
}


class Stream {
    constructor(tokens) {
        this.tokens = tokens
        this.index = 0
        this.length = this.tokens.length
    }

    consume() {
        if (this.index + 1 > this.length) {
            return null
        }
        this.index += 1
        return this.tokens[this.index - 1]
    }

    peek() {
        if (this.index + 1 > this.length) {
            return null
        }
        return this.tokens[this.index]
    }

    preview() {
        return JSON.stringify(this.tokens.map(e => e.value).slice(this.index, this.length))
    }

}

render("4 + 2 * 3 ** 3")

document.querySelector("#expression").addEventListener("input", (e) => {render(e.target.value)})