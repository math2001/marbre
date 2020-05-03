const TYPE_OPERATOR = "operator"

const TYPE_LITERAL_NUMBER = "literal number"
const TYPE_IDENTIFIER = "identifier"

const TYPE_OPEN_BRACKET = 'open_bracket'
const TYPE_CLOSED_BRACKET = 'closed_bracket'

const asciiLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
const digits = '1234567890'

function tokenize(expression) {
    const tokens = []
    let currentToken = null;
    // add a space to add the final currentToken if there is one.
    for (let char of expression + ' ') {
        if (currentToken === null) {
            if (digits.includes(char)) {
                currentToken = {
                    type: TYPE_LITERAL_NUMBER,
                    value: char
                }
                continue

            } else if (asciiLetters.includes(char)) {
                currentToken = {
                    type: TYPE_IDENTIFIER,
                    value: char
                }
                continue
            }
        } else if (asciiLetters.includes(char)) {
            if (currentToken.type === TYPE_IDENTIFIER) {
                currentToken.value += char
            } else {
                console.error(currentToken)
                throw new Error(`ascii letters not allowed in ${currentToken.type}`)
            }
            continue
        } else if (digits.includes(char)) {
            if (currentToken.type === TYPE_LITERAL_NUMBER || currentToken.type === TYPE_IDENTIFIER) {
                currentToken.value += char
            } else {
                console.error(currentToken)
                throw new Error(`digits not allowed in ${currentToken.type}`)
            }
            continue
        }
        else {
            // it's another type of character (ie the current token is finished)
            // so we add the current token to the list
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
        } else if ('+-*/^'.includes(char)) {
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
            throw new Error(`'${char}' not allowed anywhere in an expression`)
        }
    }
    return tokens
}

const bindingPowers = {
    '+': 10,
    '-': 10,
    '*': 20,
    '/': 20,
    '^': 30
}

const rightAssociative = ['^']

function greaterBindingPower(operator, lastOperator) {
    if (lastOperator === null) {
        return true
    }
    assert(typeof operator === "string")
    assert(typeof lastOperator === "string")

    return bindingPowers[operator] > bindingPowers[lastOperator] || (operator == lastOperator && rightAssociative.includes(operator))
}

function parse(tokens, lastOperator=null) {
    const first = tokens.consume()
    if (first === null) {
        throw new Error("end of expression")
    }
    let leftNode;
    if (first.type === TYPE_OPEN_BRACKET) {
        leftNode = parse(tokens, null)
    } else if (first.type === TYPE_LITERAL_NUMBER || first.type === TYPE_IDENTIFIER) {
        leftNode = first.value
    } else {
        console.error("token", first)
        throw new Error(`expected literal number, open bracket or identifier`)
    }

    let i = 0

    while (i < 100) {
        i++
        const nextToken = tokens.peek()
        if (nextToken === null) {
            return leftNode
        }

        if (nextToken.type !== TYPE_OPERATOR
            && nextToken.type !== TYPE_CLOSED_BRACKET
            && nextToken.type !== TYPE_IDENTIFIER
            && nextToken.type !== TYPE_LITERAL_NUMBER
            && nextToken.type !== TYPE_OPEN_BRACKET) {
            console.log('nextToken', nextToken)
            throw new Error("invalid token type")
        }

        if (nextToken.type === TYPE_OPEN_BRACKET) {
            leftNode = {
                leftNode: leftNode,
                operator: '*',
                rightNode: parse(tokens, null)
            }
        } else if (nextToken.type === TYPE_CLOSED_BRACKET) {
            tokens.consume()
            return leftNode
        } else if (nextToken.type === TYPE_IDENTIFIER || nextToken.type === TYPE_LITERAL_NUMBER) {
            leftNode = {
                leftNode: leftNode,
                operator: '*',
                rightNode: parse(tokens, nextToken.value)
            }
        } else if (nextToken.type === TYPE_OPERATOR && greaterBindingPower(nextToken.value, lastOperator)) {
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

    elements.tokens.textContent = JSON.stringify(tokens.map(token => token.value), null)

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

render('alpha beta + 1')

document.querySelector("#expression").addEventListener("input", (e) => {render(e.target.value)})

function assert(condition) {
    if (!condition) {
        throw new Error("assertion error")
    }
}