import { testTable } from "./test.js";
import { parse } from "../parser.js";
import { tree2expression } from "../tree2expression.js";

export function testParse() {
  // just make sure it doesn't run with errors
  const table = [
    {
      arguments: ["1*2+3"],
      output: {
        left: {
          left: 1,
          operator: "*",
          right: 2,
        },
        operator: "+",
        right: 3,
      },
    },
    {
      arguments: ["1+2*3"],
      output: {
        left: 1,
        operator: "+",
        right: {
          left: 2,
          operator: "*",
          right: 3,
        },
      },
    },
    {
      arguments: ["2*(a+2)^3+b"],
      output: {
        left: {
          left: 2,
          operator: "*",
          right: {
            left: {
              left: "a",
              operator: "+",
              right: 2,
            },
            operator: "^",
            right: 3,
          },
        },
        operator: "+",
        right: "b",
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
    {
      arguments: ["(a+b) x"],
      output: parse("(a+b)*x"),
    },
    {
      arguments: ["-a^2"],
      output: parse("-(a^2)"),
    },
    {
      arguments: ["-2^2"],
      output: parse("-(2^2)"),
    },
    {
      arguments: ["-(a+b)^2"],
      output: parse("-((a+b)^2)"),
    },
    {
      arguments: ["e^pi i"],
      output: parse("(e^pi) i"),
    },
  ];
  return testTable(parse, table, tree2expression);
}
