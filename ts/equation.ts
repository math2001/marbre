import { assert, objectEqual } from "./utils.js";
import { Node, parse } from "./parser.js";

export function getTermsFromTree(
  tree: Node | string | number
): (Node | string | number)[] {
  const terms: (Node | string | number)[] = [];

  const collect = (node: Node | string | number) => {
    if (typeof node === "string" || typeof node === "number") {
      terms.push(node);
    } else if (node.operator === "+") {
      collect(node.leftNode);
      collect(node.rightNode);
    } else if (node.operator === "-") {
      collect(node.leftNode);
      collect(negateTerm(node.rightNode));
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
export function negateTerm(
  node: Node | string | number
): Node | string | number {
  if (typeof node === "string") {
    return {
      leftNode: -1,
      operator: "*",
      rightNode: node,
    };
  } else if (typeof node === "number") {
    return node * -1;
  }

  const copy = Object.assign({}, node);
  const tryToNegateNumber = (node: Node): boolean => {
    // return true if it did negate a number (so that the chain can stop negating)

    if (node.operator !== "*" && node.operator !== "/") {
      return false;
    }

    if (typeof node.leftNode === "number") {
      node.leftNode = -node.leftNode;
      return true;
    }

    if (typeof node.leftNode !== "string" && tryToNegateNumber(node.leftNode)) {
      return true;
    }

    if (typeof node.rightNode === "number") {
      node.rightNode = -node.rightNode;
      return true;
    }

    if (
      typeof node.rightNode !== "string" &&
      tryToNegateNumber(node.rightNode)
    ) {
      return true;
    }
    return false;
  };

  if (!tryToNegateNumber(copy)) {
    // couldn't find a number to negate the entire term
    return {
      leftNode: -1,
      operator: "*",
      rightNode: copy,
    };
  }
  return copy;
}
