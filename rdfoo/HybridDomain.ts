
import Domain from "./Domain";
import Facade from "./Facade";

export default class HybridDomain extends Domain {

    domains:Domain[]

    constructor() {
        super()
        this.domains = []
    }

    addDomain(domain:Domain) {
        this.domains.push(domain)
    }

    uriToFacade(uri:string):Facade|undefined {

        for(let d of this.domains) {
            let f = d.uriToFacade(uri)
            if(f !== undefined) {
                return f
            }
        }

        return undefined
    }

}

