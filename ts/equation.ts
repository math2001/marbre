import { assert, objectEqual } from "./utils.js";
import { ParentNode, Node, parse } from "./parser.js";

export function getTermsFromTree(tree: Node): Node[] {
  const terms: Node[] = [];

  const collect = (node: Node) => {
    if (typeof node === "string" || typeof node === "number") {
      terms.push(node);
    } else if (node.operator === "+") {
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
  };

  collect(tree);
  return terms;
}

// this function look in the tree if it can't find a number which we can replace
// with -number to negate the entire term so that we don't have an ugly -1 *
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
  const tryToNegateNumber = (node: ParentNode): boolean => {
    // return true if it did negate a number (so that the chain can stop negating)

    if (node.operator !== "*" && node.operator !== "/") {
      return false;
    }

    if (typeof node.left === "number") {
      node.left = -node.left;
      return true;
    }

    if (typeof node.left !== "string" && tryToNegateNumber(node.left)) {
      return true;
    }

    if (typeof node.right === "number") {
      node.right = -node.right;
      return true;
    }

    if (typeof node.right !== "string" && tryToNegateNumber(node.right)) {
      return true;
    }
    return false;
  };

  if (!tryToNegateNumber(copy)) {
    // couldn't find a number to negate the entire term
    return {
      left: -1,
      operator: "*",
      right: copy,
    };
  }
  return copy;
}
