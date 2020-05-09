import { objectEqual } from "../utils.js";
import { testTable } from "./test.js";

export function testObjectEqual() {
  const table = [
    {
      arguments: [1, 1],
      output: true,
    },
    {
      arguments: [2, 1],
      output: false,
    },
    {
      arguments: [undefined, undefined],
      output: true,
    },
    {
      arguments: [null, undefined],
      output: false,
    },
    {
      arguments: [null, null],
      output: true,
    },
    {
      arguments: [{ a: 2, b: 1 }, undefined],
      output: false,
    },
    {
      arguments: [[1, 2], { 1: 1, 2: 2 }],
      output: false,
    },
  ];
  return testTable(objectEqual, table);
}
