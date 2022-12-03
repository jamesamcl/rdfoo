



const JsonLdParser = require('@rdfjs/parser-jsonld')
import ParserN3 from '@rdfjs/parser-n3'
const NTriplesSerializer = require('@rdfjs/serializer-ntriples')
const SinkMap = require('@rdfjs/sink-map')
const JsonLdSerializer = require('@rdfjs/serializer-jsonld')
const { RdfXmlParser } = require('rdfxml-streaming-parser')

class CustomJsonLdSerializer extends JsonLdSerializer {
  constructor ({ ...args } = {}) {
    super({ encoding: 'string', ...args })
  }
}

class CustomRdfXmlParser extends RdfXmlParser {
	constructor ({ factory, ...args }:any = {}) {
	  super({ ...args, dataFactory: factory })
	}
      }

const formats = {
  parsers: new SinkMap(),
  serializers: new SinkMap()
}

formats.parsers.set('application/ld+json', new JsonLdParser())
formats.parsers.set('application/trig', new ParserN3())
formats.parsers.set('application/n-quads', new ParserN3())
formats.parsers.set('application/n-triples', new ParserN3())
formats.parsers.set('text/n3', new ParserN3())
formats.parsers.set('text/turtle', new ParserN3())
formats.parsers.set('application/rdf+xml', new CustomRdfXmlParser())

formats.serializers.set('application/ld+json', new CustomJsonLdSerializer())
// formats.serializers.set('application/n-quads', new N3.Writer())
// formats.serializers.set('application/n-triples', new N3.Writer())
// formats.serializers.set('text/n3', new N3.Writer())
// formats.serializers.set('text/turtle', new N3.Writer())

export default formats
