
import Graph from './Graph'
import { Filetype } from './identifyFiletype';
import formats from './formats'
import { Readable } from 'readable-stream'

export default async function parseRDF(graph:Graph, rdf:string, filetype:Filetype):Promise<void> {

	var s = new Readable()
	s.push(rdf)
	s.push(null)



    if(filetype === Filetype.NTriples) {
	    await graph.graph.import(formats.parsers.import('text/n3', s))
    } else if(filetype === Filetype.RDFXML) {
	    await graph.graph.import(formats.parsers.import('application/rdf+xml', s))
    } else {
        throw new Error('Unknown type ' + filetype)
    }

}
