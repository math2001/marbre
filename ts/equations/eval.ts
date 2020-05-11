import { SimpleExpressionKind } from "../equation.js";
import { assert } from "../utils.js";
import { Node, ParentNode, isNumber } from "../parser.js";

// evalLiteralNumber evaluates as much as is mathematically possible
export function evalLiteralNumber(root: Node): Node {
  return root;
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
    if (isNumber(term) {
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
