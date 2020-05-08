import { assert } from './utils.js'
import { TYPE, tokenize } from './tokenizer.js'
import { Stream } from './containers.js'

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

export function parseTokenStream(tokens, lastOperator = null) {
    const first = tokens.consume()
    if (first === null) {
        throw new Error("end of expression")
    }
    let leftNode;
    if (first.type === TYPE.OPEN_BRACKET) {
        leftNode = parseTokenStream(tokens, null)
    } else if (first.type === TYPE.LITERAL_NUMBER || first.type === TYPE.IDENTIFIER) {
        leftNode = first.value
    } else if (first.type === TYPE.OPERATOR && first.value === "-") {
        const nextToken = tokens.consume()
        if (!nextToken) {
            throw new Error("end of expression after -")
        }
        if (nextToken.type === TYPE.LITERAL_NUMBER) {
            leftNode = -nextToken.value
        } else if (nextToken.type === TYPE.IDENTIFIER) {
            leftNode = {
                leftNode: -1,
                operator: '*',
                rightNode: nextToken.value
            }
        }
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

        if (nextToken.type !== TYPE.OPERATOR
            && nextToken.type !== TYPE.CLOSED_BRACKET
            && nextToken.type !== TYPE.IDENTIFIER
            && nextToken.type !== TYPE.LITERAL_NUMBER
            && nextToken.type !== TYPE.OPEN_BRACKET) {
            console.error('nextToken', nextToken)
            throw new Error("invalid token type")
        }

        if (nextToken.type === TYPE.OPEN_BRACKET) {
            leftNode = {
                leftNode: leftNode,
                operator: '*',
                rightNode: parseTokenStream(tokens, null)
            }
        } else if (nextToken.type === TYPE.CLOSED_BRACKET) {
            tokens.consume()
            return leftNode
        } else if (nextToken.type === TYPE.IDENTIFIER || nextToken.type === TYPE.LITERAL_NUMBER) {
            leftNode = {
                leftNode: leftNode,
                operator: '*',
                rightNode: parseTokenStream(tokens, nextToken.value)
            }
        } else if (nextToken.type === TYPE.OPERATOR && greaterBindingPower(nextToken.value, lastOperator)) {
            tokens.consume()
            leftNode = {
                leftNode: leftNode,
                operator: nextToken.value,
                rightNode: parseTokenStream(tokens, nextToken.value)
            }
        } else {
            return leftNode
        }
    }

    throw new Error("too many iterations")
}

export function parse(expression) {
    return parseTokenStream(new Stream(tokenize(expression)))
}