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

function test_parse() {
    // just make sure it doesn't run with errors
    try {
        parse(tokenize('12+43+a-b^2')),
        parse(tokensize('(12+43)*a-beta'))
    } catch (e) {
        console.error(e)
        return e
    }
}

;(function (){
    const err = test_parse()
    if (err) {
        document.querySelector("#tests-results").innerHTML = '<span class="error">' + err + '</span>'
    } else {
        document.querySelector("#tests-results").textContent = "all is well :)"
    }
})()
