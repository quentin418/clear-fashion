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

app.get('/products/search', async(request, response) => {
  
  var match = {};
  var queryAgg = [];
  
  const limit = parseInt(request.query.limit);
  const brand = request.query.brand;
  const price = parseInt(request.query.price);
  var sort = parseInt(request.query.sort);

  if (isNaN(sort)){ //we will sort by ascending price if there are no instruction about sorting
    sort = 1;
  }
  if (brand !== undefined){
    match["brand"] = brand;
  }
  if (isNaN(price)){
  }
  else{
  console.log("not different");
  match["price"] = {$lt:price};
  }
  if(isNaN(limit)){
    queryAgg.push({$match : match});
    queryAgg.push({ $sort: { price: sort } });
    result = await db.aggregate(queryAgg);
  }
  else{
    queryAgg.push({$match : match});
    queryAgg.push({$limit : limit});
    queryAgg.push({ $sort: { price: sort} });
    console.log("query : ", queryAgg);
    result = await db.aggregate(queryAgg);
  }
  console.log(result.length);
  response.send({"limit" : limit, "total" : result.length, "result" : result});
});

app.get('/products/:id', (request, response) => {
  product = db.find({'_id': request.params.id});
  product.then((value) => {
    response.send({'id' : request.params.id,
                 'product': value});
  })
});