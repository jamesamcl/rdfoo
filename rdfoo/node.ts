
import rdf = require('rdf-ext')

import assert from 'power-assert'

export function createUriNode(uri:string):any {

    if(! (typeof(uri) === 'string')) {
        throw new Error('trying to create URI node for ' + (typeof uri) + ' ' + uri)
    }

    return rdf.createNamedNode(uri)

}

export function isUri(node:any):boolean {

    return node.interfaceName === 'NamedRdfNode'

}

export function toUri(node:any|undefined):string|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'NamedRdfNode') {

        //throw new Error('nodeToUri requires a NamedRdfNode, but found ' + node.interfaceName)

    }

    return node.nominalValue

}

export function createIntNode(value:number):any {

    return rdf.createLiteral('' + value)

}

export function toInt(node:any|undefined):number|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Integer node must be a literal; instead got ' + node.interfaceName)

    }

    const res = parseInt(node.nominalValue)

    if(isNaN(res)) {

        console.warn('parseInt returned NaN for ' + JSON.stringify(node.nominalValue))

    }

    return res

}

export function createStringNode(value:string):any {

    return rdf.createLiteral('' + value)

}

export function toString(node:any|undefined):string|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('String node must be a literal; instead got ' + node.interfaceName)

    }

    return node.nominalValue

}

export function createFloatNode(value:number):any {

    return rdf.createLiteral('' + value)

}

export function isFloat(node:any):boolean {

    return node.interfaceName === 'Literal'

}

export function toFloat(node:any|undefined):number|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Floating point node must be a literal; instead got ' + node.interfaceName)

    }

    return parseFloat(node.nominalValue)

}

export function createBoolNode(value:boolean):any {

    return rdf.createLiteral(value ? 'true' : 'false')

}

export function toBool(node:any|undefined): boolean|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Boolean node must be a literal; instead got ' + node.interfaceName)

    }

    return node.nominalValue === 'true' ? true : false

}


