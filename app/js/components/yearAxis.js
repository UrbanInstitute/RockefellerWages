'use strict';

var _ = require('lodash');
var fmt = require('../util/format.js');
var responsive = require('../util/responsive');

angular.module('wages')
  .directive('yearAxis', ['$filter', function($filter) {

    var yearFormat = $filter('yearFormat');
    var indicator;

    function link($scope, $element, attrs) {

      var rects;
      var node = $element.get(0);
      var x = d3.scale.linear();

      // debounced responsive redraw
      responsive(draw);
      draw();

      $scope.$watch('year', positionIndicator);

      function draw() {
        
        var year = $scope.year;
        var yearRange = $scope.yearRange;
        
        var container = d3.select(node)
          .html('')
          .classed('year-axis', true);

        var bb = node.getBoundingClientRect();
        var width = bb.width + 80;
        var height = bb.height;
        
        x.range([40, width-40])
          .domain(yearRange);

        var svg = container.append('svg')
          .attr({
            width : width,
            height : height
          });

        var ticks = svg.append('g').selectAll('g')
            .data(yearRange)
          .enter().append('g')
            .attr('class', 'tick')
            .attr('transform', function(d) {
              return "translate(" + x(d) + ",0)";
            });

        ticks.append('line')
          .attr({
            x1 : 0,
            x2 : 0,
            y1 : 0,
            y2 : 15
          });

        ticks.append('text')
          .text(function(d) { return yearFormat(d); })
          .attr('y', function() {
            var bb = this.getBBox();
            return 15 + bb.height;
          })
          .attr('x', function() { 
            var bb = this.getBBox();
            return -bb.width/2;
          });


        indicator = svg.append('g');

      }

      function positionIndicator(qtr) {

        if (!indicator) return;

        indicator.select('g').remove();

        var tick = indicator.append('g')
          .attr('class', 'tick')
          .attr('transform',  "translate(" + x(qtr) + ",0)");

        tick.append('line')
          .attr({
            x1 : 0,
            x2 : 0,
            y1 : 0,
            y2 : 15
          });

        tick.append('text')
          .text(yearFormat(qtr))
          .attr('y', function() {
            var bb = this.getBBox();
            return 15 + bb.height;
          })
          .attr('x', function() { 
            var bb = this.getBBox();
            return -bb.width/2;
          });
      }



    }


    return {
      link : link,
      restrict : 'EA',
      scope : {
        year: '=',
        yearRange : '='
      }
    };

  }]);