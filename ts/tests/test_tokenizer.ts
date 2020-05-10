import { TYPE, tokenize, Token } from "../tokenizer.js";
import { testTable } from "./test.js";
import { pprint } from "../utils.js";

export function testTokenizer() {
  const table = [
    {
      arguments: ["102 + 23498 > -20"],
      output: [
        { type: TYPE.LITERAL_NUMBER, value: 102 },
        { type: TYPE.OPERATOR, value: "+" },
        { type: TYPE.LITERAL_NUMBER, value: 23498 },
        { type: TYPE.COMPARATOR, value: ">" },
        { type: TYPE.OPERATOR, value: "-" },
        { type: TYPE.LITERAL_NUMBER, value: 20 },
      ],
    },
    {
      arguments: ["1 * 3 >= 2"],
      output: [
        { type: TYPE.LITERAL_NUMBER, value: 1 },
        { type: TYPE.OPERATOR, value: "*" },
        { type: TYPE.LITERAL_NUMBER, value: 3 },
        { type: TYPE.COMPARATOR, value: ">=" },
        { type: TYPE.LITERAL_NUMBER, value: 2 },
      ],
    },
    {
      arguments: ["(alpha1 + alpha2) x ^ 2 * pi ^ 23 = x ^ 2 - y ^ 3 >= e^x"],
      output: [
        { type: TYPE.OPEN_BRACKET, value: "(" },
        { type: TYPE.IDENTIFIER, value: "alpha1" },
        { type: TYPE.OPERATOR, value: "+" },
        { type: TYPE.IDENTIFIER, value: "alpha2" },
        { type: TYPE.CLOSED_BRACKET, value: ")" },
        { type: TYPE.IDENTIFIER, value: "x" },
        { type: TYPE.OPERATOR, value: "^" },
        { type: TYPE.LITERAL_NUMBER, value: 2 },
        { type: TYPE.OPERATOR, value: "*" },
        { type: TYPE.IDENTIFIER, value: "pi" },
        { type: TYPE.OPERATOR, value: "^" },
        { type: TYPE.LITERAL_NUMBER, value: 23 },
        { type: TYPE.COMPARATOR, value: "=" },
        { type: TYPE.IDENTIFIER, value: "x" },
        { type: TYPE.OPERATOR, value: "^" },
        { type: TYPE.LITERAL_NUMBER, value: 2 },
        { type: TYPE.OPERATOR, value: "-" },
        { type: TYPE.IDENTIFIER, value: "y" },
        { type: TYPE.OPERATOR, value: "^" },
        { type: TYPE.LITERAL_NUMBER, value: 3 },
        { type: TYPE.COMPARATOR, value: ">=" },
        { type: TYPE.IDENTIFIER, value: "e" },
        { type: TYPE.OPERATOR, value: "^" },
        { type: TYPE.IDENTIFIER, value: "x" },
      ],
    },
    {
      arguments: ["3a+3(b+3)"],
      output: tokenize("3 a + 3 (b + 3)"),
    },
  ];
  // return testTable(tokenize, table, (tokens: Token[]) => JSON.stringify(tokens.map((token: Token) => token.value)))
  // return testTable(tokenize, table, (tokens: Token[]) => JSON.stringify(tokens.map((token: Token) => token.type)))
  return testTable(tokenize, table);
}
