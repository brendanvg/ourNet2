var gnfModule = require('./genericNetFunctions.js')
var lnfModule = require('./lifeNetFunctions.js')
var http = require('http')
http.post = require('http-post')
var gnf = gnfModule()
var lnf = lnfModule()
var xhr= require('node-xhr')
var cytoscape = require('cytoscape')

//ALL GRAPH SELECTION IS DONE HERE 

// window.onload=function(){
//   lnf.loadNodes
//   lnf.loadEdges
// }

cy.style().selector('node:selected').style('background-color', 'magenta')

//Event Listeners

//at network start listeners
var postNewNet= document.getElementById('postNewNet')
postNewNet.addEventListener('click',lnf.postNewNet)

var loadNets = document.getElementById('loadNets')
loadNets.addEventListener('click',lnf.loadNets)

var checkDb= document.getElementById('checkDb')
checkDb.addEventListener('click',lnf.checkDb)

function onIndexLoad () {
  lnf.loadNets()
}

onIndexLoad()

var loadGroups=document.getElementById("loadGroups")
loadGroups.addEventListener("click", lnf.loadGroups)

var loadEdges2=document.getElementById("loadEdges2")
loadEdges2.addEventListener("click", lnf.loadEdges)

var savePositions=document.getElementById('savePositions')
savePositions.addEventListener('click', lnf.savePositions)

var postJson1=document.getElementById("postJson1")
postJson1.addEventListener("click", lnf.createNewNode)

var addNet1 = document.getElementById('addNet1')
addNet1.addEventListener('click', lnf.addNet)

// var enterChat = document.getElementById('enterChat')
// enterChat.addEventListener('click', lnf.enterChat)

var clear = document.getElementById('clear')
clear.addEventListener('click', lnf.clearAllNodes)

$('.groups').click(function(){
  console.log('he')
})


/*window.onload=function(){*/
//nClicked=false, first click, true,second click
var nClicked = false;
var firstNode = {}
var secondNode = {}
var edgeClicked=false;

// var firstNodeId = firstNode.id()
// var secondNodeId = secondNode.id()
function tapOnEdges(){
  cy.on('tap','edge', function(evt){
    if (edgeClicked) {
      edgeClicked=false
      window.open('http://localhost:5003/edgeInfo/'+evt.cyTarget.id(), 'Edge Info', 'height= 470, width=470, return false') 

    }
    else {
      edgeClicked=true
    }
  })
}

function tapOnNodes () {
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
        window.open('http://localhost:5003/nodeInfo/'+evt.cyTarget.id(), 'Node Info', 'height= 470, width=470, return false') 
      }
      else {
        // console.log('nodes2',firstNodeId, secondNodeId)
  	   lnf.addNewEdge(firstNodeId, secondNodeId)  
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