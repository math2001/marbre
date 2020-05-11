// this function look in the tree if it can't find a number which we can replace
// with -number to negate the entire term so that we don't have an ugly -1 *

import { isParentNode, Node, ParentNode, ChildKey } from "../parser.js";
import { assert } from "../utils.js";
import { termsToTree } from "./tree_conversion.js";
import { SimpleExpressionKind } from "../equation.js";

// Node operation.
export function negateTerm(node: Node): Node {
  if (typeof node === "string") {
    return {
      left: -1,
      operator: "*",
      right: node,
    };
  } else if (typeof node === "number") {
    return node * -1;
  }

  const copy = Object.assign({}, node);

  const tryToNegateNumber = (
    parent: ParentNode,
    direction: ChildKey
  ): boolean => {
    // return true if it did negate a number (so that the chain can stop negating)

    const node = parent[direction];
    assert(isParentNode(node));

    if (node.operator !== "*" && node.operator !== "/") {
      return false;
    }

    if (typeof node.left === "number") {
      // if there is a * -1, then we just remove the -1
      if (node.left === -1) {
        parent[direction] = node.right;
      } else {
        node.left = -node.left;
      }
      return true;
    }

    if (
      typeof node.left !== "string" &&
      tryToNegateNumber(node, ChildKey.left)
    ) {
      return true;
    }

    if (typeof node.right === "number") {
      if (node.right === -1) {
        parent[direction] = node.left;
      } else {
        node.right = -node.right;
      }
      return true;
    }

    if (
      typeof node.right !== "string" &&
      tryToNegateNumber(node, ChildKey.right)
    ) {
      return true;
    }
    return false;
  };

  // use a parent like this so that the child can change copy (which is a node)
  // to be a string or a number
  const parent = {
    left: 0, // this will be ignore anyway, look at the return statement
    operator: "+",
    right: copy,
  };

  if (!tryToNegateNumber(parent, ChildKey.right)) {
    // couldn't find a number to negate the entire term
    return {
      left: -1,
      operator: "*",
      right: copy,
    };
  }
  return parent.right;
}

export function expand(root: Node): Node {
  // for now, we just expand multiplications, not exponents

  const dfs = (node: Node): Node[] => {
    // dfs returns the list of expanded terms in a product or in a sum
    if (typeof node === "string" || typeof node === "number") {
      return [node];
    } else if (node.operator === "+") {
      return [...dfs(node.left), ...dfs(node.right)];
    } else if (node.operator === "-") {
      return [...dfs(node.left), ...dfs(negateTerm(node.right))];
    } else if (node.operator === "*" || node.operator === "/") {
      const leftTerms = dfs(node.left);
      const rightTerms = dfs(node.right);
      const terms: ParentNode[] = [];

      // multiply every term in LHS with each term on RHS
      for (let leftTerm of leftTerms) {
        for (let rightTerm of rightTerms) {
          terms.push({
            left: leftTerm,
            operator: node.operator,
            right: rightTerm,
          });
        }
      }

      return terms;
    } else if (node.operator === "^") {
      throw new Error("exponenents not supported yet");
    } else {
      throw new Error(`unknown operator ${node.operator}`);
    }
  };
  return termsToTree(dfs(root), SimpleExpressionKind.sum);
}
