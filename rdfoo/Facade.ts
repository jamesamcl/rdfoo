
import * as triple from './triple'
import * as node from './node'

import rdf = require('rdf-ext')

import Graph, { Edge, Node } from "./Graph";
import { Watcher } from "./Graph";

export default abstract class Facade {

    graph: Graph
    subject: Node

    constructor(graph:Graph, subject:Node) {
        this.graph = graph
        this.subject = subject
    }

    getProperty(predicate:Edge) {
        return this.graph.matchOne(this.subject, predicate, null)?.object
    }

    getRequiredProperty(predicate:Edge) {
        let r =  this.graph.matchOne(this.subject, predicate, null)

	if(!r) {
            throw new Error('missing property ' + predicate)
	}

	return r.object
    }

    getUriProperty(predicate:Edge):string|undefined {
        return triple.objectUri(this.getProperty(predicate))
    }

    getRequiredUriProperty(predicate:Edge|string):string {

	if(typeof(predicate) === 'string')
		predicate = rdf.namedNode(predicate)

        const prop = triple.objectUri(this.getProperty(predicate))

        if(prop === undefined)
            throw new Error('missing property ' + predicate)

        return prop
    }

    getStringProperty(predicate:Edge):string|undefined {
        return triple.objectString(this.getProperty(predicate))
    }

    getRequiredStringProperty(predicate:Edge):string {

        const prop = triple.objectString(this.getProperty(predicate))

        if(prop === undefined)
            throw new Error('missing property ' + predicate)

        return prop
    }

    getIntProperty(predicate:Edge):number|undefined {
        return triple.objectInt(this.getProperty(predicate))
    }

    getBoolProperty(predicate:Edge):boolean|undefined {
        return triple.objectBool(this.getProperty(predicate))
    }

    getFloatProperty(predicate:Edge):number|undefined {
        return triple.objectFloat(this.getProperty(predicate))
    }



    getProperties(predicate:Edge) {
        return this.graph.match(this.subject, predicate, null)
		.map(t => t.object)
    }

    getUriProperties(predicate:Edge): Array<string> {
        return this.getProperties(predicate).map(triple.objectUri).filter((el) => !!el) as Array<string>
    }

    getStringProperties(predicate): Array<string|undefined> {
        return this.getProperties(predicate).map(triple.objectString).filter((el) => !!el) as Array<string>
    }



    setProperty(predicate:string, object:Node) {
        this.graph.removeMatches(this.subject, predicate, null)
        this.graph.insertTriple(this.subject, predicate, object)
    }

    insertProperty(predicate:string, object:Node) {
        this.graph.insertTriple(this.subject, predicate, object)
    }

    insertProperties(properties:{ [p:string]: (Node|Node[]) }) {
        this.graph.insertProperties(this.subject, properties)
    }

    deleteProperty(predicate:string) {
        this.graph.removeMatches(this.subject, predicate, null)
    }

    setUriProperty(predicate:string, value:string|undefined) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createUriNode(value))
        }
    }

    insertUriProperty(predicate:string, value:string) {
        this.insertProperty(predicate, node.createUriNode(value))
    }

    setStringProperty(predicate:string, value:string|undefined) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createStringNode(value))
        }
    }

    setIntProperty(predicate:string, value:number) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createIntNode(value))
        }
    }

    setBoolProperty(predicate:string, value:boolean) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createBoolNode(value))
        }
    }

    setFloatProperty(predicate:string, value:number) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createFloatNode(value))
        }
    }


    get objectType():string|undefined {
        return this.getUriProperty('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
    }

    abstract get facadeType():string

    hasCorrectTypePredicate():boolean {

        return this.objectType === this.facadeType

    }


    watch(cb:() => void):Watcher {

        return this.graph.watchSubject(this.subject.value, cb)

    }

    destroy() {

        this.graph.removeMatches(null, null, this.subject)
        this.graph.removeMatches(this.subject, null, null)

    }

}

