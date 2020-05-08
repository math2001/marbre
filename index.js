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

    let tree
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
    render('23 * (alpha+2)^3+beta')
    document.querySelector("#expression").addEventListener("input", (e) => { render(e.target.value) })
}

main()

window.parse = parse