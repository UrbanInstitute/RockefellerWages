'use strict';

var _ = require('lodash');

angular.module('wages')
  .directive('lineChart', function() {

    function link($scope, $element, attrs) {

    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        countyData : '=',
        industry : '=',
        year: '='
      }
    };
  });
