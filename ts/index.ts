import { tokenize } from './tokenizer.js'
import { parse } from './parser.js'

function render(expression) {
    const elements = {
        expression: document.querySelector("#expression"),
        tokens: document.querySelector("#tokens"),
        tree: document.querySelector("#tree"),
        terms: document.querySelector("#terms")
    }
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
    document.querySelector("#expression").addEventListener("input", (e) => { render(e.target.value) })
}

main()