const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const db = require('./db');
const { ObjectId } = require('mongodb');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

app.get('/products/search', (request, response) => {

  let limit = request.query.limit
  let brand = request.query.brand
  let price = request.query.price

  if(limit == null) {limit = 10}

  product = []
  if(brand && price){
    product = db.limit({'brand' : brand, 'price' : {$lt : parseInt(price)}}, parseInt(limit))
  }
  else if(brand == null && price == null){
    product = db.limit({}, parseInt(limit))
  }
  else if(brand == null && price != null){
    product = db.limit({'price' : {$lt : parseInt(price)}}, parseInt(limit))
  }
  else if(brand != null && price == null){
    product = db.limit({'brand' : brand}, parseInt(limit))
  }

  product.then((value) => {
    response.send({'limit' : limit,
                 'brand' : brand,
                 'price' : price,
                 'product' : value});
  })
  

});

app.get('/products/:id', (request, response) => {
  product = db.find({'_id': request.params.id});
  product.then((value) => {
    response.send({'id' : request.params.id,
                 'product': value});
  })
});


