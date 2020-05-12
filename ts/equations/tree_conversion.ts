import { SimpleExpressionKind } from "../equation.js";
import { assert } from "../utils.js";
import { Node, ParentNode, isIdentifier, isNumber } from "../parser.js";
import { negateTerm } from "./manipulators.js";

export function termsToTree(terms: Node[], sek: SimpleExpressionKind): Node {
  if (terms.length === 0) {
    return 0;
  }
  if (terms.length === 1) {
    return terms[0];
  }

  let operator;
  if (sek === SimpleExpressionKind.product) {
    operator = "*";
  } else {
    operator = "+";
  }

  let leftNode: ParentNode = {
    left: terms[0],
    operator: operator,
    right: terms[1],
  };

  for (let i = 2; i < terms.length; i++) {
    leftNode = {
      left: leftNode,
      operator: operator,
      right: terms[i],
    };
  }

  return leftNode;
}

export function treeToTerms(tree: Node, sek: SimpleExpressionKind): Node[] {
  const terms: Node[] = [];

  const collect = (node: Node) => {
    if (isIdentifier(node) || isNumber(node)) {
      terms.push(node);
      return;
    }

    if (sek === SimpleExpressionKind.sum) {
      if (node.operator === "+") {
        collect(node.left);
        collect(node.right);
      } else if (node.operator === "-") {
        collect(node.left);
        collect(negateTerm(node.right));
      } else if (
        node.operator === "*" ||
        node.operator === "^" ||
        node.operator === "/"
      ) {
        terms.push(node);
      } else {
        console.error("node", node);
        throw new Error("unexpected node operator");
      }
    } else if (sek === SimpleExpressionKind.product) {
      if (node.operator === "*") {
        collect(node.left);
        collect(node.right);
      } else if (node.operator === "/") {
        collect(node.left);
        collect({
          left: 1,
          operator: "/",
          right: node.right,
        });
      } else if (
        node.operator === "^" ||
        node.operator === "+" ||
        node.operator === "-"
      ) {
        terms.push(node);
      } else {
        console.error(node);
        throw new Error(`unknown operator ${node.operator}`);
      }
    }
  };

  collect(tree);
  return terms;
}
