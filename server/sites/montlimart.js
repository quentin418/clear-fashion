const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { v5: uuidv5 } = require("uuid");

/**
 * Parse webpage restaurant
 * @param  {String} data - html response
 * @return {Object} restaurant
 */
const parse = (data) => {
  const $ = cheerio.load(data);

  return [
    $(".product-info")
      .map((i, element) => {
        const link = $(element).find(".product-name a").attr("href");
        return {
          link,
          brand: "montlimart",
          price: parseFloat($(element).find(".price").text()),
          name: $(element)
            .find(".product-name a")
            .attr("title")
            .replace(/\s/g, " "),
          photo: $(element).parent().find("img").attr("src"),
          _id: uuidv5(link, uuidv5.URL),
        };
      })
      .get(),
    $(".pages .next").length > 0,
  ];
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async (url) => {
  try {
    let allProducts = [];
    for (let i = 1; i < 10; i++) {
      const response = await fetch(url + "?p=" + i);
      if (response.ok) {
        const body = await response.text();
        const products = parse(body);
        if (products[1]) allProducts = allProducts.concat(products[0]);
        else return allProducts.concat(products[0]);
      } else {
        console.error(response);
        return null;
      }
    }
    return allProducts;
  } catch (error) {
    console.error(error);
    return null;
  }
};