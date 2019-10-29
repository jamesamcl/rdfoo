import GraphView from "./GraphView";
import Graph from "./Graph";
import Facade from "./Facade";
import * as triple from './triple'

export default class GraphViewBasic extends GraphView {

    constructor(graph:Graph) {
        super(graph)
    }

    uriToFacade(uri:string):Facade|undefined {
        return undefined
    }

    hasType(s:string, t:string):boolean {
        return this.graph.match(s, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', t).length > 0
    }

    instancesOfType(type:string):Array<string> {

       return this.graph.match(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type)
                  .map(triple.subjectUri) as Array<string>
    }

    getType(uri:string):string|undefined {

        const type:string|undefined = triple.objectUri(
            this.graph.matchOne(uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null)
        )

        return type
    }

    getTypes(uri:string):string[] {

        const types:any[] =
            this.graph.match(uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null)
                .map(triple.objectUri)

        return types
    }

}

