import { testTable, TableRow } from "../test.js";
import {
  evalLiteralNumberInSimpleExpression,
  evalLiteralNumber,
} from "../../equations/eval.js";
import { treeToTerms } from "../../equations/tree_conversion.js";
import { parse } from "../../parser.js";
import { SimpleExpressionKind } from "../../equation.js";
import { tree2expression } from "../../tree2expression.js";

export function testEvalLiteralNumber() {
  const table: TableRow[] = [
    {
      arguments: [parse("1")],
      output: 1,
    },
    {
      arguments: [parse("1 + 2")],
      output: 3,
    },
    {
      arguments: [parse("1+2+3")],
      output: 6,
    },
    {
      arguments: [parse("1 + 2 + 3 + 4 + 5")],
      output: 15,
    },
    {
      arguments: [parse("1 + a + 2")],
      output: parse("a + 3"),
    },
    {
      arguments: [parse("(1 + 2) a")],
      output: parse("3a"),
    },
    {
      arguments: [parse("(1 + 2 + 3) a + 3 * 4 + 5")],
      output: parse("6a + 17"),
    },
    {
      arguments: [parse("-2 - (3 + 4a - 7) b + 3")],
      output: parse("-1 * (4a + (-4))b + 1"),
    },
  ];
  return testTable(evalLiteralNumber, table, tree2expression);
}

export function testEvalLiteralNumberInSimpleExpression() {
  return testTable(evalLiteralNumberInSimpleExpression, [
    {
      arguments: [
        treeToTerms(parse("2 a 3 4 e"), SimpleExpressionKind.product),
        SimpleExpressionKind.product,
      ],
      output: [24, "a", "e"],
    },
    {
      arguments: [
        treeToTerms(parse("2 + a + 3 + 4  + e"), SimpleExpressionKind.sum),
        SimpleExpressionKind.sum,
      ],
      output: ["a", "e", 9],
    },
    // technically, these next ones aren't simple expression, hence they don't get
    // simplified as much as one would expect.
    {
      arguments: [
        treeToTerms(parse("1 + 2a + 3a + 4"), SimpleExpressionKind.sum),
        SimpleExpressionKind.sum,
      ],
      output: [parse("2a"), parse("3a"), 5],
    },
    {
      arguments: [
        treeToTerms(parse("(1 + 2) a + 3 + 4"), SimpleExpressionKind.sum),
        SimpleExpressionKind.sum,
      ],
      output: [parse("(1 + 2) a"), 7],
    },
  ]);
}
