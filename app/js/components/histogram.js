'use strict';

var _ = require('lodash');
var fmt = require('../util/format.js');
var responsive = require('../util/responsive');

angular.module('wages')
  .directive('histogram', function() {

    function link($scope, $element, attrs) {

      var rects, text, height, width, map_data, bar, y;
      var node = $element.get(0);
      var x = d3.scale.linear();

      // debounced responsive redraw
      responsive(function() {
        draw($scope.mapData.data);
      });

      $scope.$watch('year', size);
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


      function draw() {

        map_data = $scope.mapData.data;

        var colorf = $scope.colorf;

        // invert the color scale range to produce bins
        var bins = colorf.range()
            .map(function(c){ return colorf.invertExtent(c)[1]; });

        var data = _.chain(map_data)
          .pluck($scope.year)
          .filter(function(d) {
            return d !== 0;
          })
          .value();

        // generate histogram data from current year values
        var data = d3.layout.histogram()
            .bins([0].concat(bins))(data);

        var bb = node.getBoundingClientRect();

        var container = d3.select(node)
          .classed('histogram', true);

        container.select('svg').remove();

        var margin = {top: 30, right: 20, bottom: 30, left: 20};
        
        width = bb.width - margin.left - margin.right;
        height = bb.height - margin.top - margin.bottom;

        var svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var color_domain = colorf.domain();

        x.domain(color_domain).range([0, width]);

        y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        var variable = $scope.variable;

        var xAxis = d3.svg.axis()
            .tickValues([0].concat(bins).concat(color_domain[1]))
            .scale(x)
            .tickFormat(fmt[variable])
            .orient("bottom");

        bar = svg.selectAll(".bar")
            .data(data)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        rects = bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function(d) { return height - y(d.y); })
            .attr("fill", function(d) { return colorf(d.x + 1); });

        text = bar.append("text")
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

      function size() {

        if (!bar) return;

        var colorf = $scope.colorf;

        // invert the color scale range to produce bins
        var bins = colorf.range()
            .map(function(c){ return colorf.invertExtent(c)[1]; });

        // generate histogram data from current year values
        var data = d3.layout.histogram()
            .bins([0].concat(bins))(_.pluck(map_data, $scope.year));

        y.domain([0, d3.max(data, function(d) { return d.y; })]);

        bar.data(data)
          .attr("transform", function(d) { 
            return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
        });

        bar.select("rect")
            .attr("height", function(d) { return height - y(d.y); })
            .attr("fill", function(d) { return colorf(d.x + 1); });

        bar.select("text")
            .text(function(d) { return d.y; });
      }

    }


    return {
      link : link,
      restrict : 'EA',
      scope : {
        variable : '=',
        mapData : '=',
        year: '=',
        colorf : '=',
        legendHover : '='
      }
    };

  });