/* eslint-disable no-console, no-process-exit */
//const dedicatedbrand = require("./sites/dedicatedbrand");
const montlimart = require("./sites/montlimart");
const adresseparis = require("./sites/adresseparis");
const dedicatedapi = require("./sites/dedicatedapi");
const fs = require("fs");

async function sandbox(eshop) {
  try {
    let allProducts = [];
    console.log(`🕵️‍♀️  browsing ${eshop.link} source`);
    const products = await eshop.module.scrape(eshop.link);
    allProducts = await allProducts.concat(products);
    const file = `products/${eshop.brand}.json`;
    fs.writeFileSync(file, JSON.stringify(allProducts));

    console.log("Saved in " + file);
    //process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

//const [, , eshop] = process.argv;
const eshops = [
  {
    module: dedicatedapi,
    brand: "dedicated",
    link: "https://www.dedicatedbrand.com/en/loadfilter",
  },
  {
    module: montlimart,
    brand: "montlimart",
    link: "https://www.montlimart.com/toute-la-collection.html",
  },
  {
    module: adresseparis,
    brand: "adresseparis",
    link: "https://adresse.paris/630-toute-la-collection?id_category=630&n=123",
  },
];

eshops.forEach((eshop) => {
  sandbox(eshop);
});

/*
sandbox({
  module: montlimart,
  link: "https://www.montlimart.com/toute-la-collection.html",
});*/
