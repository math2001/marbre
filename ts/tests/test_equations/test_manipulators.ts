import { testTable, TableRow } from "../test.js";
import { expand, negateTerm } from "../../equations/manipulators.js";
import { parse } from "../../parser.js";
import { tree2expression } from "../../tree2expression.js";

export function testExpand() {
  return testTable(
    expand,
    [
      {
        arguments: [parse("(a + b)(c + d)")],
        output: parse("a c + a d + b c + b d"),
      },
      {
        arguments: [parse("a (b + c + d) + e (f + g)")],
        output: parse("a b + a c + a d + e f + e g"),
      },
      {
        arguments: [parse("a (b + c / d + e f)")],
        output: parse("a b + a (c / d) + a (e f)"),
      },
      {
        arguments: [parse("(a + b (c + d))(e + f)")],
        output: parse("a e + a f + (b c) e + (b c) f + (b d) e + (b d) f"),
      },
      {
        arguments: [parse("(a + b)(a - b + c)")],
        output: parse("a a + a (-b) + a c + b a + b (-b) + b c"),
      },
      {
        arguments: [parse("(a + b) / 2 * (c - 2)")],
        output: parse("a / 2 * c + a / 2 * (-2) + b / 2 * c + b / 2 * (-2)"),
      },
      {
        arguments: [parse("a (b - (c + d))")],
        output: parse("a b + a (-c) + a (-d)"),
      },
      {
        arguments: [parse("-(a+b)")],
        output: parse("-a + (-b)"),
      },
    ],
    tree2expression
  );
}

export function testNegateTerm() {
  const table: TableRow[] = [
    {
      arguments: [parse("a * 2 * b * 3")],
      output: parse("a * -2 * b * 3"),
    },
    {
      arguments: [parse("a * b * c")],
      output: parse("-(a * b * c)"),
    },
    {
      arguments: [parse("-b")],
      output: "b",
    },
    {
      arguments: [parse("a+b")],
      output: parse("-(a+b)"),
    },
    {
      arguments: [parse("-(a+b)")],
      output: parse("a+b"),
    },
    {
      arguments: [parse("-a+b")],
      output: parse("-(-a+b)"),
    },
  ];
  return testTable(negateTerm, table);
}
