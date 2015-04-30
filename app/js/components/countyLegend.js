'use strict';

var _ = require('lodash');

angular.module('wages')
  .directive('countyLegend', function() {

    function link($scope, $element, attrs) {

      var node = $element.get(0);

      draw();

      // debounced responsive redraw
      $(window).on('resize', _.debounce(draw, 300));

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

        var rects = svg.append('g').selectAll('rect')
            .data(colors)
            .enter().append('rect')
            .attr('width', bin_width)
            .attr('height', 20)
            .attr('y', 20)
            .attr('x', function(d, i) {
              return i*bin_width;
            })
            .style('fill', function(d) {return d;});

        var text = svg.append('g').selectAll('text')
            .data(bins)
            .enter().append('text')
            .attr('class', 'legend-text')
            .text(function(d){return d + "$";});

        text
          .attr('y', function(d, i) {
            var h = this.getBBox().height;
            return h;
          })
          .attr('x', function(d, i) {
              var w = this.getBBox().width;
              return (i+1)*bin_width - w/2;
            });

        rects
          .on('mouseover', function() {
            $scope.legendHover.color = d3.rgb(
              d3.select(this).style('fill')
            ).toString();
            $scope.$apply();
          })
          .on('mouseout', function() {
            $scope.legendHover.color = null;
            $scope.$apply();
          });

      }


    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        colorf : '=',
        legendHover : '='
      }
    };

  });