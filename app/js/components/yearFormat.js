'use strict';

angular.module('wages')
  .filter('yearFormat', function() {
    return function yearFormat(d) {
      d = Number(d) - 1;
      var m = d%4;
      return (Math.floor(d/4) + 1990) + " Q" + (m + 1);
    };
  });