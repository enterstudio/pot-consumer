var express = require('express');
var router = express.Router();
var http = require('request-promise-json');
var Promise = require('promise');
var UrlPattern = require('url-pattern');
var oauth = require('../../server/js/oauth.js');
var config = require('config');

var page_filter;
var api_url = new UrlPattern('(:host)(:api)(:operation)');
var _apis = config.get('APIs');

/* GET inventory listing and render the page */
router.get('/', function (req, res) {
  
  page_filter = (typeof req.query.filter !== 'undefined') ? JSON.stringify(req.query.filter.order) : false;

  setGetItemsOptions(req, res)
    .then(sendApiReq)
    .then(renderPage)
    .catch(renderErrorPage)
    .done();

});

function setGetItemsOptions(req, res) {
  var query = req.query;
  
  var items_url = api_url.stringify({
    host: req.cookies.config.apic_uri,
    api: _apis.inventory.base_path,
    operation: "/items"
  });

  var options = {
    method: 'GET',
    url: items_url,
    strictSSL: false,
    headers: {}
  };
  
  if (_apis.inventory.require.indexOf("client_id") != -1) options.headers["X-IBM-Client-Id"] = req.cookies.config.client_id;
  if (_apis.inventory.require.indexOf("client_secret") != -1) options.headers["X-IBM-Client-Secret"] = req.cookies.config.client_secret;

  // Apply the query filter, if one is present
  if (typeof query.filter !== 'undefined') options.url += '?filter=' + JSON.stringify(query.filter);
  else options.url += '?filter[order]=name%20ASC';

  return new Promise(function (fulfill) {

    // Get OAuth Access Token, if needed
    if (_apis.inventory.require.indexOf("oauth") != -1) {

      // If already logged in, add token to request
      if (typeof req.cookies.oauth2token !== 'undefined') {
        options.headers.Authorization = 'Bearer ' + req.cookies.oauth2token;
        fulfill({
          options: options,
          res: res
        });
      } else {
        // Otherwise redirect to login page
        res.redirect('/login');
      }

    }
    else fulfill({
      options: options,
      res: res
    });
  });

}

function sendApiReq(function_input) {
  var options = function_input.options;
  var res = function_input.res;

  console.log("MY OPTIONS:\n" + JSON.stringify(options));

  // Make API call for inventory data
  return new Promise(function (fulfill, reject) {
    http.request(options)
      .then(function (result) {
        fulfill({
          data: result,
          res: res
        });
      })
      .fail(function (reason) {
        reject({
          err: reason,
          res: res
        });
      });
  });
}

function renderPage(function_input) {
  var data = function_input.data;
  var res = function_input.res;

  // Render the page with the results of the API call
  res.render('inventory', {
    title: 'ThinkIBM Consumer',
    item_count: data.length,
    item_array: data,
    sort_select: page_filter
  });
}

function renderErrorPage(function_input) {
  var err = function_input.err;
  var res = function_input.res;
  res.render('error', {reason: err});
}

module.exports = router;
