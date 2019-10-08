import Facade from "./Facade";

export default abstract class Domain {

    constructor() {
    }

    abstract uriToFacade(uri:string):Facade|undefined

}

