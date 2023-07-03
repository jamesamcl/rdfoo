
import Graph, { Node, Edge } from './rdfoo/Graph'
import { Watcher } from './rdfoo/Graph'
import Facade from './rdfoo/Facade'
import GraphView from './rdfoo/GraphView'
import GraphViewHybrid from './rdfoo/GraphViewHybrid'
import GraphViewBasic from './rdfoo/GraphViewBasic'
import * as node from './rdfoo/node'
import * as triple from './rdfoo/triple'
import serialize from './rdfoo/serialize'
import changeURIPrefix from './rdfoo/changeURIPrefix'
import identifyFiletype, { Filetype } from './rdfoo/identifyFiletype'
import parseRDF from './rdfoo/parseRDF'
import rdf from 'rdf-ext'

let namedNode = rdf.namedNode
let literal = rdf.literal

export { Graph, GraphView, GraphViewHybrid, GraphViewBasic, Facade, node, triple, serialize, changeURIPrefix, identifyFiletype, Filetype, parseRDF, rdf, namedNode, literal }
export type { Watcher, Node, Edge }


