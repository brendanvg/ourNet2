var hyperquest = require('hyperquest')
var catS = require('concat-stream')
var records = [
    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [ { value: 'jack@example.com' } ] }
  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ] }
];

/*exports.records = records
*/


function loadRecords() {
  hyperquest('http://localhost:5003/loadRecords')
  .pipe(
    catS(function(data){
      var x = data.toString()
      var y = JSON.parse(x)
      console.log('this is recordssss: ', y)
    })
  )
  return y
}

exports.findById = function(id, cb) {
  var records = loadRecords()
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  var records = loadRecords() 
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}
