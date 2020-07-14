const express = require('express'); // importing a CommonJS module
const hubsRouter = require('./hubs/hubs-router.js');
const helmet = require('helmet'); // Helps hide headers (like we are using open source express) that could show potential issues
const morgan = require('morgan');

const server = express();

// These are followed in order.  Doesn't matter where the functions or middleware code is below they will follow till they send a response then stop.  

server.use(express.json());
server.use(helmet());

//server.use(lockout);
//server.use(lockout2);

server.use('/api/hubs', hubsRouter);
server.use(lockout2);

// Either of the 2 following works..
// server.use(morgan('dev'));
//server.get('/', morgan('dev'));

// ........ this is what we created
server.use(methodLogger);

server.use(addName);  // allows us to use the nameInsert below


server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});


// Created a middle wear kinda like morgan which is a logger
// this will create the get log but nothing else as there is no response to send
// adding next will allow it to move on to the next request....

function methodLogger(req, res, next) {
  console.log(`${req.method} request`);
  next();
};

function addName(req, res, next) {
  req.name = req.name || 'Melissa';
  //req.name = req.name || req.headers('x-name');
  next();
};

function lockout(req, res, next) {
  res.status(403).json({message: 'api in maint mode'});
}

// Stops the server if this function is true...if fall then moves to the next in the server.use list.
function lockout2(req, res, next){
  let d = new Date()
  let n = d.getSeconds()
  if(n%3 === 0){
    res.status(403).json({message: 'None Shall Pass', seconds: n})
  } else {
    next()
  }
}

// Error handling middlewear = take 4 params

server.use((error, req, res, next) => {
  res.status(error.code).json({message: 'There seems to be an error', error});
})
module.exports = server;
