import { assert } from "./utils.js";
import { TYPE, tokenize, Token } from "./tokenizer.js";
import { Stream } from "./containers.js";

const bindingPowers: { [key: string]: number } = {
  "+": 10,
  "-": 10,
  "*": 20,
  "/": 20,
  "^": 30,
};

const rightAssociative: string[] = ["^"];

export type Leaf = number | string;
export type Node = Leaf | ParentNode;
export interface ParentNode {
  left: Node;
  right: Node;
  operator: string;
}

export enum ChildKey {
  left = "left",
  right = "right",
}

function greaterBindingPower(
  operator: string,
  lastOperator: string | null
): boolean {
  if (lastOperator === null) {
    return true;
  }
  assert(bindingPowers[operator] !== undefined, `operator: ${operator}`);
  assert(
    bindingPowers[lastOperator] !== undefined,
    `lastOperator: ${lastOperator}`
  );

  return (
    bindingPowers[operator] > bindingPowers[lastOperator] ||
    (operator == lastOperator && rightAssociative.includes(operator))
  );
}

export function parseTokenStream(
  tokens: Stream<Token>,
  lastOperator: string | null = null
): Node {
  const first = tokens.consume();
  if (first === null) {
    throw new Error("end of expression");
  }

  let leftNode: Node;
  if (first.type === TYPE.OPEN_BRACKET) {
    // last operator is null because what's within a bracket is an independent expression
    leftNode = parseTokenStream(tokens, null);
    const next = tokens.consume();
    assert(next !== null);
    assert(next.type === TYPE.CLOSED_BRACKET);
  } else if (
    first.type === TYPE.LITERAL_NUMBER ||
    first.type === TYPE.IDENTIFIER
  ) {
    leftNode = first.value;
  } else if (first.type === TYPE.OPERATOR && first.value === "-") {
    const nextToken = tokens.peek();

    if (!nextToken) {
      throw new Error("end of expression after -");
    }

    if (
      nextToken.type === TYPE.LITERAL_NUMBER ||
      nextToken.type === TYPE.IDENTIFIER
    ) {
      let right = parseTokenStream(tokens, "*");
      if (typeof right === "number") {
        leftNode = -right;
      } else {
        leftNode = {
          left: -1,
          operator: "*",
          right: right,
        };
      }
    } else if (nextToken.type === TYPE.OPEN_BRACKET) {
      // make sure that we don't consume here, because the following parse call needs
      // the opening bracket
      leftNode = {
        left: -1,
        operator: "*",
        right: parseTokenStream(tokens, null),
      };
    } else {
      console.error("token", nextToken);
      throw new Error("unexpected token after -");
    }
  } else {
    console.error("token", first);
    throw new Error(`expected literal number, open bracket or identifier`);
  }

  let i = 0;

  while (i < 100) {
    i++;
    const nextToken = tokens.peek();
    if (nextToken === null || nextToken.type == TYPE.CLOSED_BRACKET) {
      return leftNode;
    }

    if (
      nextToken.type === TYPE.OPEN_BRACKET &&
      greaterBindingPower("*", lastOperator)
    ) {
      leftNode = {
        left: leftNode,
        operator: "*",
        right: parseTokenStream(tokens, "*"),
      };
    } else if (
      (nextToken.type === TYPE.IDENTIFIER ||
        nextToken.type === TYPE.LITERAL_NUMBER) &&
      greaterBindingPower("*", lastOperator)
    ) {
      leftNode = {
        left: leftNode,
        operator: "*",
        right: parseTokenStream(tokens, "*"),
      };
    } else if (nextToken.type === TYPE.OPERATOR) {
      assert(typeof nextToken.value === "string");

      if (greaterBindingPower(nextToken.value, lastOperator)) {
        tokens.consume();
        leftNode = {
          left: leftNode,
          operator: nextToken.value,
          right: parseTokenStream(tokens, nextToken.value),
        };
      } else {
        return leftNode;
      }
    } else {
      return leftNode;
    }
  }

  throw new Error("too many iterations");
}

export function parse(expression: string): Node {
  return parseTokenStream(new Stream(tokenize(expression)));
}

export function isParentNode(node: Node): node is ParentNode {
  return (
    typeof node !== "number" &&
    typeof node !== "string" &&
    "left" in node &&
    "right" in node &&
    "operator" in node
  );
}

export function isLeaf(node: Node): node is Leaf {
  return typeof node === "number" || typeof node === "string";
}
