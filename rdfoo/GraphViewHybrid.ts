
import GraphView from "./GraphView";
import Facade from "./Facade";
import Graph from "./Graph";
import GraphViewBasic from "./GraphViewBasic";

export default class GraphViewHybrid extends GraphViewBasic {

    views:GraphView[]

    constructor(graph:Graph) {
        super(graph)
        this.views = []
    }

    addView(view:GraphView) {
        this.views.push(view)
    }

    uriToFacade(uri:string):Facade|undefined {

        for(let d of this.views) {
            let f = d.uriToFacade(uri)
            if(f !== undefined) {
                return f
            }
        }

        return undefined
    }

}

