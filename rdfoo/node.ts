
import rdf from 'rdf-ext'

import NamedNode = require('rdf-ext/lib/NamedNode')
import { Term } from '@rdfjs/types'

export function createUriNode(uri:string):NamedNode {

    if(! (typeof(uri) === 'string')) {
        throw new Error('trying to create URI node for ' + (typeof uri) + ' ' + uri)
    }

    return rdf.namedNode(uri)

}

export function isUri(node:Term):boolean {

    return node.termType === 'NamedNode'

}

export function toUri(node:Term|undefined):string|undefined {

    if(node === undefined)
        return

    if(node.termType !== 'NamedNode') {

        //throw new Error('nodeToUri requires a NamedRdfNode, but found ' + node.interfaceName)

    }

    return node.value

}

export function createIntNode(value:number):any {

    return rdf.literal('' + value)

}

export function toInt(node:Term):number|undefined {

    if(node === undefined)
        return

    if(node.termType !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Integer node must be a literal; instead got ' + node.termType)

    }

    const res = parseInt(node.value)

    if(isNaN(res)) {

        console.warn('parseInt returned NaN for ' + JSON.stringify(node.value))

    }

    return res

}

export function createStringNode(value:string):any {

    return rdf.literal('' + value)

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

    return rdf.literal('' + value)

}

export function isFloat(node:Term):boolean {

    return node.termType === 'Literal'

}

export function toFloat(node:Term):number|undefined {

    if(node === undefined)
        return

    if(node.termType !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Floating point node must be a literal; instead got ' + node.termType)

    }

    return parseFloat(node.value)

}

export function createBoolNode(value:boolean):any {

    return rdf.literal(value ? 'true' : 'false')

}

export function toBool(node:Term): boolean|undefined {

    if(node === undefined)
        return

    if(node.termType !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Boolean node must be a literal; instead got ' + node.termType)

    }

    return node.value === 'true' ? true : false

}


