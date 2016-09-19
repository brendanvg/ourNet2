var cytoscape = require('cytoscape')


//GRAPH INITIALIZATION IS DONE HERE

module.exports = 

function initializeNet() {

  var cy= window.cy = cytoscape({
  	container: document.getElementById('cy'),
  	elements: [
  		// {//NODES
  		// 	// data: {id: 'Me'}, 
    //  //    position: {x: 400, y : 200},
  		// },
  		// {
  		// 	// data:{id:'Mom'}
  		// },
  		// {
  		// 	// data:{id:'Aunt G'}
  		// },
    //    // EDGES
    //   {
  		// 	data:{id:'momMe', source:'Mom', target:'Me'}
  		// },

  	],
  	style: [
  		{
  			selector:'node',
  			style:{
  				'background-color': '#666',
  				'label': 'data(id)'
  			}
  		},
  		{
  			selector:'edge',
  			style:{
  				'width':3,
  				'line-color':'#ccc',
  				'source-arrow-color':'#ccc',
  				'source-arrow-shape':'triangle',
  			}
  		}
  	],
  	// layout: {
  	// 	name:'grid',
  	// 	rows:1
  	// },
  	zoomingEnabled:true,
  	userZoomingEnabled:true,
    boxSelectionEnabled: true,

  })

  return {
    addNode: addNode,
    addDirectedEdge: addDirectedEdge,
  }

  
  function addNode(nodeName, position){
    cy.add({
        group:"nodes",
        data: {
          weight:75,
          id:nodeName,
        },
        position: {x: 200, y : 200},

    })
  }

  function addDirectedEdge(source,target) {
     cy.add({
      data: {
        source: source,
        target: target
      }
    })
  }

}


