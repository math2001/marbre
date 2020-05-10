import { assert } from "./utils.js";
import { Stream, StringStream } from "./containers.js";

const asciiLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const digits = "1234567890";

export enum TYPE {
  OPERATOR = "operator",
  LITERAL_NUMBER = "literal number",
  IDENTIFIER = "identifier",

  OPEN_BRACKET = "open_bracket",
  CLOSED_BRACKET = "closed_bracket",

  COMPARATOR = "comparator", // =, <=, >=, >, <
}

export interface Token {
  // FIXME: make this into an enum?
  type: TYPE;
  value: number | string;
}

export function tokenizeExpressionStream(chars: StringStream): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let char: string | null;

  while (i < 1e6) {
    i++;
    char = chars.consume();
    if (char === null) {
      return tokens;
    }

    if (digits.includes(char)) {
      // TODO: support floats
      tokens.push({
        type: TYPE.LITERAL_NUMBER,
        value: parseInt(consumeAllowedCharacters(chars, char, digits)),
      });
    } else if (asciiLetters.includes(char)) {
      tokens.push({
        type: TYPE.IDENTIFIER,
        value: consumeAllowedCharacters(chars, char, digits + asciiLetters),
      });
    } else if ("><=".includes(char)) {
      tokens.push({
        type: TYPE.COMPARATOR,
        value: consumeAllowedCharacters(chars, char, "><="),
      });
    } else if (char === "(") {
      tokens.push({ type: TYPE.OPEN_BRACKET, value: char });
    } else if (char === ")") {
      tokens.push({ type: TYPE.CLOSED_BRACKET, value: char });
    } else if ("*+-/^".includes(char)) {
      tokens.push({ type: TYPE.OPERATOR, value: char });
    }
  }

  throw new Error("too many loops");
}

export function tokenize(expression: string): Token[] {
  return tokenizeExpressionStream(new StringStream(expression));
}

function consumeAllowedCharacters(
  chars: StringStream,
  firstChar: string,
  allowedCharacters: string
): string {
  assert(
    firstChar.length === 1,
    `first char '${firstChar}' should have length 1`
  );

  let i = 0;
  let token: string[] = [firstChar];
  let next: string | null;

  while (i < 1000) {
    i++;
    next = chars.peek();

    if (next === null) {
      return token.join("");
    }

    if (allowedCharacters.includes(next)) {
      chars.consume();
      token.push(next);
    } else {
      return token.join("");
    }
  }

  throw new Error(
    `token length expected to be less than 1000 digits long (allowed characters: ${allowedCharacters})`
  );
}
