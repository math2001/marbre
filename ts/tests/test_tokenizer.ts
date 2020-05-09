import { TYPE, tokenize } from "../tokenizer.js";
import { testTable } from "./test.js";

export function testTokenizer() {
  const table = [
    {
      arguments: ["1 + 2"],
      output: [
        { type: TYPE.LITERAL_NUMBER, value: 1 },
        { type: TYPE.OPERATOR, value: "+" },
        { type: TYPE.LITERAL_NUMBER, value: 2 },
      ],
    },
    {
      arguments: ["(alpha1 + alpha2) * pi ^ 23"],
      output: [
        { type: TYPE.OPEN_BRACKET, value: "(" },
        { type: TYPE.IDENTIFIER, value: "alpha1" },
        { type: TYPE.OPERATOR, value: "+" },
        { type: TYPE.IDENTIFIER, value: "alpha2" },
        { type: TYPE.CLOSED_BRACKET, value: ")" },
        { type: TYPE.OPERATOR, value: "*" },
        { type: TYPE.IDENTIFIER, value: "pi" },
        { type: TYPE.OPERATOR, value: "^" },
        { type: TYPE.LITERAL_NUMBER, value: 23 },
      ],
    },
    {
      arguments: ["3a+3(b+3)"],
      output: tokenize("3 a + 3 (b + 3)"),
    },
  ];
  return testTable(tokenize, table);
}
