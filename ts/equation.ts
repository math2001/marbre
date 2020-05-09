import { assert, objectEqual } from "./utils.js";
import { Node } from "./parser.js";

export function getTermsFromTree(
  tree: Node | string | number
): (Node | string | number)[] {
  const terms: (Node | string | number)[] = [];

  const collector = (node: Node | string | number) => {
    if (typeof node === "string" || typeof node === "number") {
      terms.push(node);
    } else if (node.operator === "+") {
      collector(node.leftNode);
      collector(node.rightNode);
    } else if (node.operator === "-") {
      collector(node.leftNode);
      collector({
        leftNode: -1,
        operator: "*",
        rightNode: node.rightNode,
      });
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

  collector(tree);
  return terms;
}

// export function negateTerm();
