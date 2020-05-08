import { assert } from "./utils";

const asciiLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
const digits = '1234567890'

export enum TYPE {
    OPERATOR = "operator",
    LITERAL_NUMBER = "literal number",
    IDENTIFIER = "identifier",

    OPEN_BRACKET = 'open_bracket',
    CLOSED_BRACKET = 'closed_bracket',
}

export interface Token {
    // FIXME: make this into an enum?
    type: TYPE,
    value: number | string,
}

export function tokenize(expression: string) {
    const tokens: Token[] = []
    let currentToken: {
        type: TYPE,
        value: string
    } | null = null;

    // add a space to add the final currentToken if there is one.
    for (let char of expression + ' ') {
        if (currentToken === null) {
            if (digits.includes(char)) {
                currentToken = {
                    type: TYPE.LITERAL_NUMBER,
                    value: char
                }
                continue

            } else if (asciiLetters.includes(char)) {
                currentToken = {
                    type: TYPE.IDENTIFIER,
                    value: char
                }
                continue
            }

        } else if (asciiLetters.includes(char)) {
            if (currentToken.type === TYPE.IDENTIFIER) {
                currentToken.value += char
            } else if (currentToken.type === TYPE.LITERAL_NUMBER) {
                // we are a case like 3alpha and we want 3 "alpha"
                tokens.push({
                    type: TYPE.LITERAL_NUMBER,
                    value: parseInt(currentToken.value)
                })
                currentToken = {
                    type: TYPE.IDENTIFIER,
                    value: char
                }
            } else {
                console.error(currentToken)
                throw new Error(`ascii letters not allowed in ${currentToken.type}`)
            }
            continue
        } else if (digits.includes(char)) {
            if (currentToken.type === TYPE.LITERAL_NUMBER || currentToken.type === TYPE.IDENTIFIER) {
                currentToken.value += char
            } else {
                console.error(currentToken)
                throw new Error(`digits not allowed in ${currentToken.type}`)
            }
            continue
        } else {
            // it's another type of character (ie the current token is finished)
            // so we add the current token to the list
            if (currentToken.type === TYPE.LITERAL_NUMBER) {
                tokens.push({
                    type: TYPE.LITERAL_NUMBER,
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
                type: TYPE.OPERATOR
            })
        } else if (char === ')') {
            tokens.push({
                value: char,
                type: TYPE.CLOSED_BRACKET
            })
        } else if (char === '(') {
            tokens.push({
                value: '(',
                type: TYPE.OPEN_BRACKET
            })
        } else {
            throw new Error(`'${char}' not allowed anywhere in an expression`)
        }
    }
    return tokens
}
