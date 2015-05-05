'use strict';

var fmt = require('../util/format');
var responsive = require('../util/responsive');

angular.module('wages')
  .directive('countyLegend', function() {

    function link($scope, $element, attrs) {

      var node = $element.get(0);

      draw();

      $scope.$watch('variable', draw);

      // debounced responsive redraw
      responsive(draw);

      function draw() {

        var colorf = $scope.colorf;

        var container = d3.select(node)
              .classed('county-map-legend', true);

        var bb = node.getBoundingClientRect();

        var width = bb.width;

        var svg = container.html('').append('svg');

        var colors = colorf.range();

        var bins = colors
                    .slice(0,-1)
                    .map(function(c){
                      return colorf.invertExtent(c)[1];
                    });

        var bin_width = width / colors.length;

        svg.style('width', width)
          .style('height', 40);

        var bin_height = 10;

        var rects = svg.append('g').selectAll('rect')
            .data(colors)
            .enter().append('rect')
            .attr('width', bin_width)
            .attr('height', bin_height)
            .attr('x', function(d, i) {
              return i*bin_width;
            })
            .style('fill', function(d) {return d;});


        var variable = $scope.variable;

        var text = svg.append('g').selectAll('text')
            .data(bins)
            .enter().append('text')
            .attr('class', 'legend-text')
            .text(fmt[variable]);

        text
          .attr('y', function(d, i) {
            var h = this.getBBox().height;
            return bin_height + h;
          })
          .attr('x', function(d, i) {
              var w = this.getBBox().width;
              return (i+1)*bin_width - w/2;
            });

        rects
          .on('mouseover', function() {
            var fill = d3.select(this).style('fill');
            $scope.$apply(function() {
              $scope.legendHover.color = d3.rgb(fill).toString();
            });
          })
          .on('mouseout', function() {
            $scope.$apply(function() {
              $scope.legendHover.color = null;
            });
          });

      }


    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        colorf : '=',
        legendHover : '=',
        variable : '='
      }
    };

  });