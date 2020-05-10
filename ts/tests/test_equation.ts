import { testTable, TableRow } from "./test.js";
import { getTermsFromTree, negateTerm, getMultiple } from "../equation.js";
import { parse } from "../parser.js";

export function testGetMultiple() {
  const table: TableRow[] = [
    {
      arguments: [parse("2*a*x*b"), "x"],
      output: parse("2*a*b"),
    },
    {
      arguments: [parse("2*a*x*b*x"), "x"],
      output: parse("2*a*x*b"),
    },
    {
      arguments: [parse("2*a*x*x*b"), "x"],
      output: parse("2*a*x*b"),
    },
  ];
  return testTable(getMultiple, table);
}

export function testGetTermsFromTree() {
  const table: TableRow[] = [
    {
      arguments: [parse("a * (b + c) - d + 3 e ^ pi - 7")],
      output: [
        parse("a * (b + c)"),
        parse("- d"),
        parse("3 * e ^ pi"),
        parse("-7"),
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
    {
      arguments: [parse("a - 2 * b * c + d")],
      output: [parse("a"), parse("-2 * b * c"), parse("d")],
    },
  ];
  return testTable(getTermsFromTree, table);
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
  ];
  return testTable(negateTerm, table);
}

export function testGetTreeFromTerm() {
  const table: TableRow[] = [
    {
      arguments: [["a", "b", "c"]],
      output: parse("a+b+c"),
    },
    {
      arguments: [["a", -2, "c"]],
      output: parse("a+(-2)+c"),
    },
  ];
  return testTable(getTreeFromTerms, table);
}
