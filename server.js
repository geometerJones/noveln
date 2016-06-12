//TODO make this a .ts file?
var express = require('express');
var app = express();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

var mongojs = require('mongojs');
var db = mongojs('mongodb://admin:admin123@ds015713.mlab.com:15713/novel_n', ['notes', 'users', 'edges']);

var neo4j = require('neo4j-driver').v1;
//var driver = neo4j.driver('https://neo-heroku-ova-tromp-greenyellow.digital-ocean.graphstory.com:7473', neo4j.auth.basic('neo_heroku_ova_tromp_greenyellow', 'o8srgZVq9ZsnVZVC8QLJkX7HsrSsoGyhX7la3rpE'));

var gdb = require('seraph')({
  server: 'https://neo-heroku-ova-tromp-greenyellow.digital-ocean.graphstory.com:7473',
  user: 'neo_heroku_ova_tromp_greenyellow',
  pass: 'o8srgZVq9ZsnVZVC8QLJkX7HsrSsoGyhX7la3rpE'
});

var passwordHash = require('password-hash');

var jwt = require('jsonwebtoken');
var secret = 'ieatbats';

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');

// setup view engine? 
//app.set('views', path.join(__dirname, 'views'));
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/node_modules', express.static('node_modules'));
app.use('/app', express.static('app'));


//TODO get these to work outside?
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, '/styles.css'));
});
app.get('/systemjs.config.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'systemjs.config.js'));
});

app.get('sigma', (req, res) => {
  res.sendFile(path.join(__dirname, 'force.html'));
});

//TODO split into routes

// auth
var getToken = (user, callback) => {
  payload = {userid:user.id, username: user.username};
  jwt.sign(payload, secret, {}, callback);
};
var checkToken = (req, res, next) => {
  jwt.verify(req.headers.token, secret, (err, payload) => {
    if (err) {
      res.status(401).json({message: 'authentication required'});
    } else {
      console.log('userid',payload.userid);
      req.headers.userid = payload.userid;
      req.headers.username = payload.username;
      next();
    }
  });
};
// TODO register user
app.post('/api/register', (req, res, next) => {
  var data = req.body;
  if (!data || !data.username || !data.password) {
    res.status(400).json({message:'(username, password) required'});
  } else {
    gdb.query(
      'MATCH (u:User {username: {username}}) RETURN u',
      data,
      (err, result) => {
        if (err) { console.error(err); res.status(500).send(err); }
        else {
          console.log(result);
          if (result.length > 0) {
            res.status(402).json({message: 'username unavailable'});
          } else {
            data.hash = passwordHash.generate(data.password);
            gdb.query(
              `CREATE (u:User:Real{username:{username}, password:{hash}, presented:timestamp()})
              RETURN u`,
              data,
              (err, result) => {
                if (err) { console.error(err); res.status(500).send(err); }
                else {
                  console.log(result);
                  var user = result[0];
                  getToken(user, (err, token) => {
                    if (err) { console.error(err); res.status(500).send(err); }
                    else {
                      console.log(token);
                      res.json({token: token, user: user});
                    }
                  });
                }
              });
          }
        }
      });
  }
});
app.post('/api/login', (req, res, next) => {
  var data = req.body;
  if (!data || ! data.username || !data.password) {
    res.status(400).json({message: '(username, password) required'});
  }
  else {
    gdb.query(
      'MATCH (u:User:Real{username:{username}}) RETURN u',
      data,
      (err, result) => {
        console.log(result);
        if (err) { console.error(err); res.status(500).send(err); }
        else if (result.length == 1) {
          var user = result[0];
          if (passwordHash.verify(data.password, user.password)) {
            getToken(user, (err, token) => {
              if (err) { console.error(err); res.status(500).send(err); }
              else { 
                res.json({token: token, user: user});
              }
            });
          } else {
            res.status(401).json({message: '(username, password) invalid'});
          }
        } else {
          res.status(401).json({message: '(username, password) invalid'});
        }
      });
  }
});

// get notation (notes and edges) for the user named by the token
app.get('/api/notation', checkToken, (req, res, next) => {
  console.log(req.headers);
  gdb.query(// quotes cannot be edited
    `MATCH (u:User:Real)-[:PRESENTS]->(n:Note:Real) WHERE id(u) = {userid}
    OPTIONAL MATCH (n)-[r]->(m:Note:Real)
    RETURN n as note, collect(r) as out_relations`, // no contacts, only notes
    {userid: req.headers.userid},
    (err, result) => {
      if (err) { res.status(500).send(err); }
      else {
        console.log(result);
        res.json(result);
      }
    });
});
/*
app.get('/api/shares', checkToken, (req, res, next) => {
  gdb.query(
    `MATCH (u:User:Real)-[:SHARES]->(n:Note:Real)
    OPTIONAL MATCH (n)-[r:RELATION]->(m:Note:Real)<-[:SHARES]-(u)
    WHERE id(u) = {userid}
    WITH u, n, collect(r) as relations
    MATCH (u)-[:SHARES]->(v:User:Real)
    OPTIONAL MATCH (v)-[:PUBLISHED]->(m:Note:Real)
    OPTIONAL MATCH (m)-[r:RELATION]->(o:Note:Real)<-[:PUBLISHED]-(v)
    )
});*/
app.post('/api/note', checkToken, (req, res, next) => {
  var note = req.body;
  console.log('post note',note);
  if (!note.x || !note.y) { //TODO check if note has an id?
    res.status(400).json({message: 'invalid data'});
  } else {
    gdb.query(
      `MATCH (u:User:Real) WHERE id(u) = {userid}
      CREATE (u)-[p:PRESENTS]->(n:Note:Real)
      SET n = {note}, n.presented = timestamp(), n.presentedby = {userid}
      RETURN n`,
      {userid: req.headers.userid, note: note},
      (err, result) => {
        if (err) { console.error(err); res.status(500).send(err); }
        else {
          res.json(result[0]);
        }
      });
  }
});
var scrubNote = (note) => {
  var updObj = {};
  if (note.text) {
    updObj.text = note.text;
  }
  if (note.x) {
    updObj.user_x = note.user_x;
  }
  if (note.y) {
    updObj.user_y = note.user_y;
  }
  if (note.height) {
    updObj.height = note.height;
  }
  if (note.width) {
    updObj.width = note.width;
  }
  if (note.fixed !== undefined) {
    updObj.fixed = note.fixed;
  }
  if (note.flagged !== undefined) {
    updObj.flagged = note.flagged; // filter by hasOwnProp?
  }
  console.log('original',note);
  console.log('update',updObj);
  return updObj;
};

app.put('/api/note/:id', checkToken, (req, res, next) => {
  let note = scrubNote(req.body);
  if (!note) { res.status(400).json({message: 'invalid data'}); }
  else {
    let params = {
      userid: req.headers.userid,
      noteid: parseInt(req.params.id),
      note: note
    };
    console.log('params', params);
    gdb.query(
      `MATCH (n:Note:Real) WHERE id(n) = {noteid} 
      SET n += {note},  n.lastmodified = timestamp(), n.lastmodifiedby = {userid}
      RETURN n`,
      params,
      (err, result) => {
        if (err) { res.status(500).send(err); }
        else {
          console.log('result',result);
          res.json(result[0]);
        }
      });
  }
});
app.delete('/api/note/:id', checkToken, (req, res, next) => {
  let params = {
    userid: req.headers.userid,
    noteid: req.params.id
  };
  gdb.query(
    `MATCH (n:Note:Real) WHERE id(n) = {noteid}
    REMOVE n:Real
    SET n.deleted = timestamp(), n.deletedby = {userid}
    RETURN n`,
    params,
    (err, result) => {
      if (err) { res.status(500).send(err); }
      else {
        console.log(result[0]);
        res.json({message:'wait, what note? lol.'})
      }
    });
});
app.post('/api/relation', checkToken, (req, res, next) => {
  let relation = req.body;
  console.log(relation);
  if (!relation.sourceid || !relation.targetid || !relation.text) {
    res.status(400).json({message: 'invalid data'});
  } else {
    gdb.query(
      `MATCH (n:Note), (m:Note)
      WHERE id(n) = {relation.sourceid}, id(m) = {relation.targetid}
      CREATE (n)-[r:RELATESTO]->(m)
      SET r = {relation}, r.presented = timestamp(), r.presentedby = {userid}
      RETURN r`,
      {userid:req.header.userid, relation: relation},
      (err, result) => {
        if (err) { res.status(500).send(err); }
        else {
          console.log(result);
          res.json(result);
        }
      });
  }
});
var scrubRelation = (relation) => {
  var updObj = {};
  if (relation.text) {
    updObj.text = relation.text;
  }
  console.log('original',relation);
  console.log('update',updObj);
  return updObj;
};
app.put('/api/relation/:id', checkToken, (req, res, next) => {
  let relation = scrubRelation(req.body);
  console.log(relation);
  if (!relation) { res.status(400).json({message: 'invalid data'}); }
  else {
    gdb.query(
      `MATCH (n:Note)-[r:RELATESTO]->(m:Note) WHERE id(r) = {relationid}
      SET r += relation, r.lastmodified = timestamp(), r.lastmodifiedby = userid
      RETURN r`, // TODO n and m needed?
      {userid: req.headers.userid, relationid: req.params.id, relation: relation},
      (err, result) => {
        if (err) { res.status(500).send(err); }
        else {
          console.log(result[0]);
          res.json(result[0]);
        }
      });
  }
})
app.delete('/api/relation/:id', checkToken, (req, res, next) => {
  if (!relation) { res.status(400).json({message: 'invalid data'}); }
  else {
    gdb.query(
      `MATCH (n:Note)-[r:RELATESTO]->(m:Note) WHERE id(r) = {relationid}
      REMOVE r:RELATESTO
      SET r:_RELATESTO, r.deleted = timestamp(), r.deletedby = {userid}`, // TODO n and m needed?
      {relationid: req.params.id},
      (err, result) => {
        if (err) { res.status(500).send(err); }
        else {
          console.log(result[0]);
          res.json(result);
        }
      });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

/*
io.on('connection', (socket) => {
  console.log('a user has connected');
  socket.broadcast.emit('chat message', 'I have arrived!');
  socket.on('chat message', (message) => {
    console.log(message);
    io.emit('chat message', message);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});*/

var server = app.listen(3000, () => {
  console.log('listening on 3000');
});
/*
http.listen(3000, function() {
  console.log('listening on 3000');
});*/
