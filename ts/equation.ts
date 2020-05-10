import { assert, objectEqual } from "./utils.js";
import { ParentNode, Node, Leaf, isParentNode } from "./parser.js";

enum childKey {
  left = "left",
  right = "right",
}

export function collectLikeTerms(root: Node, targetTerm: Node): Node {
  if (typeof root === "number" || typeof root === "string") {
    return root;
  }
  const copy = Object.assign({}, root);

  // for each term
  //   if it's equal to x*targetTerm for some x
  //      add x to the collection list
  //   otherwise
  //      add the whole term to the leftover list
  // return sum(x * sum(collections list), ...leftovers)

  return copy;
}

// getMultiple(parse('a*b*x'), x) -> a*b
// very basic, it only works for string target terms (one variable)
// and doesn't support powers yet
export function getMultiple(root: Node, targetTerm: string): Node {
  if (typeof root === "string") {
    if (root === targetTerm) {
      return 1;
    } else {
      return 0;
    }
  } else if (typeof root === "number") {
    return 0;
  }
  //  else if (typeof root === "number") {
  //   if (root === targetTerm) {
  //     return 1;
  //   } else {
  //     // that's a bit more annoying. We could forcefully divide, but fractions
  //     // aren't implemented yet
  //     throw new Error("not implemented: depends on fraction");
  //   }
  // }
  assert(root.operator === "*");

  const bfs = (parent: ParentNode, direction: childKey) => {
    const child = parent[direction];
    assert(isParentNode(child));

    if (child.left === targetTerm) {
      parent[direction] = child.right;
    } else if (child.right === targetTerm) {
      parent[direction] = child.left;
    } else {
      if (isParentNode(child.left)) bfs(child, childKey.left);
      if (isParentNode(child.right)) bfs(child, childKey.left);
    }
  };

  const copy = Object.assign({}, root);
  if (copy.left === targetTerm) {
    return copy.right;
  } else if (copy.right === targetTerm) {
    return copy.left;
  }

  if (isParentNode(copy.left)) bfs(copy, childKey.left);
  if (isParentNode(copy.right)) bfs(copy, childKey.right);

  assert(!objectEqual(copy, root));
  return copy;
}

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

export function getTreeFromTerms(terms: Node[]): Node {
  if (terms.length === 0) {
    return 0;
  }
  if (terms.length === 1) {
    return terms[0];
  }
  let leftNode: ParentNode = {
    left: terms[0],
    operator: "+",
    right: terms[1],
  };

  for (let i = 2; i < terms.length; i++) {
    leftNode = {
      left: leftNode,
      operator: "+",
      right: terms[i],
    };
  }

  return leftNode;
}
