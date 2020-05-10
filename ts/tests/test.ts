import { objectEqual, assert } from "../utils.js";
import { testParse } from "./test_parse.js";
import { testTokenizer } from "./test_tokenizer.js";
import { testQueue } from "./test_queue.js";
import {
  testGetTermsFromTree,
  testNegateTerm,
  testGetMultiple,
  testGetTreeFromTerm,
  testCollectLikeTerms,
  testExpand,
} from "./test_equation.js";
import { testObjectEqual } from "./test_utils.js";

export interface TableRow {
  arguments: any[];
  output: any;
}

(function () {
  const testFunctions = [
    testObjectEqual,
    testQueue,
    testTokenizer,
    testParse,
    testGetTermsFromTree,
    testNegateTerm,
    testGetMultiple,
    testGetTreeFromTerm,
    testCollectLikeTerms,
    testExpand,
  ];

  let totalSuccesses = 0;
  let totalErrors = [];
  let totalFailures = [];

  for (let func of testFunctions) {
    const result = func();
    totalSuccesses += result.numberSuccess;
    if (result.errors.length > 0) {
      totalErrors.push({ name: func.name, values: result.errors });
    }
    if (result.failures.length > 0) {
      totalFailures.push({ name: func.name, values: result.failures });
    }
  }

  const numberTests =
    totalSuccesses +
    totalErrors.reduce((acc, errors) => acc + errors.values.length, 0) +
    totalFailures.reduce((acc, failures) => acc + failures.values.length, 0);

  console.info(`passing tests: ${totalSuccesses} / ${numberTests}`);
  if (totalErrors.length > 0) {
    console.info("errors");
    for (let report of totalErrors) {
      console.group(report.name);
      for (let error of report.values) {
        console.error("arguments:", error.arguments);
        console.error("actual output  :", error.actualOutput);
        console.error("expected output:", error.expectedOutput);
      }
      console.groupEnd();
    }
  }

  if (totalFailures.length > 0) {
    console.info("failures");
    for (let report of totalFailures) {
      console.group(report.name);
      for (let error of report.values) {
        console.error("arguments", error.arguments);
        console.error("errors", error.error);
      }
      console.groupEnd();
    }
  }
})();

export function testTable(
  func: (...args: any[]) => any,
  table: TableRow[],
  formatter?: (obj: any) => any
) {
  let numberSuccess = 0;
  let errors = [];
  let failures = [];
  let output;
  for (let row of table) {
    try {
      output = func(...row.arguments);
    } catch (e) {
      failures.push({
        arguments: row.arguments,
        error: e,
      });
      continue;
    }
    if (objectEqual(row.output, output)) {
      numberSuccess++;
    } else {
      errors.push({
        arguments: row.arguments,
        expectedOutput: formatter ? formatter(row.output) : row.output,
        actualOutput: formatter ? formatter(output) : output,
      });
    }
  }
  return { numberSuccess, errors, failures };
}
