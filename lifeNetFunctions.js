var cytoscape = require('cytoscape')
var hyperquest= require('hyperquest')
var catS = require('concat-stream')
var gnfModule = require('./genericNetFunctions.js')
var gnf = gnfModule()
var postJson = require('post-json')
/*var Sync = require('sync')
*/
//ALL GRAPH MANIPULATION IS DONE HERE....(cy.add())
module.exports =

function initialize(){

/*	var nClicked = false;
	var firstNode = {}
	var secondNode = {}*/

	return {
		addNet: addNet,
		loadNets: loadNets,
		graphAllNodes: graphAllNodes,
		loadEdges: loadEdges,
		createNewNode: createNewNode,
		savePositions:savePositions,
		addNewEdge: addNewEdge,
		test: test,
		clearAllNodes: clearAllNodes,
		loadGroups: loadGroups,
		graphSpecificGroup: graphSpecificGroup,
		enterChat: enterChat,
		checkDb:checkDb,
		tapOnNodes: tapOnNodes
  	}


  	function addNet(){
  		console.log('addNet called in LNF')
  		var netName = document.getElementById('netName').value
  		var netDescription = document.getElementById('netDescription').value
  		var invitePeople = document.getElementById('invitePeople').value
  		var body = {netName: netName, netDescription: netDescription, invitePeople:invitePeople}
  		var url= 'http://localhost:5003/addNet'
  		postJson(url, body, function (err, result) {
		})
  		// var url = 'http://localhost:5003/addNet'
  		// var netName=document.getElementById('nodeNetworks').value
  		// postJson(url,netName, loadNets) 
  		loadNets()
  	}
  	
  	function loadNets(/*callback3*/){

  		/*var netsValue = hyperquest('http://localhost:5003/loadNets')
  		console.log('myyyy netsValue: ', netsValue)
		var y = JSON.parse(netsValue)

		console.log('yyyyy: ', y)
		for (i = 0; i<y.length; i++){
			console.log('yep',y[i])
			var groupLink = '<tr><button class = "nets" id="'+y[i]+'">'+y[i]+'</button><br>'
		
			listOfGroupLinks += groupLink
			document.getElementById('currentNet').value = y[i]
		}
		var parent= document.getElementById('netLinkContent')
		parent.innerHTML=listOfGroupLinks


		var nets1 = document.getElementsByClassName('nets')

		for(var i = 0; i < nets1.length; i++)
			{
				console.log('loadnetshmmm', nets1.item(i));
				nets1.item(i).addEventListener('click',graphSpecificNet)
		 }
	}*/



		var listOfGroupLinks = ""
		var stream3 = hyperquest('http://localhost:5003/loadNets')
		.pipe(
			catS(function(data){
				var x = data.toString()
				var y = JSON.parse(x)
				console.log('this is y from groups', y)

				for (i = 0; i<y.length; i++){
					console.log('yep',y[i])
					var groupLink = '<tr><button class = "nets" id="'+y[i]+'">'+y[i]+'</button><br>'
				
					listOfGroupLinks += groupLink
					document.getElementById('currentNet').value = y[i]

				}
				var parent= document.getElementById('netLinkContent')
				parent.innerHTML=listOfGroupLinks
			})
		)
		stream3.on('finish', function(){
			console.log('its done')
			var nets1 = document.getElementsByClassName('nets')

			for(var i = 0; i < nets1.length; i++)
 			{
   				console.log('loadnetshmmm', nets1.item(i));
   				nets1.item(i).addEventListener('click',graphSpecificNet)
			 }
		})
	}	
  	
  	function checkDb(){
  		var net = document.getElementById('currentNet').value
  		hyperquest('http://localhost:5003/checkDb/'+net)
  	}


  	function enterChat(){
  		hyperquest('http://localhost:5003/enterChat')
  	}

	function test () {
		var url = 'http://localhost:5003/test'
		var body = {firstNode: firstNodeId, secondNode:secondNodeId} 

		postJson(url,body, function(err,result){
		})

	}
	function clearAllNodes(){
		cy.nodes().remove()
	}


	function addNode (name,group) {
		cy.add({
	        group:"nodes",
	        data: {
	          weight:75,
	          id:name,
	        },
	        position: {x: 200, y : 200},
	        classes: group,
    	})
    	console.log('this happens first')
/*    	tapOnNodes()
*/	}

	function addDirectedEdge(source,target) {
	     cy.add({
	      group:"edges",
	      data: {
	        source: source,
	        target: target
	      }
	    })
	}
		

  	function createNewNode(){
  		var name= document.getElementById('nodeName').value
  		var group = document.getElementById('nodeGroup').value
  		var networks = document.getElementById('nodeNetworks').value
  		var initPosition = {x: 200, y: 200}
  		
  		document.getElementById('currentNet').value = networks

  		var url = 'http://localhost:5003/addNode'
/*  		var url2 = 'http://localhost:5003/addGroup'
*/ 

/*  		var url3 = 'http://localhost:5003/addNet'
*/  		var netName=document.getElementById('nodeNetworks').value
/*  		postJson(url3,netName) 
*/
			if (name && group){
				var body = {nodeName: name, nodeNetworks: networks, nodeGroup: group, position: initPosition}

		  		postJson(url, body, function (err, result) {
				})
				
				addNode(name,group)

				
			}
			else alert('Name and group are both required')
/*			tapOnNodes()
*/	}


	function loadGroups (callback3){

		var listOfGroupLinks = ""
		var stream3 = hyperquest('http://localhost:5003/loadGroups')
		.pipe(
			catS(function(data){
				var x = data.toString()
				var y = JSON.parse(x)
				console.log('this is y from groups', y)

				for (i = 0; i<y.length; i++){
					console.log('yep',y[i])
					var groupLink = '<tr><button class = "groups" id="'+y[i].key+'">'+y[i].key+'</button><br>'
				
					listOfGroupLinks += groupLink
				}
				var parent= document.getElementById('groupLinkContent')
				parent.innerHTML=listOfGroupLinks
			})
		)
		stream3.on('finish', function(){
			console.log('its done')
			var groups1 = document.getElementsByClassName('groups')

			for(var i = 0; i < groups1.length; i++)
 			{
   				console.log(groups1.item(i));
   				groups1.item(i).addEventListener('click',graphSpecificGroup)
			 }
		})
	}


	

	function addNewEdge(firstNodeId, secondNodeId) {
		var url = 'http://localhost:5003/addEdge'
		var currentNet = document.getElementById('currentNet').value
		var body = {firstNode: firstNodeId, secondNode:secondNodeId, net: currentNet} 


		console.log('hi1')
		postJson(url,body, function(err,result){
			console.log('hi2')
		})
			addDirectedEdge(firstNodeId, secondNodeId)

	}


	function graphSpecificGroup(){ 
		var group= this.id
		var stream2 = hyperquest('http://localhost:5003/graphSpecificGroup/'+group)
		console.log('hi', group)
		console.log('jackpot', stream2)
		loadNodes(stream2)
	}

	function graphSpecificNet(){
		clearAllNodes()
		var net= this.id
		document.getElementById('currentNet').value = net
		var stream3 = hyperquest('http://localhost:5003/graphSpecificNet/'+net)
		console.log('hi77777777777777777777', net)
		console.log('jackpot', stream3)
		loadNodes(stream3)
		tapOnNodes()
		loadEdges()	
	}

function tapOnNodes () {
  var nClicked = false;
	var firstNode = {}
	var secondNode = {}
	var edgeClicked=false;
  cy.on('tap', 'node', function(evt){
    //second click
    if (nClicked) {
      nClicked = false
  	  // console.log('byee')
      secondNode = evt.cyTarget
      var firstNodeId= firstNode.id()
      var secondNodeId = secondNode.id()
      // console.log('c',firstNodeId, 'd',secondNodeId)
      if (secondNodeId === firstNodeId){
        console.log('clicked myself')
        var currentNet= document.getElementById('currentNet').value
        window.open('http://localhost:5003/nodeInfo/'+currentNet+'/'+evt.cyTarget.id(), 'Node Info', 'height= 470, width=470, return false') 
      }
      else {
        // console.log('nodes2',firstNodeId, secondNodeId)
        console.log('wwooooo!!!!!!!!!!!!!!!!!!!!')
  	   addNewEdge(firstNodeId, secondNodeId)  
      // gnf.addDirectedEdge(firstNodeId, secondNodeId)
      }
    }
    //first click
    else 
    {
      nClicked=true
      firstNode= evt.cyTarget
      // firstNodeId = firstNode.id()
      console.log('hiii')
      console.log('a', firstNode, 'b', firstNodeId)
    }
  })
}

	function graphAllNodes(){
	  	console.log('woooo')
	    var stream1 = hyperquest('http://localhost:5003/graphAllNodes')
	    loadNodes(stream1)
	}

	function loadNodes(stream1){

		stream1.pipe(catS(function(data){
			var arrayOfOs= JSON.parse(data)
			
			console.log('hhhhh!!!!!!!!!', arrayOfOs)
			arrayOfOs.forEach(function(arrayItem){
				console.log('heeeeee',arrayItem.nodeName, arrayItem.position, arrayItem.group, '!!!', arrayItem)
				cy.add({
			        group:"nodes",
			        data: {
			          weight:75,
			          id:arrayItem.nodeName,
			        },
			        position: {x: arrayItem.position.x, y : arrayItem.position.y},
			        classes:arrayItem.group,
			    })
			})
		}))
	}
	    	

	function loadEdges(){
		console.log('Fuuuu')
	    hyperquest('http://localhost:5003/loadEdges')
	    .pipe(
	    	catS(function(data){
	    		var x = data.toString()
	    		var y = JSON.parse(x)
	    		console.log('thisisy', y)
	    		console.log('type', typeof y)
	    		console.log('length of y', y.length)

	    		y.forEach(function(arrayItem){
	    			console.log('here: ', arrayItem)
	    			arrayItem.value.forEach(function(elem){		
	    				if (elem.edges.out) {
	    					console.log('inn: ',elem.edges.in, 'out: ',elem.edges.out)
		    				
		    				for (var i = 0; i < elem.edges.out.length; i++) {
		    					
		    					cy.add({	
						      		data: {
						        		source: elem.nodeName,
						        		target: elem.edges.out[i]
						      		}
						    	})

		    				}

			    				
					
	    				}	
	    			})
	    		
	    		})
	    	})
	    )
	}

	function savePositions(){
		console.log('match thisss!!!!!!!!!', document.getElementById('currentNet'))
		if (document.getElementById('currentNet').value){
			console.log('ooooook')
			cy.nodes().forEach(function(ele){
				console.log( ele.id() )
				console.log('gotacatchem ', ele)
				var id= ele.id()
				var positionObject= ele.renderedPosition()
				var currentNet = document.getElementById('currentNet').value
				console.log('yippppeee', currentNet)

				var url = 'http://localhost:5003/savePositions'
				var body= {name:id, positionObject, currentNet}

				postJson(url,body,function(err,result){
					console.log('client side positions posted')
				})
			})
		}
		else{console.log('ooopsy lnf.savePositions')}
	}

}




