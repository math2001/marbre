function test_tokenize() {
    const table = {
        "1 + 2": [
            {type: TYPE_LITERAL_NUMBER, value: 1},
            {type: TYPE_OPERATOR, value: "+"},
            {type: TYPE_LITERAL_NUMBER, value: 2}
        ]
    }
    // for (let expression in table) {
    //     if (tokenize(expression) )
    // }
}