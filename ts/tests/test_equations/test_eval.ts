import { testTable } from "../test.js";
import { evalLiteralNumberInSimpleExpression } from "../../equations/eval.js";
import { treeToTerms } from "../../equations/tree_conversion.js";
import { parse } from "../../parser.js";
import { SimpleExpressionKind } from "../../equation.js";

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
