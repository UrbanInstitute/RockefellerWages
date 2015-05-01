'use strict';

var _ = require('lodash');
var fmt = require('../util/format.js');

angular.module('wages')
  .directive('histogram', function() {

    function link($scope, $element, attrs) {

      var rects;
      var node = $element.get(0);
      var x = d3.scale.linear();

      // debounced responsive redraw
      $(window).on('resize', _.debounce(function() { 
        draw($scope.mapData.data);
      }, 300));

      $scope.$watch('year', function() { draw($scope.mapData.data); });
      $scope.$watch('mapData.data', draw);

      $scope.$watch('legendHover.color', function(color) {
        var colorf = $scope.colorf;
        if (color) {
          rects.attr('fill', function() {
            var fill = this.attributes.fill;
            return (fill && (fill.value === color) ? color : "#777");
          });
        } else {
          rects.attr("fill", function(d) { return colorf(d.x + 1); });
        }
      });

      function draw(map_data) {

        var colorf = $scope.colorf;

        // invert the color scale range to produce bins
        var bins = colorf.range()
            .map(function(c){ return colorf.invertExtent(c)[1]; });

        // generate histogram data from current year values
        var data = d3.layout.histogram()
            .bins([0].concat(bins))(_.pluck(map_data, $scope.year));

        var bb = node.getBoundingClientRect();

        var container = d3.select(node).html('')
          .classed('histogram', true);

        var margin = {top: 30, right: 20, bottom: 30, left: 20},
            width = bb.width - margin.left - margin.right,
            height = bb.height - margin.top - margin.bottom;

        var svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var color_domain = colorf.domain();

        x.domain(color_domain).range([0, width]);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .tickValues([0].concat(bins).concat(color_domain[1]))
            .scale(x)
            .tickFormat(fmt)
            .orient("bottom");

        var bar = svg.selectAll(".bar")
            .data(data)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        rects = bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function(d) { return height - y(d.y); })
            .attr("fill", function(d) { return colorf(d.x + 1); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", -15)
            .attr("x", x(data[0].dx) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return d.y; });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);        

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
        mapData : '=',
        year: '=',
        colorf : '=',
        legendHover : '='
      }
    };

  });