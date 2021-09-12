
import GraphView from "./GraphView";
import Facade from "./Facade";
import Graph, { Node } from "./Graph";
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

    subjectToFacade(subject:Node):Facade|undefined {

        for(let d of this.views) {
            let f = d.subjectToFacade(subject)
            if(f !== undefined) {
                return f
            }
        }

        return undefined
    }

}

