import { objectEqual } from "./utils.js"
import { tokenize, TYPE } from "./tokenizer.js"
import { parse } from "./parser.js"

function testTable(func, table) {
    let numberSuccess = 0
    let errors = []
    let failures = []
    let output
    for (let row of table) {
        try {
            output = func(...row.arguments)
        } catch (e) {
            failures.push({
                arguments: row.arguments,
                error: e
            })
            continue
        }
        if (objectEqual(row.output, output)) {
            numberSuccess++
        } else {
            errors.push({
                arguments: row.arguments,
                expectedOutput: row.output,
                actualOutput: output
            })
        }
    }
    return { numberSuccess, errors, failures }
}

function testTokenize() {
    const table = [
        {
            arguments: ["1 + 2"],
            output: [
                { type: TYPE.LITERAL_NUMBER, value: 1 },
                { type: TYPE.OPERATOR, value: "+" },
                { type: TYPE.LITERAL_NUMBER, value: 2 }
            ]
        },
        {
            arguments: ["(alpha1 + alpha2) * pi ^ 23"],
            output: [
                { type: TYPE.OPEN_BRACKET, value: '(' },
                { type: TYPE.IDENTIFIER, value: "alpha1" },
                { type: TYPE.OPERATOR, value: "+" },
                { type: TYPE.IDENTIFIER, value: "alpha2" },
                { type: TYPE.CLOSED_BRACKET, value: ')' },
                { type: TYPE.OPERATOR, value: "*" },
                { type: TYPE.IDENTIFIER, value: "pi" },
                { type: TYPE.OPERATOR, value: "^" },
                { type: TYPE.LITERAL_NUMBER, value: 23 },
            ]
        },
        {
            arguments: ['3a+3(b+3)'],
            output: tokenize('3 a + 3 (b + 3)')
        }
    ]
    return testTable(tokenize, table)
}

function testParse() {
    // just make sure it doesn't run with errors
    const table = [
        {
            arguments: ['1*2+3'],
            output: {
                leftNode: {
                    leftNode: 1,
                    operator: "*",
                    rightNode: 2,
                },
                operator: "+",
                rightNode: 3
            }
        },
        {
            arguments: ['1+2*3'],
            output: {
                leftNode: 1,
                operator: '+',
                rightNode: {
                    leftNode: 2,
                    operator: '*',
                    rightNode: 3
                }
            }
        },
        {
            arguments: ['2*(a+2)^3+b'],
            output: {
                leftNode: {
                    leftNode: 2,
                    operator: "*",
                    rightNode: {
                        leftNode: {
                            leftNode: "a",
                            operator: "+",
                            rightNode: 2,
                        },
                        operator: "^",
                        rightNode: 3
                    }
                },
                operator: "+",
                rightNode: "b"
            }
        },
        {
            arguments: ['a+b+c'],
            output: parse('(a+b)+c')
        },
        {
            arguments: ['a*b^c'],
            output: parse('(a*(b^(c)))')
        },
        {
            arguments: ['3a'],
            output: parse('3*a')
        },
        {
            arguments: ['3a+2b'],
            output: parse('3*a+2*b')
        },
        {
            arguments: ['3(a+b)+2'],
            output: parse('3*(a+b)+2')
        }
    ]
    return testTable(parse, table)
}

; (function () {

    let testFunctions = [testParse, testTokenize]
    let totalSuccesses = 0
    let totalErrors = []
    let totalFailures = []

    for (let func of testFunctions) {
        const result = func()
        totalSuccesses += result.numberSuccess
        if (result.errors.length > 0) {
            totalErrors.push({ name: func.name, values: result.errors })
        }
        if (result.failures.length > 0) {
            totalFailures.push({ name: func.name, values: result.failures })
        }
    }

    function displayReports(reports) {
    }

    const numberTests = totalSuccesses + totalErrors.length + totalFailures.length
    console.info(`passing tests: ${totalSuccesses} / ${numberTests}`)
    if (totalErrors.length > 0) {
        console.info("errors")
        for (let report of totalErrors) {
            console.group(report.name)
            for (let error of report.values) {
                console.error("arguments", error.arguments)
                console.error("actual output", error.actualOutput)
                console.error("expected output", error.expectedOutput)
            }
            console.groupEnd()
        }
    }

    if (totalFailures.length > 0) {
        console.info("failures")
        for (let report of totalFailures) {
            console.group(report.name)
            for (let error of report.values) {
                console.error("arguments", error.arguments)
                console.error("errors", error.error)
            }
            console.groupEnd()
        }
    }
})()
