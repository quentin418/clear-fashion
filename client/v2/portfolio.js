// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
//let currentBrand = "all";
let filterBrand = "noFilter";
let filterRecent = "no";
let filterReasonable = "no";
let sortFilter = "notSorted"; 
let setFavorite = new Set();
let filterFavorite = "no";

// instantiate selectors
const selectShow = document.querySelector("#show-select");
const selectPage = document.querySelector("#page-select");
//const selectBrand = document.querySelector("#brand-select");
const sectionProducts = document.querySelector("#products");


//Indicators
const spanNbProducts = document.querySelector("#nbProducts");
const spanNbNewProducts = document.querySelector("#nbNewProducts");

const spanP50 = document.querySelector("#p50");
const spanP90 = document.querySelector("#p90");
const spanP95 = document.querySelector("#p95");

const spanLastReleased = document.querySelector("#lastReleased");

const selectFilterRecent = document.querySelector('#recent-select');
const selectFilterReasonable = document.querySelector('#reasonable-select');
const selectFilterFavorite = document.querySelector("#favorite-select");


//Sort
const selectSort = document.querySelector("#sort-select");

const date = new Date();
function isNew(product){
	const release = new Date(product.released);
	var diff = Math.abs((date - release)/(7*24*60*60*1000));
	//console.log(diff);
	if (diff < 2) {
		return "True";
	}
	else
	{
		return "False";
	};
}

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
 */
 const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-three-coral.vercel.app/products?page=${page}&size=${size}`
    );
    const body = await response.json();

    var groupbyBrand = body.data.result.reduce(function(groups, item) {
      const val = item["brand"]
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {});
    var selectBox = document.getElementById('brand-select');
    selectBox.options.length=0;
    selectBox.options.add( new Option("-", "noFilter", false));
    for (var i =0, l = Object.keys(groupbyBrand).length; i< l; i++){
      var option = Object.keys(groupbyBrand)[i];
      selectBox.options.add( new Option(option, option, false));
    }
    selectBox.options.add(new Option("No filter", "noFilter", false));
    if (filterBrand!="noFilter"){
      body.data.result = groupbyBrand[filterBrand]
    }
    if (filterReasonable == "yes"){
      body.data.result = body.data.result.filter(a => a.price<50)
    }
    if (filterRecent == "yes"){
      body.data.result = body.data.result.filter(a => isNew(a) == "True");
    }
    if (filterFavorite == "yes"){
      body.data.result = body.data.result.filter(a => setFavorite.has(a._id) == true);
    }
    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    switch(sortFilter){
      case 'price-asc':
        body.data.result = body.data.result.sort((a,b)=> a.price - b.price);
        break;
      case 'price-desc':
        body.data.result = body.data.result.sort((a,b)=> b.price - a.price);
        break;
      case 'date-asc':
        body.data.result = body.data.result.sort(function(a,b){
          if (a.released<b.released) {
            return -1;
          } else {
            return 1;
        };});
        break;
      case 'date-desc':
        body.data.result = body.data.result.sort(function(a,b){
          if (a.released>b.released) {
            return -1;
          } else {
            return 1;
        };});
        break;    
    }
    return body.data;

  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

const selectBrand = document.querySelector('#brand-select');

/**
 * Render list of products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

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
 * Render page selector
 */
const renderIndicators = (pagination, products) => {
  spanNbNewProducts.innerHTML = products.filter(a => isNew(a) == "True").length;
  spanNbProducts.innerHTML = products.length;
  spanP50.innerHTML = percentile(50, products);
  spanP90.innerHTML = percentile(90, products);
  spanP95.innerHTML = percentile(95, products);
  let t = sortDate(products);
  spanLastRelease.innerHTML = t[t.length-1].released;

};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination,products);
};

/**
 * Declaration of all Listeners
 */

 selectShow.addEventListener('change', event => {
  currentPagination.pageSize = parseInt(event.target.value);
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectPage.addEventListener('change', event => {
  currentPagination.currentPage = parseInt(event.target.value);
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
  .then(setCurrentProducts)
  .then(() => render(currentProducts, currentPagination));
});

selectBrand.addEventListener('change', event => {
  filterBrand = event.target.value;
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
  .then(setCurrentProducts)
  .then(() => render(currentProducts, currentPagination));
});

selectFilterReasonable.addEventListener('change', event => {
  filterReasonable = event.target.value;
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
  .then(setCurrentProducts)
  .then(() => render(currentProducts, currentPagination));
});

selectFilterRecent.addEventListener('change', event => {
  filterRecent = event.target.value;
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
  .then(setCurrentProducts)
  .then(() => render(currentProducts, currentPagination));
});

selectSort.addEventListener('change', event => {
  sortFilter = event.target.value;
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
  .then(setCurrentProducts)
  .then(() => render(currentProducts, currentPagination));
});

selectFilterFavorite.addEventListener('change', event => {
  filterFavorite = event.target.value;
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
  .then(setCurrentProducts)
  .then(() => render(currentProducts, currentPagination));
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});