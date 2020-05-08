import { tokenize } from './tokenizer.js'
import { parse } from './parser.js'
import { assert } from './utils.js'

function render(expression: string) {
    const elements = {
        expression: document.querySelector("#expression"),
        tokens: document.querySelector("#tokens"),
        tree: document.querySelector("#tree"),
        // terms: document.querySelector("#terms")
    }
    assert(elements.expression instanceof HTMLInputElement)
    assert(elements.tokens instanceof HTMLElement)
    assert(elements.tree instanceof HTMLElement)
    // assert(elements.terms instanceof HTMLElement)

    elements.expression.value = expression

    let tree, tokens
    try {
        tokens = tokenize(expression)
    } catch (e) {
        elements.tokens.innerHTML = `<span class="error">${e}</span>`
        throw e
    }
    elements.tokens.innerHTML = JSON.stringify(tokens.map(token => token.value))
    try {
        tree = parse(expression)
    } catch (e) {
        elements.tree.innerHTML = `<span class="error">${e}</span>`
        console.error(e)
        return
    }
    elements.tree.textContent = JSON.stringify(tree, null, 2)
}

function main() {
    render('3(a+b)+3')
    // @ts-ignore
    document.querySelector("#expression").addEventListener("input", (e) => { render(e.target.value) })
}

main()