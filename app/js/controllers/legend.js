'use strict';

angular.module('wages')
  .directive('legend', function() {

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