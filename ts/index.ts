import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { assert } from "./utils.js";
import { tree2expression } from "./tree2expression.js";

function render(expression: string) {
  const elements = {
    expression: document.querySelector("#expression"),
    tokens: document.querySelector("#tokens"),
    tree: document.querySelector("#tree"),
    explicitExpression: document.querySelector("#explicit-expression"),
    // terms: document.querySelector("#terms")
  };
  assert(elements.expression instanceof HTMLInputElement);
  assert(elements.tokens instanceof HTMLElement);
  assert(elements.tree instanceof HTMLElement);
  assert(elements.explicitExpression instanceof HTMLElement);
  // assert(elements.terms instanceof HTMLElement)

  elements.expression.value = expression;

  let tree, tokens, explicitExpression;
  try {
    tokens = tokenize(expression);
  } catch (e) {
    elements.tokens.innerHTML = `<span class="error">${e}</span>`;
    throw e;
  }
  elements.tokens.innerHTML = JSON.stringify(
    tokens.map((token) => token.value)
  );
  try {
    tree = parse(expression);
  } catch (e) {
    elements.tree.innerHTML = `<span class="error">${e}</span>`;
    console.error(e);
    return;
  }
  elements.tree.textContent = JSON.stringify(tree, null, 2);

  try {
    explicitExpression = tree2expression(tree);
  } catch (e) {
    elements.explicitExpression.innerHTML = `<span class="error">${e}</span>`;
    console.error(e);
    return;
  }
  elements.explicitExpression.textContent = explicitExpression;
}

function main() {
  render("3(a+b)+3");
  // @ts-ignore
  document.querySelector("#expression").addEventListener("input", (e) => {
    // @ts-ignore
    render(e.target.value);
  });
}

main();
