
import Graph from "./Graph";

import et = require('elementtree')

import { objectUri } from './triple'

let ElementTree = et.ElementTree
let Element = et.Element
let SubElement = et.SubElement
let QName = et.QName

export default function serialize(
    graph:Graph,
    defaultPrefixes:Map<string,string>,
    isOwnershipRelation:(triple:any) => boolean,
    preferredTypeNamespace:string
):string {

	console.log('cows')

    let prefixes:Map<string,string> = new Map(defaultPrefixes)
    let prefixesUsed:Map<string,boolean> = new Map()

    prefixes.set('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf')
    prefixesUsed.set('rdf', true)

    let subjectToElement = new Map()
    let ownedElements = new Set()

    for(let triple of graph.match(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null)) {

        let subject = nodeToURI(triple.subject)
        let type = nodeToURI(triple.object)

        if(subjectToElement.has(subject))
            continue

        let types = graph.match(triple.subject, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null)
                .map(objectUri)
                .filter(s => s !== undefined)
                .map(s => s as string)

        for(let type of types) {
            if(type.indexOf(preferredTypeNamespace) === 0) {
                types = [ type ]
                break
            }
        }

        let subjectElem = Element(prefixify(types[0]), {
            [prefixify('http://www.w3.org/1999/02/22-rdf-syntax-ns#about')]: subject
        })

        subjectToElement.set(subject, subjectElem)
    }

    for(let triple of graph.graph) {

        let s = nodeToURI(triple.subject)

        let subjectElem = subjectToElement.get(s)

        if(!subjectElem) {
            subjectElem = Element('rdf:Description', {
                [prefixify('http://www.w3.org/1999/02/22-rdf-syntax-ns#about')]: s
            })
            subjectToElement.set(s, subjectElem)
        }

        let p = nodeToURI(triple.predicate)

        if(p === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
            continue
        }

        if(isOwnershipRelation(triple)) {

            let o = nodeToURI(triple.object)

            let ownedElement = subjectToElement.get(o)

            if(ownedElement) {

                let ownershipElement = SubElement(subjectElem, prefixify(p))
                ownershipElement.append(ownedElement)

                ownedElements.add(o)

                continue
            }
        }

        if(triple.object.termType === 'NamedNode') {
            SubElement(subjectElem, prefixify(p), {
                [prefixify('http://www.w3.org/1999/02/22-rdf-syntax-ns#resource')]: nodeToURI(triple.object)
            })
            continue
        }

        if(triple.object.termType === 'Literal') {

            let attr:any = {}

            // TODO language and datatype

            let elem = SubElement(subjectElem, prefixify(p), attr)

            elem.text = triple.object.value

            continue
        }

        throw new Error('Unknown termType ' + triple.object.termType)
    }


    let docAttr = {}

    for(let prefix of prefixes.keys()) {
        if(prefixesUsed.get(prefix) === true)
            docAttr['xmlns:' + prefix] = prefixes.get(prefix)
    }


    let root = Element(prefixify('http://www.w3.org/1999/02/22-rdf-syntax-ns#RDF'), docAttr)

    for(let subject of subjectToElement.keys()) {
        if(!ownedElements.has(subject))
            root.append(subjectToElement.get(subject))
    }


    let doc = new ElementTree(root)

    return doc.write({
        xml_declaration: true,
        indent: 2
    })


    function nodeToURI(node):string {

        if(node.termType !== 'NamedNode')
            throw new Error('expected NamedNode but found ' + JSON.stringify(node))

        if(typeof node.value !== 'string')
            throw new Error('value not a string?')

        return node.value
    }

    function prefixify(iri) {

        for(var prefix of prefixes.keys()) {

            var prefixIRI:any = prefixes.get(prefix)

            if(iri.indexOf(prefixIRI) === 0) {
                prefixesUsed.set(prefix, true)
                return prefix + ':' + iri.slice(prefixIRI.length)
            }
        }

        var fragmentStart = iri.lastIndexOf('#')

        if(fragmentStart === -1)
            fragmentStart = iri.lastIndexOf('/')

        if(fragmentStart === -1)
            return iri

        var iriPrefix = iri.substr(0, fragmentStart + 1)

        for(var i = 0 ;; ++ i) {

            var prefixName = 'ns' + i

            if(prefixes.get(prefixName) === undefined) {

                prefixes.set(prefixName, iriPrefix)
                prefixesUsed.set(prefixName, true)

                return prefixName + ':' + iri.slice(iriPrefix.length)
            }
        }
    }

}
