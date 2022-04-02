
import Graph from './Graph'
import rdf = require('rdf-ext')
import DatasetExt = require('rdf-ext/lib/Dataset');

export default function changeURIPrefix(graph:Graph, topLevels:Set<string>, newPrefix:string):Map<string,string> {

    let triples = graph.graph.toArray()

    let newGraph:DatasetExt = rdf.graph([])

    let prefixes:Set<string> = new Set()

    let identityMap = new Map()

    for(let triple of triples) {

        // is this triple of the form   <s> a <o>  ?
        if(triple.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {

            // is the object one of the specified top levels?
            if(topLevels.has(triple.object.value)) {

                let subjectPrefix = prefix(triple.subject.value)

                prefixes.add(subjectPrefix)
            }
        }
    }

    for(let triple of triples) {

        let subject = triple.subject
        let predicate = triple.predicate
        let object = triple.object

        let matched = false

        for(let prefix of prefixes) {
            if(subject.value.indexOf(prefix) === 0) {
                let newSubject = rdf.namedNode(newPrefix + subject.value.slice(prefix.length))
                identityMap.set(subject.value, newSubject.value)
                subject = newSubject
                matched = true
                break
            }
        }

        if(!matched) {
            // can't change prefix, just drop the triple
            continue
        }

        if(object.termType === 'NamedNode') {
            for(let prefix of prefixes) {
                if(object.value.indexOf(prefix) === 0) {
                    let newObject = rdf.namedNode(newPrefix + object.value.slice(prefix.length))
                    identityMap.set(object.value, newObject.value)
                    object = newObject
                    break
                }
            }
        }

        newGraph.add(rdf.triple(subject, predicate, object))

    }

    console.dir(prefixes)

    graph.graph = newGraph

    return identityMap

    // TODO currently only works for SBOL compliant URIs
    // 
    function prefix(uri:string) {

        let n = 0

        for(let i = uri.length - 1; i > 0; -- i) {

            if(uri[i] === '/') {
                ++ n

                if(n === 2) {
                    return uri.slice(0, i + 1)
                }
            }
        }

        throw new Error('cant get prefix')
    }

}

