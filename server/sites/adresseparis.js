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

  return $(".right-block")
    .map((i, element) => {
      return {
        link: $(element).find(".product-name").attr("href"),
        brand: "adresse paris",
        price: parseFloat($(element).find(".price").text()),
        name: $(element).find(".product-name").attr("title"),
        photo: $(element).parent().find(".product_img_link").attr("href"),
      };
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async (url) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const body = await response.text();
      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};