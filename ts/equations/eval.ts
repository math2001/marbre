import { SimpleExpressionKind } from "../equation.js";
import { assert } from "../utils.js";
import { Node, ParentNode, isNumber, isLeaf, isParentNode } from "../parser.js";
import { treeToTerms, termsToTree } from "./tree_conversion.js";

// evalLiteralNumber evaluates all the "naked" constants
// 3a + 2 + 4a + 3 => 3a + 4a + 5
export function evalLiteralNumber(root: Node): Node {
  // FIXME: this second condition shouldn't be required once fractions are implemented
  if (
    isLeaf(root) ||
    (isParentNode(root) && root.operator === "/" && root.left === 1)
  ) {
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
