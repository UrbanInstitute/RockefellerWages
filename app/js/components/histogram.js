'use strict';


angular.module('wages')
  .directive('histogram', function() {

    function link($scope, $element, attrs) {

    }
 

    return {
      link : link,
      restrict : 'EA',
      scope : {
        mapData : '=',
        industry : '=',
        year: '='
      }
    };
  });