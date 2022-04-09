const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongo = require("./db");
const assert = require("assert");

const PORT = 8092;

const app = express();
let products = [];

module.exports = app;

app.use(require("body-parser").json());
app.use(cors());
app.use(helmet());

app.options("*", cors());

app.get("/", (request, response) => {
  response.send({ ack: true });
});

/*
app.get("/products", async (request, response) => {
  products = await mongo.find();
  response.send(products);
});*/

const paginate = (currentPage, count, rows, pageLimit = 20) => {
  const meta = {
    currentPage: Number(currentPage) || 1,
    pageCount: Math.ceil(count / Number(pageLimit)),
    pageSize: rows.length,
    count,
  };
  return meta;
};

const offsetLimit = (currentPage, pageLimit = 12) => {
  const offset =
    (currentPage ? Number(currentPage) - 1 : 0) * Number(pageLimit);
  const limit = Number(pageLimit);
  return { offset, limit };
};

app.get("/products", async (request, response) => {
  products = await mongo.find();
  response.send(products);
});

app.get("/brands", async (request, response) => {
  products = await mongo.findDistinct("brand");
  response.send(products);
});

app.get("/:id", async (request, response) => {
  const product = await mongo.find({ _id: request.params.id });
  await response.send(product);
});

app.get("/products/:search", async (request, response) => {
  const query = request["query"];

  const page = query["page"] ? parseInt(query["page"]) : 1;
  const size = query["size"] ? parseInt(query["size"]) : 12;
  delete query["page"];
  delete query["size"];

  if (query["price"]) {
    const qprice = query["price"].split(":");
    if (qprice.length > 1) {
      query["price"] = {};
      query["price"][qprice[0]] = parseFloat(qprice[1]);
    } else query["price"] = parseFloat(query["price"]);
  }

  if (query["released"]) {
    const qreleased = query["released"].split(":");
    if (qreleased.length > 1) {
      query["released"] = {};
      query["released"][qreleased[0]] = qreleased[1];
    }
  }

  if (query["_id"]) {
    const qid = query["_id"].split(":");
    if (qid.length > 1) {
      query["_id"] = {};
      query["_id"][qid[0]] = qid[1].split(",");
    }
  }

  const projection = {};
  const sort = {};

  if (query["sort"]) {
    const qsort = query["sort"].split(":");
    sort[qsort[0]] = parseInt(qsort[1]);
    delete query["sort"];
  }

  const info = query["info"];
  delete query["info"];
  console.log(query);
  products = await mongo.find(query, projection, sort);
  let _data;
  if (info) {
    const infos = {};
    infos["nbNew"] = products ? products.length : 0;
    await mongo
      .find(query, { released: 1 }, { released: -1 }, 1)
      .then((res) => {
        try {
          infos["lastReleased"] = res[0].released;
        } catch {
          infos["lastReleased"] = "";
        }
        console.log(infos);
        _data = infos;
      });
  } else {
    if (products) {
      const count = products.length;
      const { limit, offset } = offsetLimit(page, size);
      const rows = products.slice(offset, offset + limit);
      const meta = paginate(page, count, rows, size);

      products = products.slice(page * size - size, page * size);

      const _result = { result: products, meta };
      _data = { success: true, data: _result };
    } else _data = { success: false };
  }
  response.send(_data);
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);