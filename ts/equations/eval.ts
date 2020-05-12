import { SimpleExpressionKind } from "../equation.js";
import { assert } from "../utils.js";
import { Node, ParentNode, isNumber, isLeaf } from "../parser.js";
import { treeToTerms, termsToTree } from "./tree_conversion.js";

// evalLiteralNumber evaluates all the "naked" constants
// 3a + 2 + 4a + 3 => 3a + 4a + 5
export function evalLiteralNumber(root: Node): Node {
  if (isLeaf(root)) {
    return root;
  }
  if (root.operator === "-" || root.operator === "+") {
    let constant = 0;

    const summands = treeToTerms(root, SimpleExpressionKind.sum);

    const simplifiedSummands: Node[] = [];
    for (let summand of summands) {
      const simplified = evalLiteralNumber(summand);
      if (isNumber(simplified)) {
        constant += simplified;
      } else {
        simplifiedSummands.push(simplified);
      }
    }

    simplifiedSummands.push(constant);
    return termsToTree(simplifiedSummands, SimpleExpressionKind.sum);
  }

  if (root.operator === "*" || root.operator === "/") {
    let constant = 1;

    const factors = treeToTerms(root, SimpleExpressionKind.product);
    const simplifiedFactors: Node[] = [];

    for (let factor of factors) {
      const simplified = evalLiteralNumber(factor);
      if (isNumber(simplified)) {
        constant *= simplified;
      } else {
        simplifiedFactors.push(simplified);
      }
    }
    if (constant === 0) {
      return 0;
    }
    return termsToTree(
      [constant, ...simplifiedFactors],
      SimpleExpressionKind.product
    );
  }

  throw new Error(`operator not supported ${root.operator}`);
}

// adds/multiplies the naked literal number (not multiplied by an identifier)
export function evalLiteralNumberInSimpleExpression(
  terms: Node[],
  sek: SimpleExpressionKind
): Node[] {
  let coefficient: number = 0;
  const leftOverFactors: (ParentNode | string)[] = [];

  if (sek === SimpleExpressionKind.product) {
    coefficient = 1;
  } else {
    assert(sek === SimpleExpressionKind.sum);
  }

  for (let term of terms) {
    if (isNumber(term)) {
      if (sek === SimpleExpressionKind.product) coefficient *= term;
      else coefficient += term;
    } else {
      leftOverFactors.push(term);
    }
  }

  if (coefficient === 0) {
    if (sek === SimpleExpressionKind.product) {
      return [];
    }
    return leftOverFactors;
  }

  // these two expressions are equivalent mathematically, but they are more
  // intuitive to see. We usualy have:
  //   2ab and not ab*2
  //   a + b + 2 and not 2 + a + b
  if (sek === SimpleExpressionKind.product) {
    return [coefficient, ...leftOverFactors];
  } else {
    return [...leftOverFactors, coefficient];
  }
}
