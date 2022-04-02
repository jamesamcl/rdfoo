
import Facade from "./Facade";
import Graph, { Node } from './Graph'
import * as node from './node'
export default abstract class GraphView {

    graph:Graph

    constructor(graph:Graph) {
        this.graph = graph
    }

    abstract subjectToFacade(subject:Node):Facade|undefined

    uriToFacade(uri:string):Facade|undefined {

        return this.subjectToFacade(node.createUriNode(uri))
    
    }
}

