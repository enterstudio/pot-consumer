var express = require('express');
var router = express.Router();
var http = require('request-promise-json');
var Promise = require('promise');
var UrlPattern = require('url-pattern');
var oauth = require('../../server/js/oauth.js');
var config = require('config');

var api_url = new UrlPattern('(:host)(:api)(:operation)');
var _apis = config.get('APIs');

/* Handle the request for calculating shipping cost */
router.get('/shipping/:zip', function (req, res) {

  setShipCalcOptions(req, res)
    .then(submitCalcShipReq)
    .catch(renderErrorPage)
    .done();

});

/* Handle the request for finding nearest store */
router.get('/stores/:zip', function (req, res) {

  setStoreLocOptions(req, res)
    .then(submitStoreLocReq)
    .catch(renderErrorPage)
    .done();

});

function setShipCalcOptions(req, res) {
  var zip_code = req.params.zip;

  var shipping_url = api_url.stringify({
    host: req.cookies.config.apic_uri,
    api: _apis.logistics.base_path,
    operation: "/shipping?zip=" + zip_code
  });

  // var options = {
  //   method: 'GET',
  //   url: shipping_url,
  //   strictSSL: false,
  //   headers: {
  //     "Host": _apiServer.host
  //   }
  // };

  var options = {
    method: 'GET',
    url: shipping_url,
    strictSSL: false,
    headers: {}
  };

  if (_apis.logistics.require.indexOf("client_id") != -1) options.headers["X-IBM-Client-Id"] = req.cookies.config.client_id;
  if (_apis.logistics.require.indexOf("client_secret") != -1) options.headers["X-IBM-Client-Secret"] = req.cookies.config.client_secret;

  return new Promise(function (fulfill) {
    
    // Get OAuth Access Token, if needed
    if (_apis.logistics.require.indexOf("oauth") != -1) {

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

function submitCalcShipReq(function_input) {
  var options = function_input.options;
  var res = function_input.res;

  http.request(options)
    .then(function (data) {
      res.json(data);
    })
    .fail(function (err) {
      console.log("ERROR: " + err.description);
    });
}

function setStoreLocOptions(req, res) {
  var zip_code = req.params.zip;

  var stores_url = api_url.stringify({
    host: req.cookies.config.apic_uri,
    api: _apis.logistics.base_path,
    operation: "/stores?zip=" + zip_code
  });

  // var options = {
  //   method: 'GET',
  //   url: stores_url,
  //   strictSSL: false,
  //   headers: {
  //     "Host": _apiServer.host
  //   }
  // };

  var options = {
    method: 'GET',
    url: stores_url,
    strictSSL: false,
    headers: {}
  };

  if (_apis.logistics.require.indexOf("client_id") != -1) options.headers["X-IBM-Client-Id"] = req.cookies.config.client_id;
  if (_apis.logistics.require.indexOf("client_secret") != -1) options.headers["X-IBM-Client-Secret"] = req.cookies.config.client_secret;

  return new Promise(function (fulfill) {

    // Get OAuth Access Token, if needed
    if (_apis.logistics.require.indexOf("oauth") != -1) {

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

function submitStoreLocReq(function_input) {
  var options = function_input.options;
  var res = function_input.res;

  http.request(options)
    .then(function (data) {
      res.json(data);
    })
    .fail(function (err) {
      console.log("ERROR: " + err.description);
    });
}

function renderErrorPage(function_input) {
  var err = function_input.err;
  var res = function_input.res;
  res.render('error', {reason: err});
}

module.exports = router;
