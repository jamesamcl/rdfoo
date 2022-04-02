
import * as triple from './triple'
import * as node from './node'

import shortid = require('shortid')
import identifyFiletype from './identifyFiletype';
import parseRDF from './parseRDF';
import serialize from './serialize';

import rdf = require('rdf-ext')
import { Term } from '@rdfjs/types'
import DatasetExt = require('rdf-ext/lib/Dataset');
import NamedNode = require('rdf-ext/lib/NamedNode');
import Literal = require('rdf-ext/lib/Literal');
import BlankNode = require('rdf-ext/lib/BlankNode');
import VariableExt = require('rdf-ext/lib/Variable');

import formats = require('@rdfjs/formats-common')

import streamToString = require('stream-to-string')
import QuadExt = require('rdf-ext/lib/Quad');

export interface Watcher {
    unwatch():void
}

export type Edge = NamedNode|VariableExt|string
export type NodeIdentifier = NamedNode|BlankNode|VariableExt
export type NodeLiteral = Literal
export type Node = NodeIdentifier|NodeLiteral

export default class Graph {

    graph:DatasetExt
    private ignoreWatchers:boolean

    constructor(triples?:Array<any>) {

        this.graph = triples ? rdf.graph(triples) : rdf.graph([])

        this._globalWatchers = new Array<() => void>()
        this._subjWatchers = new Map<string, Array<() => void>>()
        this.ignoreWatchers = false
    }

    match(s:Node|null, p:Edge|null, o:Node|null) {

        if(s === undefined || p === undefined || o === undefined) {
            console.dir(arguments)
            throw new Error('one of s/p/o were undefined')
        }

	if(typeof(p) === 'string')
		p = rdf.namedNode(p)

        return this.graph.match(s, p, o).toArray() 
	
    }

    matchOne(s:Node|null, p:Edge|null, o:Node|null) {

        if(s === undefined || p === undefined || o === undefined)
            throw new Error('one of s/p/o were undefined')

        if(!s && !o) {
            console.dir({ s, p, o })
            throw new Error('matchOne with only a predicate?')
        }

        if(!p && !o) {
            console.dir({ s, p, o })
            throw new Error('matchOne with only a subject?')
        }

        if(!s && !p) {
            console.dir({ s, p, o })
            throw new Error('matchOne with only an object?')
        }

        const matches = this.match(s, p, o)

        if(matches.length > 1) {
            console.error('results:')
            console.dir(matches)
            throw new Error('Got more than one result for matchOne { ' + [s, p, o].join(', ') + ' }')
        }

        return matches[0]
    }

    hasMatch(s:Node|null, p:Edge|null, o:Node|null) {

        if(s === undefined || p === undefined || o === undefined)
            throw new Error('one of s/p/o were undefined')

        return this.match(s, p, o).length > 0

    }

    addAll(other:Graph) {
        this.graph.addAll(other.graph)
    }

    get subjects():string[] {

	return Object.keys(
		this.graph['_graphs']['']?.subjects || []).map(s => this.graph['_entities'][s])
    }

    private fireWatchers(subj:string) {

        if(this.ignoreWatchers)
            return

        const watchers = this._subjWatchers.get(subj)

        if(watchers === undefined)
            return

        watchers.forEach((cb) => {
            cb()
        })
    }

    private fireGlobalWatchers():void {

        if(this.ignoreWatchers)
            return

        this._globalWatchers.forEach((cb) => cb())

    }

    insertTriple(s:Node, p:Edge, o:Node) {


	if(typeof(p) === 'string')
		p = rdf.namedNode(p)

		// TODO type checking
	this.graph.add(rdf.triple(s as NodeIdentifier, p, o))
	this.touchSubject(s.value)
    }


    insertTriples(triples:{subject:Node, predicate:Edge, object:Node}[]):void {

	const w:Set<string> = new Set<string>()

	    for (let t of triples) {

		    let [s, p, o] = [t.subject, t.predicate, t.object]

		    //console.log('Insert { ' + t.subject + ', ' + t.predicate + ', ' + t.object + ' }')

		    this.insertTriple(s, p, o)

		    w.add(s.value)

	    }

	w.forEach((uri:string) => {
		this.touchSubject(uri)
	})
    }

    touchSubject(subject:string) {
        this.fireWatchers(subject)
        this.fireGlobalWatchers()
    }

    insertProperties(subject:Node, properties:{ [p:string]: (Node[]|Node) } ):void {

        var triples:any[] = []

        for(let property of Object.keys(properties)) {

            var value = properties[property]

            if(Array.isArray(value)) {

                value.forEach((value) => {

                    triples.push({
                        subject,
                        predicate: rdf.namedNode(property),
                        object: value
                    })

                })

            } else {

                triples.push({
                    subject,
                    predicate: rdf.namedNode(property),
                    object: value
                })

            }

        }

        this.insertTriples(triples)

    }

    removeMatches(s:Node|null, p:Edge|null, o:Node|null):void {

        if(s === undefined || p === undefined || o === undefined)
            throw new Error('one of s/p/o were undefined')


	if(typeof(p) === 'string')
		p = rdf.namedNode(p)


        //console.log('Remove matches { ' + s + ', ' + p + ', ' + o + ' }')

        const w: Set<string> = new Set<string>()

        const matches = this.match(s, p, o)

        matches.forEach((t) => {
            w.add(t.subject.value)
        })


        this.graph.removeMatches( s, p, o)

        w.forEach((uri: string) => {
            this.touchSubject(uri)
        })

        this.fireGlobalWatchers()
    }



    generateURI(template:string):string {

        var n = 1

        for(;;) {

            var uri:string =
                template.split('$rand$').join(shortid.generate())
                        .split('$^n$').join('' + n)
                        .split('$n$').join('_' + n)
                        .split('$n?$').join(n > 1 ? ('_' + n) : '')

            ++ n

            if(this.hasMatch(rdf.namedNode(uri), null, null))
                continue

            return uri

        }

    }

    purgeSubject(s:Node):void {

        //console.log('purge ' + subject)
        this.graph.removeMatches(s, null, null)
        this.graph.removeMatches(null, null, s)
    }

    replaceSubject(oldSubject:Node, newSubject:Node) {

        // TODO: do this in-place instead of creating a new graph
        //
        let newGraph = rdf.graph()
        
        for(let triple of this.graph.toArray()) {

            newGraph.add(rdf.triple(
                replace(triple.subject) as NamedNode,
                replace(triple.predicate) as NamedNode,
                replace(triple.object)
	    ))
        }

        this.graph = newGraph

        function replace(n:Literal|NamedNode|BlankNode|VariableExt):Literal|NamedNode|BlankNode|VariableExt {
            if(n.termType !== 'NamedNode')
                return n
            if(n.value !== oldSubject.value)
                return n
            return node.createUriNode(newSubject.value)
        }
    }

    _globalWatchers:Array<() => void>
    _subjWatchers:Map<string, Array<() => void>>

    watchSubject(uri:string, cb:() => void):Watcher {

        const watchers:Array<() => void>|undefined = this._subjWatchers.get(uri)
        
        if(watchers === undefined) {
            this._subjWatchers.set(uri, [ cb ])
        } else {
            watchers.push(cb)
        }

        return {
            unwatch: () => {

                const watchers: Array<() => void> | undefined = this._subjWatchers.get(uri)

                if(watchers !== undefined) {
                    for(var i = 0; i < watchers.length; ++ i) {
                        if(watchers[i] === cb) {
                            watchers.splice(i, 1)
                            break
                        }
                    }

                    if(watchers.length === 0) {
                        this._subjWatchers.delete(uri)
                    }
                }
            }
        }

    }

    watch(cb:()=>void):Watcher {

        this._globalWatchers.push(cb)

        return {

            unwatch: () => {
                for(var i = 0; i < this._globalWatchers.length; ++ i) {
                    if(this._globalWatchers[i] === cb) {
                        this._globalWatchers.splice(i, 1)
                        break
                    }
                }
            }
        }

    }

    static async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<Graph> {

        let graph = new Graph()
        await graph.loadString(data, defaultURIPrefix, mimeType)
        return graph

    }

    async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<void> {

        let filetype = identifyFiletype(data, mimeType || null)

        if(filetype === null) {
            throw new Error('???')
        }

        await parseRDF(this, data, filetype)
    }

    startIgnoringWatchers() {
        this.ignoreWatchers = true
    }

    stopIgnoringWatchers() {
        this.ignoreWatchers = false
    }

    toArray():QuadExt[] {
        return this.graph.toArray()
    }

    clone():Graph {
        return new Graph(this.graph.toArray())
    }

    serializeXML() {
        return serialize(this, new Map(), () => false, '')
    }

    async serializeN3():Promise<string> {

	return await streamToString(
		new (formats.serializers.get('text/n3').Impl)(this.graph.toStream())
	)

    }

    async serializeTurtle():Promise<string> {

	return await streamToString(
		new (formats.serializers.get('text/turtle').Impl)(this.graph.toStream())
	)

    }

    async serializeJSONLD():Promise<string> {

	return await streamToString(
		new (formats.serializers.get('application/ld+json').Impl)(this.graph.toStream())
	)

    }


}

