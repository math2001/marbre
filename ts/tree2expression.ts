import { Node } from "./parser.js";

export function tree2expression(node: Node | string | number): string {
  if (typeof node === "string" || typeof node === "number") {
    return `${node}`;
  }

  return `(${tree2expression(node.leftNode)} ${node.operator} ${tree2expression(
    node.rightNode
  )})`;
}
