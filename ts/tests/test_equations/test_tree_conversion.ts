import { TableRow, testTable } from "../test.js";
import { SimpleExpressionKind } from "../../equation.js";
import { parse } from "../../parser.js";
import { termsToTree, treeToTerms } from "../../equations/tree_conversion.js";

export function testTermsToTree() {
  const table: TableRow[] = [
    {
      arguments: [["a", "b", "c"], SimpleExpressionKind.sum],
      output: parse("a+b+c"),
    },
    {
      arguments: [["a", -2, "c"], SimpleExpressionKind.sum],
      output: parse("a+(-2)+c"),
    },
    {
      arguments: [["a", -2, "c"], SimpleExpressionKind.product],
      output: parse("a * (-2) * c"),
    },
  ];
  return testTable(termsToTree, table);
}

export function testTreeToTerms() {
  const table: TableRow[] = [
    {
      arguments: [
        parse("a * (b + c) - d + 3 e ^ pi - 7"),
        SimpleExpressionKind.sum,
      ],
      output: [
        parse("a * (b + c)"),
        parse("- d"),
        parse("3 * e ^ pi"),
        parse("-7"),
      ],
    },
    {
      arguments: [parse("1*(a+b)+c"), SimpleExpressionKind.sum],
      output: [parse("1*(a+b)"), parse("c")],
    },
    {
      arguments: [parse("(a+b)+c"), SimpleExpressionKind.sum],
      output: ["a", "b", "c"],
    },
    {
      arguments: [parse("a - 2 * b * c + d"), SimpleExpressionKind.sum],
      output: [parse("a"), parse("-2 * b * c"), parse("d")],
    },
    {
      arguments: [parse("a * (2 * 3) * 4"), SimpleExpressionKind.product],
      output: ["a", 2, 3, 4],
    },
    {
      arguments: [parse("a * (2 + 3 a) * 4"), SimpleExpressionKind.product],
      output: ["a", parse("2 + 3 a"), 4],
    },
    {
      arguments: [parse("1 + 2a + 3a + 4"), SimpleExpressionKind.sum],
      output: [1, parse("2a"), parse("3a"), 4],
    },
    {
      arguments: [parse("2 / 4"), SimpleExpressionKind.product],
      output: [2, parse("1/4")],
    },
  ];
  return testTable(treeToTerms, table);
}
