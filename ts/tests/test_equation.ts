import { testTable, TableRow } from "./test.js";
import {
  getTermsFromTree,
  negateTerm,
  getMultiple,
  getTreeFromTerms,
  collectLikeTerms,
  expand,
  equal,
  findAllIdentifiers,
  evalLiteralNumberInSimpleExpression,
  SimpleExpressionKind,
} from "../equation.js";
import { parse } from "../parser.js";
import { tree2expression } from "../tree2expression.js";

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

export function testEvalLiteralNumberInSimpleExpression() {
  return testTable(evalLiteralNumberInSimpleExpression, [
    {
      arguments: [
        getTermsFromTree(parse("2 a 3 4 e"), SimpleExpressionKind.product),
        SimpleExpressionKind.product,
      ],
      output: [24, "a", "e"],
    },
    {
      arguments: [
        getTermsFromTree(parse("2 + a + 3 + 4  + e"), SimpleExpressionKind.sum),
        SimpleExpressionKind.sum,
      ],
      output: [9, "a", "e"],
    },
    {
      arguments: [
        getTermsFromTree(parse("1 + 2a + 3a + 4 "), SimpleExpressionKind.sum),
        SimpleExpressionKind.sum,
      ],
      output: [5, parse("2a"), parse("3a")],
    },
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
    ],
    tree2expression
  );
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

export function testGetTermsFromTree() {
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
