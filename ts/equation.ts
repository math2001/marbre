import { assert, objectEqual, pprint } from "./utils.js";
import { ParentNode, Node, Leaf, isParentNode, isLeaf } from "./parser.js";
import { testGetTreeFromTerm } from "./tests/test_equation.js";
import { tree2expression } from "./tree2expression.js";

enum childKey {
  left = "left",
  right = "right",
}

export enum SimpleExpressionKind {
  product = "product",
  sum = "sum",
}

export function equal(a: Node, b: Node): boolean {
  const termsA = getTermsFromTree(expand(a), SimpleExpressionKind.sum);
  const termsB = getTermsFromTree(expand(b), SimpleExpressionKind.sum);

  // FIXME: implement my own sort. Every element should be sorted the same way
  // every time. Here the sort only does it's job well because we aren't sorting
  // any nodes (only string and integers). Also, .sort() does *in-place* sort.
  const sortedTermsA: Node[][] = new Array(termsA.length);
  for (let i in termsA) {
    sortedTermsA[i] = getTermsFromTree(
      termsA[i],
      SimpleExpressionKind.product
    ).sort();

    for (let term of sortedTermsA[i]) {
      assert(isLeaf(term));
    }
  }
  const sortedTermsB: Node[][] = new Array(termsB.length);
  for (let i in termsA) {
    sortedTermsB[i] = getTermsFromTree(
      termsB[i],
      SimpleExpressionKind.product
    ).sort();

    for (let term of sortedTermsB[i]) {
      assert(isLeaf(term));
    }
  }

  return objectEqual(sortedTermsA.sort(), sortedTermsB.sort());
}

// adds/multiplies the naked literal number (not multiplied by an identifier)
export function evalLiteralNumberInSimpleExpression(
  terms: Leaf[],
  sek: SimpleExpressionKind
): Leaf[] {
  let coefficient: number = 0;
  const identifiers: string[] = [];

  if (sek === SimpleExpressionKind.product) {
    coefficient = 1;
  } else {
    assert(sek === SimpleExpressionKind.sum);
  }

  for (let term of terms) {
    if (typeof term === "number") {
      if (sek === SimpleExpressionKind.product) coefficient *= term;
      else coefficient += term;
    } else {
      identifiers.push(term);
    }
  }

  if (coefficient === 0) {
    if (sek === SimpleExpressionKind.product) {
      return [];
    }
    return identifiers;
  }
  return [coefficient, ...identifiers];
}

// returns a *sorted* array of all the identifiers
export function findAllIdentifiers(root: Node): string[] {
  const identifiers: Set<string> = new Set<string>();
  const dfs = (node: Node) => {
    if (typeof node === "number") {
      return;
    }

    if (typeof node === "string") {
      identifiers.add(node);
      return;
    }

    assert(isParentNode(node));

    dfs(node.left);
    dfs(node.right);
  };
  dfs(root);
  return Array.from(identifiers).sort();
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
  return getTreeFromTerms(dfs(root));
}

export function collectLikeTerms(root: Node, targetTerm: string): Node {
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
  const leftovers: Node[] = [];
  const coefficients: Node[] = [];
  for (let term of getTermsFromTree(root, SimpleExpressionKind.sum)) {
    const multiple = getMultiple(term, targetTerm);
    if (multiple === 0) {
      leftovers.push(term);
    } else {
      coefficients.push(multiple);
    }
  }

  return getTreeFromTerms([
    {
      left: getTreeFromTerms(coefficients),
      operator: "*",
      right: targetTerm,
    },
    ...leftovers,
  ]);
}

// getMultiple(parse('a*b*x'), x) -> a*b
// very basic, it only works for string target terms (one variable)
// and doesn't support powers yet
// FIXME: actually returns wrong result if expression divides by target term
export function getMultiple(root: Node, targetTerm: string): Node {
  assert(targetTerm !== undefined, "target term is undefined");

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
  if (root.operator === "^") {
    throw new Error("support for exponents not implemented");
  }

  assert(root.operator === "*" || root.operator === "/");

  let foundTerm = false;
  const bfs = (parent: ParentNode, direction: childKey) => {
    if (foundTerm) return;
    if (parent.operator === "^") {
      throw new Error("support for exponents not implemented");
    }

    assert(parent.operator === "*" || parent.operator === "/");
    const child = parent[direction];
    assert(isParentNode(child));

    if (child.left === targetTerm) {
      foundTerm = true;
      parent[direction] = child.right;
    } else if (child.right === targetTerm) {
      foundTerm = true;
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

  if (!foundTerm) return 0;

  assert(!objectEqual(copy, root));

  return copy;
}

export function getTermsFromTree(
  tree: Node,
  sek: SimpleExpressionKind
): Node[] {
  const terms: Node[] = [];

  const collect = (node: Node) => {
    if (typeof node === "string" || typeof node === "number") {
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
      assert(
        node.operator !== "+" && node.operator !== "-",
        "+ and - not allowed when finding factors of an expression"
      );
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
      } else if (node.operator === "^") {
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

  const tryToNegateNumber = (
    parent: ParentNode,
    direction: childKey
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
      tryToNegateNumber(node, childKey.left)
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
      tryToNegateNumber(node, childKey.right)
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

  if (!tryToNegateNumber(parent, childKey.right)) {
    // couldn't find a number to negate the entire term
    return {
      left: -1,
      operator: "*",
      right: copy,
    };
  }
  return parent.right;
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
