import { Node, isNumber, isLeaf } from "./parser.js";

export function tree2expression(node: Node): string {
  if (isLeaf(node)) {
    return `${node}`;
  }

  return `(${tree2expression(node.left)} ${node.operator} ${tree2expression(
    node.right
  )})`;
}
