import { testTable } from "./test.js";
import { parse } from "../parser.js";

export function testParse() {
  // just make sure it doesn't run with errors
  const table = [
    {
      arguments: ["1*2+3"],
      output: {
        leftNode: {
          leftNode: 1,
          operator: "*",
          rightNode: 2,
        },
        operator: "+",
        rightNode: 3,
      },
    },
    {
      arguments: ["1+2*3"],
      output: {
        leftNode: 1,
        operator: "+",
        rightNode: {
          leftNode: 2,
          operator: "*",
          rightNode: 3,
        },
      },
    },
    {
      arguments: ["2*(a+2)^3+b"],
      output: {
        leftNode: {
          leftNode: 2,
          operator: "*",
          rightNode: {
            leftNode: {
              leftNode: "a",
              operator: "+",
              rightNode: 2,
            },
            operator: "^",
            rightNode: 3,
          },
        },
        operator: "+",
        rightNode: "b",
      },
    },
    {
      arguments: ["a+b+c"],
      output: parse("(a+b)+c"),
    },
    {
      arguments: ["a*b^c"],
      output: parse("(a*(b^(c)))"),
    },
    {
      arguments: ["3a"],
      output: parse("3*a"),
    },
    {
      arguments: ["3a+2b"],
      output: parse("3*a+2*b"),
    },
    {
      arguments: ["3(a+b)+2"],
      output: parse("3*(a+b)+2"),
    },
    {
      arguments: ["-(a+b)"],
      output: parse("(-1)*(a+b)"),
    },
  ];
  return testTable(parse, table);
}
