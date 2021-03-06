var express = require('express');
var router = express.Router();

var consumer_index = require('./consumer/index');
var consumer_config = require('./consumer/config');
var consumer_inventory = require('./consumer/inventory');
var consumer_item = require('./consumer/item');
var consumer_login = require('./consumer/login');
var consumer_logout = require('./consumer/logout');
var consumer_logistics = require('./consumer/logistics');
var consumer_financing = require('./consumer/financing');

/* Consumer App Routes */
router.use('/', consumer_index);
router.use('/config', consumer_config);
router.use('/inventory', consumer_inventory);
router.use('/item', consumer_item);
router.use('/login', consumer_login);
router.use('/logout', consumer_logout);
router.use('/logistics', consumer_logistics);
router.use('/financing', consumer_financing);

module.exports = router;