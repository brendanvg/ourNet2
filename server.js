var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var loginDb = require('./db');
var cors = require('cors')
var levelup = require('levelup')
var db = levelup('./appDataDb', {valueEncoding:'json'})
var body = require('body/any')
var groupsDb = levelup('./groupsFlintDb')
var netsDb = levelup('./netsDb1')
var netListDb= levelup('./netListDb')
var h = require('hyperscript')
var hyperstream = require('hyperstream')
var fs = require('fs')
var app = express();
var accessDb = levelup('./accessDb')
var server = app.listen(5003, function(){
  console.log('listening on port 5003')
})
var path = require('path')


//BETTER DATA STRUCTURE 
//key: network, 
//value is an array of objects, each object is a node with 
//specific properties...group property searched to highlight
//and group like nodes (node can be in more than one group in a network)
// value: [{
//     nodeName : nodeName,
//       group: group,
//     position: {x, y},
//     edges: {in: [inEdge1,inEdge2,.....], out: [outEdge]},
//     edge: [[inEdge, inEdge],[outEdge,outEdge]
//}]

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-locals'));


var corsOption = {
  origin: 'http://localhost:5003'
}
var collect = require('collect-stream')

app.use(express.static('public'))

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    loginDb.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  loginDb.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});




// Create a new Express application.
var io = require('socket.io')(server)
//socket is the object that is assigned to a new client (their connection)
io.on('connection',function(socket){
  //emits what was received from socket to all on connection
  socket.on('news', function (data){
    io.emit('news', data)
  })
})



// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });


app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
/*    res.redirect('/');
*/
res.sendFile(path.join(__dirname, '/public', 'index.html'));
});
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.get('/home', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req,res){
    var user = req.user
    console.log(user)
res.sendFile(path.join(__dirname, '/public', 'index.html'));
  })

app.get('/signUp', function (req,res){
  res.render('signUp')
})

app.post('/signUp2', function(req,res){
  var records = loginDb.users.records
  var lastId = records[records.length -1].id
  var newId = lastId +1 
  console.log('doinnnn something', records, 'then', lastId, 'then2', newId)
  var username= req.body.username
  console.log('worked', username)
  var body = {
    id: newId,
    username: req.body.username,
    password: req.body.password,
    displayName: req.body.username,
    emails: [req.body.email]
  }

  records.push(body)
  accessDb.put(username, function(err){
    if (err) return console.log('oops', err)
  })
  res.render('login', {
      message:' '
  })
})

app.get('/checkDb/:net',function(req,res,next){
  db.get(req.params.net, function(err,value){
    console.log('currently selected Net includes::::::::',value)
  })
})

app.get('/enterChat', function(req,res,next){
  res.sendFile('http://localhost:5003/public/chat.html')
})


app.get('/nodeInfo/:currentNet/:nodeName', function(req,res, next){
  var currentNet = req.params.currentNet
  var nodeName = req.params.nodeName
  
  console.log('hiii', currentNet, 'annnd', nodeName)
  db.get(currentNet, function(err,value){
    
    if (err) console.log(err)
    
    else {
      value.forEach(function(arrayItem){
        if (arrayItem === nodeName) {
          res.render('nodeInfoForm', {pageContent:arrayItem.group})
        }
      })
    }
  })
})

app.get('/graphSpecificGroup/:key', function(req,res){
  var group = req.params.key
  console.log('heres my comparison', group)


  var finalDataArray= []

  db.createReadStream()
  .on('data', function(data){
    var array = data.value.split(',')
    if (array[0] === group) {
      console.log('woootyyyy',array[0], array[1], array[2])
      console.log('ohhhyea', data, typeof data)
    finalDataArray.push(data) 
    console.log('updated array', finalDataArray)
    }
  })

  .on('error', function (err) {
      console.log('Oh my!', err)
    })
    .on('close', function () {
      console.log('Stream closed')
    })
    .on('end', function () {
      console.log('Stream ended')
    res.end(JSON.stringify(finalDataArray))

    })
})

app.get('/graphSpecificNet/:key', function(req,res){
  var net= req.params.key

  var finalDataArray2= []
  db.get(net, function(err,value){
    if(err){
      if (err.notFound){
        console.log('not found')
        return
      }
      return callback(err)
    }
    else {
      console.log('yessssss', value)
      
      res.end(JSON.stringify(value))

    }
  })
})


app.get('/loadGroups', cors(corsOption), function (req,res,next){
  var stream = groupsDb.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.get('/loadNets3', cors(corsOption), function (req,res,next){
  var stream = netsDb.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.get('/loadNets', cors(corsOption), function (req,res,next){
  var currentUser= req.user
  console.log('I am: ', currentUser)

  var stream = db.get(currentUser, function(err, value){
    console.log('woooot!', value)
    res.end(value)
  })
  /*var finalDataArray= []
  var stream = db.createKeyStream() 
  .on('data', function(data){
    console.log('aaaa',data)
    finalDataArray.push(data) 
    console.log('bbb',finalDataArray)
  })

  .on('error', function (err) {
      console.log('Oh my!', err)
    })
    .on('close', function () {
      console.log('Stream closed')
    })
    .on('end', function () {
      console.log('Stream ended', finalDataArray)
    
    res.end(JSON.stringify(finalDataArray))

    })*/
})


app.post('/addGroup', cors(corsOption), function (req,res,next){
  body(req,res,function(err,params){
    var group= params.nodeGroup
    var node = params.nodeName

    groupsDb.get(group, function(err,value){
      if (err){
        if (err.otFound){
          groupsDb.put(group, node, function(err){
            if (err) console.log(err)
          })
        }
        else console.log('uhoh',err)
      }
      else {
        value+=','+node
          groupsDb.put(group,value, function(err){
            if (err) console.log(err)
          })
      }
    })
  })
  res.end()
})

/*app.post('/addNet', cors(corsOption), function (req,res,next){
  body(req,res,function(err,params){
    var netName= params.netName

    netsDb.get(netName, function(err,value){
      if (err){
        if (err.notFound){
          netsDb.put(netName, node, function(err){
            if (err) console.log(err)
          })
        }
        else console.log('uhoh',err)
      }
      else {
        value+=','+node
          netsDb.put(group,value, function(err){
            if (err) console.log(err)
          })
      }
    })
  })
  res.end()
})*/

app.post('/addNet', cors(corsOption), function(req,res,next){
  body (req,res, function(err,params){
    var netName = params.netName
    var description = params.netDescription
    var invitePeople = params.invitePeople
    var currentUser= req.user.username
    console.log('this is my user', currentUser)
    accessDb.get(currentUser, function(err,value){
      console.log('this is my value', value)
      var updatedValue = value.push(netName)
      accessDb.push(currentUser, updatedValue, function(err){
        if (err) {return console.log('uhhoh', err)}
          else {'updated that!! ', updatedValue}
      })
    })
  })
})


app.get('/graphAllNodes', cors(corsOption), function(req,res,next){
  var stream = db.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.get('/loadEdges', cors(corsOption), function(req,res,next){
  var stream = db.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application//JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.post('/addNode', cors(corsOption), function(req,res,next){
  body(req,res, function(err,params){
    console.log('ooooooowwww',params.nodeName)
    //var value11 = params.nodeGroup+','+200+','+200
    
    var name = params.nodeName
    var nets= params.nodeNetworks
    var groups = params.nodeGroup 
    var initPosition = params.position

    //TODO: parse nets to see if we're adding multiple nets or just one


    db.get(nets, function(err,value){
      if (err) {
        if (err.notFound){
          var arrayOfObjects = []
          var nodeObj = {} 
            nodeObj.nodeName = name;
            nodeObj.group = groups;
            nodeObj.position=initPosition;
            nodeObj.edges = {in:[],out:[]}

          arrayOfObjects.push(nodeObj);
          console.log('xxx', nodeObj, arrayOfObjects)
          // array.push([])
          // var inEdges= array[0]
          // var outEdges=array[1]
          // outEdges.push('!'+params.secondNode)

        db.put(nets, arrayOfObjects, function(err){
            if(err) return console.log(err)
            else {
              db.get(nets, function(err,value){
                console.log('the big addNode check for db', value)
              })
            }
          })
        }
        
        else {console.log(err)}

      }

      else{
        var arrayOfObjects2=value
        var nodeObj= {}
          nodeObj.nodeName=name
          nodeObj.group = groups
          nodeObj.position=initPosition
          nodeObj.edges = {in:[],out:[]}


        arrayOfObjects2.push(nodeObj)
        db.put(nets, arrayOfObjects2, function(err){
          if (err) {console.log('nooo',err)}
          else {
            db.get(nets, function(err,value){
                console.log('the big addNode check for db of saamme net', value)
            })
          }
        })

      }  
    })
  })
  res.end()
})

app.post('/test', cors(corsOption), function(req,res,next){
  body(req,res,function(err,params){
    
    console.log('wooooooo!')
    edgesDb.get(params.firstNode, function(err,value){
      console.log('firstNode', value)
    })
    edgesDb.get(params.secondNode, function(err,value){
      console.log('secondNode', value)
    })
  })
})
//need to make edgesDb key: node, value: [[inEdge, inEdge],[outEdge,outEdge]]
app.post('/addEdge', cors(corsOption), function(req,res,next){
  body(req,res,function(err,params){
    console.log('in Node out Node',params)

    db.get(params.net, function(err,value){

      
      var updatedValue = value
      console.log('this is my original updated value', updatedValue, 'and', typeof updatedValue)


/*      value.forEach(function(arrayItem){
*/      
      for (var i = 0; i < value.length; i++) {
        if (value[i].nodeName === params.firstNode){

          console.log('valuei', value[i], 'and updatedValuei ', updatedValue[i])
          updatedValue[i].edges.out.push(params.secondNode)
          console.log('this is what i did: ', updatedValue)
          console.log('and this is out: ', updatedValue[i].edges.out)
        }

        if (value[i].nodeName === params.secondNode){

          console.log('implement secondNode in matching here')

          console.log('valuei222', value[i], 'and updatedValuei22 ', updatedValue[i])
          updatedValue[i].edges.in.push(params.firstNode)
          console.log('this is what i did 2222: ', updatedValue)
          console.log('and this is in 222: ', updatedValue[i].edges.out)
      
        }
        else{console.log('didnt match nothing')}

      }
      db.put(params.net, updatedValue, function(err){
        console.log('oooh no', err)
        console.log('successfully updated')
      })
    })
  })

  res.end()
})


app.post('/savePositions', cors(corsOption), function(req,res,next){
  body(req,res,function(err,params){
    var positionObject = params.positionObject
    var nodeName1 = params.name
  



    db.get(params.currentNet, function(err,value){
      console.log('wwwwwwwwwwwwwwwwwwwww', value, typeof value)
      var arrayOfObjects = value
      
      value.forEach(function(arrayItem){
        if (arrayItem.nodeName === nodeName1){
          console.log('fuuuuuuuuk', arrayItem.nodeName, nodeName1)
          arrayItem.position=positionObject
/*          arrayOfObjects.push(arrayItem)
*/        }
        else{
          /*arrayOfObjects.push(arrayItem)
          console.log('poooooooop', arrayOfObjects, 'then', arrayItem,'annnnd',arrayItem.nodeName, nodeName1)
*/
        console.log('dont change this nodes position its not time')
        }
      })

      db.put(params.currentNet, value/*arrayOfObjects*/, function(err){
        console.log('did it')
      })

      db.get(params.currentNet, function(err,value){
        console.log('thebiiiiiiiiiiiiiig check', value)
      })
    })  
  })
  res.end()
})
