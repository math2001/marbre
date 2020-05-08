//@ts-nocheck

// manipulate a tree representing an expression

// an equation is just a list of trees

function collectLikeTerms(tree, targetTerm) {
    assert(typeof targetTerm !== "number")

    const terms = treeToTerms(tree)
    const collectedTerms = []
    const leftoversTerms = []
    for (let term of terms) {

        if ((term.operator === "*" || term.operator === "/")) {
            const coefficientTerm = _getMultiple(term, targetTerm)
            console.log("coefficient term", coefficientTerm, "term", term, "targetTerm", targetTerm)
            if (coefficientTerm !== null) {
                collectedTerms.push(coefficientTerm)
            } else {
                leftoversTerms.push(term)
            }
        } else if (typeof term === "string") {
            // it has an implied coefficient of 1
            collectedTerms.push(1)
        } else {
            leftoversTerms.push(term)
        }
    }

    if (collectedTerms.length <= 1) {
        return tree
    }

    if (leftoversTerms.length === 0) {
        return {
            leftnode: termsToTree(collectedTerms),
            operator: "*",
            rightNode: targetTerm,
        }
    }

    return {
        leftNode: {
            leftNode: termsToTree(collectedTerms),
            operator: "*",
            rightNode: targetTerm
        },
        operator: "+",
        rightNode: termsToTree(leftoversTerms),
    }
}

// getMultiple(expr(a x, x)) == a. Only works on one product.
function _getMultiple(tree, targetTerm) {
    if (tree.operator !== "*") {
        console.error("tree:", tree)
        throw new Error("can only get multiples of products of expressions (nodes)")
    }

    if (tree.leftNode === targetTerm) {
        return tree.rightNode
    } else if (tree.rightNode === targetTerm) {
        return tree.leftNode
    }

    assert(tree.leftNode !== undefined)
    assert(tree.rightNode !== undefined)
    // copy the tree
    const copy = Object.assign({}, tree)
    const queue = new Queue(100, [copy.leftNode, copy.rightNode])

    let head, parent = copy;
    let i = 0
    while (i < 1000) {
        i++

        if (queue.empty()) {
            return null
        }

        head = queue.popleft()
        console.log('head', JSON.stringify(head, null, 2))
        console.log('targetTerm', JSON.stringify(targetTerm, null, 2))
        if (head.operator === undefined || head.operator !== "*") {
            // just a dead end
            continue
        }

        if (objectEqual(head.leftNode, targetTerm)) {
            console.log("match left! parent", parent)
            console.log("head", head)
            if (objectEqual(parent.leftNode, head)) {
                console.log("replace left")
                parent.leftNode = head.rightNode
            } else if (objectEqual(parent.rightNode, head)) {
                console.log('replace right')
                parent.rightNode = head.rightNode
            } else {
                console.log(JSON.stringify(parent.leftNode, null, 2))
                console.log(JSON.stringify(head, null, 2))
                console.log(objectEqual(parent.leftNode, head))
                assert(false)
            }
            return copy
        } else if (objectEqual(head.rightNode, targetTerm)) {
            console.log("match right! parent", parent)
            console.log("head", head)
            if (objectEqual(parent.leftNode, head)) {
                parent.leftNode = head.leftNode
            } else if (objectEqual(parent.rightNode, head)) {
                parent.rightNode = head.leftNode
            }
            return copy
        }

        queue.pushright(head.leftNode)
        queue.pushright(head.rightNode)
        parent = head
    }
    console.error("broke because too long")
    assert(false)
}

function treeToTerms(tree) {
    const collect = (tree, terms) => {
        if (tree.operator === "+" || tree.operator === '-') {
            collect(tree.leftNode, terms)
            if (tree.operator == "-") {
                // TODO: this could be cleaner if we tried to simplify this node
                // like multiply the number value
                collect({
                    leftNode: -1,
                    operator: "*",
                    rightNode: tree.rightNode
                }, terms)
            } else {
                collect(tree.rightNode, terms)
            }
        } else {
            terms.push(tree)
        }
    }
    const terms = []
    collect(tree, terms)
    return terms
}

function termsToTree(terms) {
    if (terms.length === 0) {
        throw new Error("yo, watch what you are doing. No terms here to convert to a tree")
    }
    if (terms.length == 1) {
        return terms[0]
    }

    const tree = {
        leftNode: terms[0],
        operator: "+",
        rightNode: terms[1]
    }

    let head = tree

    for (let i = 2; i < terms.length; i += 1) {
        head.rightNode = {
            leftNode: head.rightNode,
            operator: "+",
            rightNode: terms[i]
        }
        head = head.rightNode
    }

    return tree
}