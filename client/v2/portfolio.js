// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let favorite_products = [];
let currentSize = 12;

//Selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');

//Filters
const selectFilterRecentProducts = document.querySelector('#filter-date-select')
const selectFilterReasonablePrice = document.querySelector('#filter-price-select')
const selectFilterPriceBetween50_100 = ('#filter-price-between-50-and-100-select')
const selectFilterPriceAbove100 = ('#filter-price-above-100-select')
const selectBrand = document.querySelector('#brand-select');

//Sort
const selectSort = document.querySelector('#sort-select');

//Indicators
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbRecentProducts = document.querySelector('#nbNewProducts');
const spanp50 = document.querySelector('#p50');
const spanp90 = document.querySelector('#p90');
const spanp95 = document.querySelector('#p95');
const spanLastReleased = document.querySelector('#lastReleased');

//Favorite products
const check_if_favorite = document.getElementsByClassName("favorite_products");
const selectFilterFavorite = document.querySelector('#filter-favorite-select')

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
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
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
 const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  
  let template = `
  <table>
    <thead>
      <tr>
        <th>Brand</th>
        <th style="text-align: start;">|</th>
        <th>Product - link</th>
        <th style="text-align: start;"></th>
        <th>Price</th>
        <th style="text-align: start;"></th>
        <th>Released</th>
        <th style="text-align: start;"></th>
        <th>Favorite products</th>
      </tr>
  </thead>
  <tbody>`;

  template += products
    .map((product) => {
        if (favorite_products.includes(product.uuid)) 
        {
            return `
                <tr class="product" id=${product.uuid}>
                <th style="text-align: start;">${product.brand}</th>
                <th style="text-align: start;">|</th>
                <th style="text-align: start;"><a href="${product.link}">${product.name}</a></th>
                <th style="text-align: start;">|</th>
                <th style="text-align: start;">${product.price}€</th>
                <th style="text-align: start;">|</th>
                <th style="text-align: start;">${product.released}</th>
                <th style="text-align: start;">|</th>
                <th>
                <button style = "display:inline-block;
                padding:0.3em 1.2em;
                margin:0.5em 0.3em 0.3em 0;
                font-weight:300;
                font-size : 15px;
                color: white;
                background-color:#008CBA;
                text-align:center;
                transition: all 0.2s;"
                onclick= RemoveFavorite('${product.uuid}')>Remove</button>
            </th>
                </tr>
                `;
        }
        else 
        {
            return `
            <tr class="product" id=${product.uuid}>
            <th style="text-align: start;">${product.brand}</th>
            <th style="text-align: start;">|</th>
            <th style="text-align: start;"><a href="${product.link}">${product.name}</a></th>
            <th style="text-align: start;">|</th>
            <th style="text-align: start;">${product.price}€</th>
            <th style="text-align: start;">|</th>
            <th style="text-align: start;">${product.released}</th>
            <th style="text-align: start;">|</th>
            <th>
                <button style = "display:inline-block;
                padding:0.3em 1.2em;
                margin:0.5em 0.3em 0.3em 0;
                font-weight:300;
                font-size: 15px;
                color: white;
                background-color:#008CBA;
                text-align:center;
                transition: all 0.2s;"
                onclick= AddFavorite('${product.uuid}')>Add</button>
            </th>
            </tr>
            `;
        }
    })
    .join("");
  template += "</tbody></table>";

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};


/**
 * Render page indicators
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
  spanNbRecentProducts.innerHTML = CountRecentProducts();
  spanp50.innerHTML = Price_value(50) + " €";
  spanp90.innerHTML = Price_value(90) + " €";
  spanp95.innerHTML = Price_value(95) + " €";
  spanLastReleased.innerHTML = LastReleased();
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};


//Render page brands
const renderBrands = products => {
  let brands = [... new Set(products.flatMap(x => x.brand))];

  selectBrand[0] = new Option("All");
  var i = 1;
  for (var b of brands) 
  {
      selectBrand[i] = new Option(b);
      i += 1;
  }
};



/**
 * Declaration of all Listeners
 */

/*
Feature 1 - Browse pages
As a user
I want to browse available pages
So that I can load more products
*/
selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value), currentPagination.pageSize)
      .then(setCurrentProducts) 
      .then(() => render(currentProducts, currentPagination));
});

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});
