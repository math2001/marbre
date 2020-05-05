// manipulate a tree representing an expression

// an equation is just a list of trees

function collectLikeTerms(tree, term) {
}

function treeToTerms(tree) {
    const collect = (tree, terms) => {
        if (tree.operator === "+" || tree.operator === '-') {
            collect(tree.leftNode, terms)
            collect(tree.rightNode, terms)
        } else {
            terms.push(tree)
        }
    }
    const terms = []
    collect(tree, terms)
    return terms
}