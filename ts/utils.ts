export function assert(
  condition: boolean,
  message?: string
): asserts condition {
  if (!condition) {
    if (message) {
      console.error(message);
    }
    throw new Error("assertion error");
  }
}

export function objectEqual(a: any, b: any) {
  if (
    typeof a === "string" ||
    typeof a === "number" ||
    typeof a === "boolean"
  ) {
    return a === b;
  }
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (let key of Object.keys(a)) {
    if (
      typeof a[key] === "string" ||
      typeof a[key] === "number" ||
      typeof a[key] === "boolean"
    ) {
      if (a[key] !== b[key]) {
        return false;
      }
    } else if (typeof a[key] === "object") {
      if (!objectEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return true;
}
