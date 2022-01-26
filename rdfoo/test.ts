
import Graph from './Graph'
import fs = require('fs')


let g = new Graph()

g.loadString(fs.readFileSync('/Users/james/Dropbox/Data/sbol_upload/toggleswitch.xml') + '').then(t => {




console.log(g.serializeXML())

})


