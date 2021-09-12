
import Facade from "./Facade";
import Graph, { Node } from './Graph'
import { Triple } from 'rdf-graph-array-sboljs'

export default abstract class GraphView {

    graph:Graph

    constructor(graph:Graph) {
        this.graph = graph
    }

    abstract subjectToFacade(subject:Node):Facade|undefined
}

