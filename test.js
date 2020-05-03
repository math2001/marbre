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
        parse(new Stream(tokenize('12+43+a-b^2'))),
        parse(new Stream(tokenize('(12+43)*a-beta')))
        parse(new Stream(tokenize('beta1+alpha2')))
        parse(new Stream(tokenize('al_p_ha _8eta + 1 * pi')))
        parse(new Stream(tokenize('beta1 + alpha2 (1 + 3)^2')))
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
        document.querySelector("#tests-results").textContent = "All seems well :)"
    }
})()
