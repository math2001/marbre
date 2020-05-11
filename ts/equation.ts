import { assert, objectEqual, pprint } from "./utils.js";
import {
  ParentNode,
  Node,
  ChildKey,
  isParentNode,
  isLeaf,
  isIdentifier,
  isNumber,
} from "./parser.js";
import { tree2expression } from "./tree2expression.js";
import { termsToTree, treeToTerms } from "./equations/tree_conversion.js";
import { evalLiteralNumberInSimpleExpression } from "./equations/eval.js";
import { expand, negateTerm } from "./equations/manipulators.js";

export enum SimpleExpressionKind {
  product = "product",
  sum = "sum",
}

// for now, just support equation with two sides. Probably gonna stay like this for a while
// equation = [lhs, rhs]
export type Equation = [Node, Node];

export function linearSolve(
  lhs: Node,
  rhs: Node,
  targetTerm: string
): Equation[] {
  let general: Node = {
    left: lhs,
    operator: "-",
    right: rhs,
  };

  general = expand(general);

  general = collectLikeTerms(general, targetTerm);

  console.log(tree2expression(general));

  const cancelOutExpression = (root: Node): Node => {
    return termsToTree(
      evalLiteralNumberInSimpleExpression(
        treeToTerms(root, SimpleExpressionKind.sum),
        SimpleExpressionKind.sum
      ),
      SimpleExpressionKind.sum
    );
  };

  if (isIdentifier(general)) {
    return [[general, 0]];
  } else if (isNumber(general)) {
    // no solution, we are in the case 3 = 0
    return [];
  }

  assert(isParentNode(general));

  console.log("general", general);
  console.log("general", tree2expression(general));
  let coefficient: Node;
  let constants: Node;
  const terms = treeToTerms(general, SimpleExpressionKind.sum);
  const firstTerm = terms[0];
  assert(firstTerm !== undefined);
  if (
    isParentNode(firstTerm) &&
    firstTerm.operator === "*" &&
    firstTerm.right === targetTerm
  ) {
    coefficient = cancelOutExpression(firstTerm.left);
    constants = cancelOutExpression(
      termsToTree(terms.slice(1), SimpleExpressionKind.sum)
    );
  } else {
    assert(!findAllIdentifiers(general).includes(targetTerm));
    coefficient = 0;
    constants = general;
  }

  coefficient = cancelOutExpression(coefficient);
  console.log("coefficient", tree2expression(coefficient));
  console.log("constants", tree2expression(constants));

  if (coefficient === 0) {
    console.log("return constant");
    return [[constants, 0]];
  } else if (coefficient === 1) {
    console.log("coeff equals 1");
    return [[targetTerm, negateTerm(constants)]];
  } else {
    console.log("complex solution");
    return [
      [
        targetTerm,
        {
          left: negateTerm(constants),
          operator: "/",
          right: coefficient,
        },
      ],
    ];
  }
}

export function equal(a: Node, b: Node): boolean {
  const termsA = treeToTerms(expand(a), SimpleExpressionKind.sum);
  const termsB = treeToTerms(expand(b), SimpleExpressionKind.sum);

  // FIXME: implement my own sort. Every element should be sorted the same way
  // every time. Here the sort only does it's job well because we aren't sorting
  // any nodes (only string and integers). Also, .sort() does *in-place* sort.
  const sortedTermsA: Node[][] = new Array(termsA.length);
  for (let i in termsA) {
    sortedTermsA[i] = treeToTerms(
      termsA[i],
      SimpleExpressionKind.product
    ).sort();

    for (let term of sortedTermsA[i]) {
      assert(isLeaf(term));
    }
  }
  const sortedTermsB: Node[][] = new Array(termsB.length);
  for (let i in termsA) {
    sortedTermsB[i] = treeToTerms(
      termsB[i],
      SimpleExpressionKind.product
    ).sort();

    for (let term of sortedTermsB[i]) {
      assert(isLeaf(term));
    }
  }

  return objectEqual(sortedTermsA.sort(), sortedTermsB.sort());
}

// returns a *sorted* array of all the identifiers
export function findAllIdentifiers(root: Node): string[] {
  const identifiers: Set<string> = new Set<string>();
  const dfs = (node: Node) => {
    if (isNumber(node)) {
      return;
    }

    if (isIdentifier(node)) {
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

export function collectLikeTerms(root: Node, targetTerm: string): Node {
  if (isNumber(root) || isIdentifier(root)) {
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
  for (let term of treeToTerms(root, SimpleExpressionKind.sum)) {
    const multiple = getMultiple(term, targetTerm);
    if (multiple === 0) {
      leftovers.push(term);
    } else {
      coefficients.push(multiple);
    }
  }

  return termsToTree(
    [
      {
        left: termsToTree(coefficients, SimpleExpressionKind.sum),
        operator: "*",
        right: targetTerm,
      },
      ...leftovers,
    ],
    SimpleExpressionKind.sum
  );
}

// getMultiple(parse('a*b*x'), x) -> a*b
// very basic, it only works for string target terms (one variable)
// and doesn't support powers yet
// FIXME: actually returns wrong result if expression divides by target term
export function getMultiple(root: Node, targetTerm: string): Node {
  assert(targetTerm !== undefined, "target term is undefined");

  if (isIdentifier(root)) {
    if (root === targetTerm) {
      return 1;
    } else {
      return 0;
    }
  } else if (isNumber(root)) {
    return 0;
  }
  //  else if (isNumber(root)) {
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
  const bfs = (parent: ParentNode, direction: ChildKey) => {
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
      if (isParentNode(child.left)) bfs(child, ChildKey.left);
      if (isParentNode(child.right)) bfs(child, ChildKey.left);
    }
  };

  const copy = Object.assign({}, root);
  if (copy.left === targetTerm) {
    return copy.right;
  } else if (copy.right === targetTerm) {
    return copy.left;
  }

  if (isParentNode(copy.left)) bfs(copy, ChildKey.left);
  if (isParentNode(copy.right)) bfs(copy, ChildKey.right);

  if (!foundTerm) return 0;

  assert(!objectEqual(copy, root));

  return copy;
}
