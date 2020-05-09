import { testTable, TableRow } from "./test.js";
import { getTermsFromTree } from "../equation.js";
import { parse } from "../parser.js";

export function testGetTermsFromTree() {
  const table: TableRow[] = [
    {
      arguments: [parse("a * (b + c) - d + 3 e ^ pi - 7")],
      output: [
        parse("a * (b + c)"),
        parse("- d"),
        parse("3 * e ^ pi"),
        parse("-1 * 7"),
      ],
    },
    {
      arguments: [parse("1*(a+b)+c")],
      output: [parse("1*(a+b)"), parse("c")],
    },
    {
      arguments: [parse("(a+b)+c")],
      output: ["a", "b", "c"],
    },
  ];
  return testTable(getTermsFromTree, table);
}
