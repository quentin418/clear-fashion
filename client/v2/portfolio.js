// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentBrand = "all";

// instantiate selectors
const selectShow = document.querySelector("#show-select");
const selectPage = document.querySelector("#page-select");
const selectBrand = document.querySelector("#brand-select");
const sectionProducts = document.querySelector("#products");


//Indicators
const spanNbProducts = document.querySelector("#nbProducts");
const spanNbNewProducts = document.querySelector("#nbNewProducts");
const spanNbDispProducts = document.querySelector("#nbDispProducts");

const spanP50 = document.querySelector("#p50");
const spanP90 = document.querySelector("#p90");
const spanP95 = document.querySelector("#p95");
const spanLastReleased = document.querySelector("#lastReleased");

const checkReleased = document.querySelector("#recentlyReleased");
const checkPrice = document.querySelector("#reasonablePrice");

//Sort
const selectSort = document.querySelector("#sort-select");

//Favorite product
const checkFavoriteProducts = document.querySelector("#favoriteProducts");
const checkFav = document.getElementsByClassName("favProduct");

let favorites = {};

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({ result, meta }) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return { currentProducts, currentPagination };
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return { currentProducts, currentPagination };
  }
};

/**
 * Feature 3 - Filter by recent products
As a user
I want to filter by recent products
So that I can browse the new released products (less than 2 weeks)
 */
const filterByReleased = (products) => {
  return products.filter((product) => {
    const one_day = 24 * 60 * 60 * 1000;
    const diff = (new Date() - new Date(product.released)) / one_day;
    if (diff < 15) return product;
  });
};

/**
 * Feature 4 - Filter by reasonable price
As a user
I want to filter by reasonable price
So that I can buy affordable product i.e less than 50 €
 */
const filterByPrice = (products) => {
  return products.filter((product) => {
    if (product.price <= 50) return product;
  });
};

/**
 * Feature 5 - Sort by price
As a user
I want to sort by price
So that I can easily identify cheapest and expensive products
AND
  Feature 6 - Sort by date
As a user
I want to sort by price
So that I can easily identify recent and old products
 */
const sortBy = (products) => {
  switch (selectSort.value) {
    case "price-asc":
      products.sort((p1, p2) =>
        p1.price < p2.price ? -1 : p1.price === p2.price ? 0 : 1
      );
      break;

    case "price-desc":
      products.sort((p1, p2) =>
        p1.price < p2.price ? 1 : p1.price === p2.price ? 0 : -1
      );
      break;

    case "date-asc":
      products.sort((p1, p2) =>
        p1.released < p2.released ? 1 : p1.released === p2.released ? 0 : -1
      );
      break;

    case "date-desc":
      products.sort((p1, p2) =>
        p1.released < p2.released ? -1 : p1.released === p2.released ? 0 : 1
      );
      break;
  }
};

/**
  Feature 10 - p50, p90 and p95 price value indicator
As a user
I want to indicate the p50, p90 and p95 price value
So that I can understand the price values of the products
 */
const getP = (products, pVal) => {
  let sortedProducts = products.slice();
  sortedProducts.sort((p1, p2) =>
    p1.price < p2.price ? 1 : p1.price === p2.price ? 0 : -1
  );
  const n = Math.floor(sortedProducts.length * (pVal / 100));
  return sortedProducts[n].price;
};


/**
 * Create a template of a table for displaying the products
 * @param {Array} products
 * @returns
 */
const createTemplate = (products) => {
  let template = `
  <table>
    <thead>
      <tr>
        <th>Brand</th>
        <th>Product</th>
        <th>Price</th>
        <th>Released</th>
        <th>Favorite</th>
      </tr>
  </thead>
  <tbody>`;
  template += products
    .map((product) => {
      return `
    <tr class="product" id=${product.uuid}>
      <th>${product.brand}</th>
      <th><a href="${product.link}">${product.name}</a></th>
      <th>${product.price}€</th>
      <th>${product.released}</th>
      <th><input class="favProduct" type="checkbox"></input></th>
    </tr>
  `;
    })
    .join("");
  template += "</tbody></table>";

  return template;
};

/**
 * Get the date of the last released displayed product
 * @param {Array} products
 * @returns Date of the last released displayed product
 */
const getLastReleased = (products) => {
  let sortedProducts = products.slice();
  sortedProducts.sort((p1, p2) =>
    p1.released < p2.released ? 1 : p1.released === p2.released ? 0 : -1
  );
  return sortedProducts[0].released;
};

/**
  Feature 13 - Save as favorite
As a user
I want to save a product as favorite
So that I can retreive this product later
 */
const manageFavorite = (products) => {
  [...checkFav].forEach((chk) => {
    chk.addEventListener("change", (event) => {
      const id = chk.parentElement.parentElement.id;
      const product = products.find((product) => product.uuid === id);
      product.favorite = chk.checked;
      if (product.favorite) favorites[id] = product;
      else delete favorites[id];
      refresh();
    });
  });

  if (products) {
    products.forEach((product) => {
      const isFav = favorites[product.uuid];
      if (isFav) {
        [...checkFav].find(
          (chk) => chk.parentElement.parentElement.id === product.uuid
        ).checked = true;
      }
    });
  }
};


/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = (products) => {
  let toDisplay = checkFavoriteProducts.checked
    ? Object.values(favorites)
    : products;
  toDisplay =
    currentBrand == "all" ? toDisplay : byBrands(toDisplay)[currentBrand];

  const fragment = document.createDocumentFragment();
  const div = document.createElement("div");

  spanNbNewProducts.innerHTML = 0;
  let template;

  if (toDisplay && toDisplay.length > 0) {
    //if we choose a loom in page 1 that doesn't exist in page 2,
    //it can create problems, so we check toDisplay isn't empty

    //filtering
    const newProducts = filterByReleased(toDisplay);
    if (checkReleased.checked) toDisplay = newProducts;
    if (checkPrice.checked) toDisplay = filterByPrice(toDisplay);

    //sorting
    sortBy(toDisplay);

    //get the p50,p90,p95 values
    spanNbNewProducts.innerHTML = newProducts.length;
    spanP50.innerHTML = getP(toDisplay, 50) + "€";
    spanP90.innerHTML = getP(toDisplay, 90) + "€";
    spanP95.innerHTML = getP(toDisplay, 95) + "€";

    //Display date of the last released product in the displayed list
    spanLastReleased.innerHTML = getLastReleased(toDisplay);

    template = createTemplate(toDisplay);
  } else {
    template = `<p>No ${currentBrand} products in that page.</p>`;
    currentBrand = "all";
  }

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = "<h2>Products</h2>";
  sectionProducts.appendChild(fragment);

  manageFavorite(toDisplay);

  spanNbDispProducts.innerHTML = toDisplay ? toDisplay.length : 0;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = (pagination) => {
  const { currentPage, pageCount } = pagination;
  const options = Array.from(
    { length: pageCount },
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join("");

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render brand selector
 * @param {Object} brand
 */
const renderBrand = (brands) => {
  let options = '<option value = "all">All brands</option>\n';
  Object.keys(brands).forEach((brand) => {
    options += `<option value = "${brand}">${brand}</option>\n`;
  });

  selectBrand.innerHTML = options;
  if (currentBrand == "all") selectBrand.selectedIndex = 0;
  else
    selectBrand.selectedIndex = Object.keys(brands).indexOf(currentBrand) + 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = (pagination) => {
  const { count } = pagination;
  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderBrand(byBrands(products));
};

/**
 * Get the products by brand
 * @param {Object} products
 * @returns Object
 */
const byBrands = (products) => {
  let brands = {};
  if (!products) return {};
  products.forEach((article) => {
    if (!brands[article.brand]) {
      brands[article.brand] = [];
    }

    let props = {};
    Object.keys(article)
      .slice(1)
      .forEach((prop) => (props[prop] = article[prop]));

    brands[article.brand].push(props);
  });
  return brands;
};

/**
 * Declaration of all Listeners
 */

/**
 * Refresh after a new selection
 */
const refresh = () => {
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
};

document.addEventListener("DOMContentLoaded", () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
);

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener("change", (event) => {
  currentPagination.currentPage = 1;
  currentPagination.pageSize = parseInt(event.target.value);
  refresh();
});

/**
 * Select page to display
 */
selectPage.addEventListener("change", (event) => {
  currentPagination.currentPage = parseInt(event.target.value);
  refresh();
});

/**
 * Select brand to display products
 */
selectBrand.addEventListener("change", (event) => {
  currentBrand = event.target.value;
  refresh();
});

/**
 * Filter by new released
 */
checkReleased.addEventListener("change", refresh);

/**
 * Filter by reasonable price
 */
checkPrice.addEventListener("change", refresh);

selectSort.addEventListener("change", refresh);

/**
 * Filter by favorite
 */
checkFavoriteProducts.addEventListener("change", refresh);