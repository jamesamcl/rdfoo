import GraphView from "./GraphView";
import Graph, { Node } from "./Graph";
import Facade from "./Facade";
import * as triple from './triple'
import * as node from './node'

import rdf = require('rdf-ext')

export default class GraphViewBasic extends GraphView {

    constructor(graph:Graph) {
        super(graph)
    }

    subjectToFacade(subject:Node):Facade|undefined {
        return undefined
    }

    hasType(s:Node, t:string):boolean {
        return this.graph.hasMatch(s, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', rdf.namedNode(t))
    }

    instancesOfType(type:Node|string):Array<Node> {

	if(typeof(type) === 'string')
		type = node.createUriNode(type)

       return this.graph.match(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type)
       .map(t => t.subject)
    }

    getType(uri:Node):string|undefined {

        const type:string|undefined = triple.objectUri(
            this.graph.matchOne(uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null)
        )

        return type
    }

    getTypes(uri:Node):string[] {

        const types:any[] =
            this.graph.match(uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null)
                .map(triple.objectUri)

        return types
    }

}

