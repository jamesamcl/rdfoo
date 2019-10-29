
import * as node from './node'

export function subjectUri(triple:any):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toUri(triple.subject)
}

export function predicateUri(triple:any):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toUri(triple.predicate)
}

export function objectUri(triple:any):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toUri(triple.object)
}

export function objectInt(triple:any):number|undefined {

    if(triple === undefined)
        return undefined

    return node.toInt(triple.object)

}

export function objectFloat(triple:any):number|undefined {

    if(triple === undefined)
        return undefined

    return node.toFloat(triple.object)

}

export function objectBool(triple:any):boolean|undefined {

    if(triple === undefined)
        return undefined

    return node.toBool(triple.object)

}

export function objectString(triple:any):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toString(triple.object)

}



