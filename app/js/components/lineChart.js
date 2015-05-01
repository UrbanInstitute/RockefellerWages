'use strict';

var _ = require('lodash');

angular.module('wages')
  .directive('lineChart', function() {

    function link($scope, $element, attrs) {

      var node = $element.get(0);

      $(window).on('resize', _.debounce(draw, 300));

      function draw() {

      }

    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        mapData : '=',
        year: '='
      }
    };

  });
