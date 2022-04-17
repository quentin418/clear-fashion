const { closest } = require("cheerio/lib/api/traversing");
const fs = require("fs");
let products = [];

const { MongoClient } = require("mongodb");
const MONGODB_URI = "mongodb+srv://quentinpelet:Quentin5!@cluster0.zjkan.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const MONGODB_DB_NAME = "clearfashion";
let client;
let db;
let collectionProducts;

const connect = (module.exports.connect = async () => {
  if (db) console.log("Already connected");
  else {
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
    });
    db = await client.db(MONGODB_DB_NAME);
    collectionProducts = await db.collection("products");
    console.log(collectionProducts)
    console.log("Connection success");
  }
});

const insert = (module.exports.insert = async (products) => {
  try {
    //shuffle
    products.sort(() => 0.5 - Math.random());
    await connect();
    const results = await collectionProducts.insertMany(products, {
      ordered: false,
    });
    console.log("Everything was insered");
    return results;
  } catch (error) {
    console.log(error);
    return null;
  }
});

const close = (module.exports.close = async () => {
  await client.close();
  console.log("Connection closed");
});

const find = (module.exports.find = async (
  query = {},
  projection = {},
  sort = {},
  limit = 0
) => {
  try {
    await connect();
    const result = await collectionProducts
      .find(query)
      .project(projection)
      .sort(sort)
      .limit(limit)
      .toArray();
    return result;
  } catch (error) {
    console.log(error);
  }
});

const findDistinct = (module.exports.findDistinct = async (col) => {
  try {
    await connect();
    const result = await collectionProducts.distinct(col);
    // await close();
    return result;
  } catch (error) {
    console.log(error);
  }
});

const deleteProducts = () =>
  connect()
    .then(() => collectionProducts.deleteMany())
    .then(close);

const test = async () => {
  const p = await findDistinct("brand");
  await console.log(p);
  await close();
};

module.exports.aggregate = async query => {
  try {
    const db = await connect();
    const result = await collectionProducts.aggregate(query).toArray();

    return result;
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};