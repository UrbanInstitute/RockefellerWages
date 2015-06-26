'use strict';

var fmt = require('./format.js');

angular.module('wages')
  .directive('tooltip', ['$rootScope', '$filter', '$timeout', function($rootScope, $filter, $timeout) {

    var yearFormat = $filter('yearFormat');

    return {
      restrict: 'EA',
      template: '\
        <div id="tooltip" class="clicked-county">\
          <i class="fa fa-times unclick" ng-click="stopTracking()" ng-show="clickedNode"></i>\
          <div class="title" ng-bind="tooltipData.title"></div>\
          <div class="value" ng-bind="tooltipData.value"></div>\
        </div>',
      scope: {
        tooltipData: '=',
        year: '=',
        variable: '=',
        industry: '=',
        category: '='
      },
      link: function($scope, $element, $attrs) {
        var tt = tooltip().hide();

        $scope.$watch('tooltipData.node', function(n) {
          tt.position(n);
          if (!n) return;
          refresh();
        });

        function refresh() {
          var td = $scope.tooltipData;
          if (!(td && td.getVal)) return;
          var year = $scope.year;
          var variable = $scope.variable;
          var data = td.getVal(td.id);
          console.log($scope.category, $scope.industry, data && data[year])
          $scope.tooltipData.value = yearFormat(year) + ": " + ((data && data[year]) ? fmt[variable](data[year]) : 'N/A');
        }
        var laggedRefresh = function() {
          $timeout(refresh, 100);
        };

        $scope.$watch('year', refresh);
        $scope.$watch('variable', laggedRefresh);
        $scope.$watch('industry', laggedRefresh);
        $scope.$watch('category', laggedRefresh);

        $rootScope.$watch('clickedNode', function(node) {
          $scope.clickedNode = node;
        });

        $rootScope.$on('zooming', function() {
          var node = $scope.tooltipData.node;
          tt.position(node, true);
        });

        $scope.stopTracking = function() {
          $rootScope.clickedNode = null;
          $rootScope.$broadcast('close-tooltip');
        };

       }
    }
  }])


function tooltip() {

  var tt = d3.select('#tooltip');

  var self = {
    position: position,
    hide : function() { return this.position(null); }
  };

  var $win = $(window);

  // center tooltip above svg node
  function position(node, no_transition) {

    var x, y, scrollTop, width,
        tt_bb, node_bb,
        node_width, node_heigth;

    if (node) {

      scrollTop = $win.scrollTop();
      node_bb = node.getBoundingClientRect();
      tt_bb = tt.node().getBoundingClientRect();

      x = (
        node_bb.left
        + node_bb.width/2
        - tt_bb.width/2
      );

      y = (
        node_bb.top
        - tt_bb.height
        + scrollTop
        - 10 // extra 10 pixels to padd for tooltip arrow
      );


    } else {
      // move off screen otherwise
      x = y = -9999;
    }

    // absolutely position tooltip
    var pos = {
      'top' : y + 'px',
      'left' : x + 'px'
    };

    // if hiding / showing transition must
    // come before / after style
    if (no_transition) {
      tt.style(pos);
    } else {
      if (node) {
        tt.style(pos)
          .style('opacity', 0)
          .transition()
          .duration(100)
          .style('opacity', 1);
      } else {
        tt.transition()
          .duration(100)
          .style('opacity', 0)
          .each('end', function(d, i) {
            if (!i) tt.style(pos);
          });
      }
    }


    return this;
  }

  return self;
}
