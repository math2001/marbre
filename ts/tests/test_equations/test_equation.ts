import { testTable, TableRow } from "../test.js";
import {
  getMultiple,
  collectLikeTerms,
  equal,
  findAllIdentifiers,
  linearSolve,
} from "../../equation.js";
import { parse } from "../../parser.js";
import { tree2expression } from "../../tree2expression.js";

export function testLinearSolve() {
  return testTable(
    linearSolve,
    [
      {
        arguments: [parse("a x"), parse("b"), "x"],
        output: [["x", parse("b / a")]],
      },
      {
        arguments: [parse("3 x + 4"), parse("-5x + 3"), "x"],
        output: [
          [
            "x",
            {
              left: -1,
              operator: "/",
              right: 8,
            },
          ],
        ],
      },
      {
        arguments: [parse("3 + x + 2"), parse("6 - 2 x + 5"), "x"],
        output: [["x", 2]],
      },
      {
        arguments: [parse("a + x"), parse("x"), "x"],
        output: [["a", 0]],
      },
    ],
    (solutions) =>
      solutions.length === 1 ? tree2expression(solutions[0][1]) : solutions
  );
}

export function testEqual() {
  return testTable(equal, [
    {
      arguments: [parse("a b"), parse("b a")],
      output: true,
    },
    {
      arguments: [parse("a b c"), parse("c b a")],
      output: true,
    },
    {
      arguments: [parse("(a b) c"), parse("a (b c)")],
      output: true,
    },
    {
      arguments: [parse("(a + b)(c + d)"), parse("a c + a d + b c + b d")],
      output: true,
    },
    {
      arguments: [parse("a - d"), parse("-d + a")],
      output: true,
    },
    // {
    //   arguments: [parse("2 + 2"), parse("3 + 1")],
    //   output: true,
    // },
    // {
    //   arguments: [parse("1 / 2"), parse("0.5")],
    //   output: true,
    // },
    // {
    //   arguments: [parse("2 + 2"), parse("4")],
    //   output: true,
    // },
    // {
    //   arguments: [parse("2 a + 3 b"), parse("2 (a + b) + b")],
    //   output: true,
    // },
  ]);
}
export function testFindAllIdentifiers() {
  return testTable(findAllIdentifiers, [
    {
      arguments: [parse("e ^ (pi i) a+c(b+c)")],
      output: ["a", "b", "c", "e", "i", "pi"],
    },
  ]);
}

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
    {
      arguments: [parse("a b c"), "x"],
      output: 0,
    },
    {
      arguments: [parse("(a b x) * (c d x)"), "x"],
      output: parse("(a b) * (c d x)"),
    },

    // TODO: support exponnents
    // {
    //   arguments: [parse("a^x"), "x"],
    //   output: 0,
    // },
    // {
    //   arguments: [parse("a^b"), "x"],
    //   output: 0,
    // },
  ];
  return testTable(getMultiple, table, tree2expression);
}

export function testCollectLikeTerms() {
  const table: TableRow[] = [
    // idea: -1, -3, 1*, -
    {
      arguments: [parse("-x + a x + c1 + b x + c2"), "x"],
      output: parse("(-1 + a + b) x + c1 + c2"),
    },
    {
      arguments: [parse("a x + b d"), "x"],
      output: parse("(a) x + b d"),
    },
    {
      arguments: [parse("b d + a x"), "x"],
      output: parse("a x + b d"),
    },

    // TODO: depends on getMultiple exponents support
    // {
    //   arguments: [parse("c^x + e + a x"), "x"],
    //   output: parse("a x + c^x + e"),
    // },
    // {
    //   arguments: [parse("c x + e x ^ 2"), "x"]
    //   output: parse("(c + x) x")
    // }
  ];
  return testTable(collectLikeTerms, table, tree2expression);
}
