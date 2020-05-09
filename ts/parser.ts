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

export interface Node {
  leftNode: Node | number | string;
  rightNode: Node | number | string;
  operator: string;
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
): Node | string | number {
  const first = tokens.consume();
  if (first === null) {
    throw new Error("end of expression");
  }

  let leftNode;
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

    if (nextToken.type === TYPE.LITERAL_NUMBER) {
      leftNode = -nextToken.value;
      tokens.consume();
    } else if (nextToken.type === TYPE.IDENTIFIER) {
      leftNode = {
        leftNode: -1,
        operator: "*",
        rightNode: nextToken.value,
      };
      tokens.consume();
    } else if (nextToken.type === TYPE.OPEN_BRACKET) {
      // make sure that we don't consume here, because the following parse call needs
      // the opening bracket
      leftNode = {
        leftNode: -1,
        operator: "*",
        rightNode: parseTokenStream(tokens, null),
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
        leftNode: leftNode,
        operator: "*",
        rightNode: parseTokenStream(tokens, "*"),
      };
    } else if (
      (nextToken.type === TYPE.IDENTIFIER ||
        nextToken.type === TYPE.LITERAL_NUMBER) &&
      greaterBindingPower("*", lastOperator)
    ) {
      leftNode = {
        leftNode: leftNode,
        operator: "*",
        rightNode: parseTokenStream(tokens, "*"),
      };
    } else if (nextToken.type === TYPE.OPERATOR) {
      assert(typeof nextToken.value === "string");

      if (greaterBindingPower(nextToken.value, lastOperator)) {
        tokens.consume();
        leftNode = {
          leftNode: leftNode,
          operator: nextToken.value,
          rightNode: parseTokenStream(tokens, nextToken.value),
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

export function parse(expression: string): Node | number | string {
  return parseTokenStream(new Stream(tokenize(expression)));
}
