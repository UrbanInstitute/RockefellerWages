/*
  debounce redraw function for responsive d3
*/
var _ = require('lodash');
module.exports = function(fn) {
  $(window).on('resize', _.debounce(fn, 100));
};

