'use strict';

var responsive = require('../util/responsive');
var fmt = require('../util/format');
var _ = require('lodash');

angular.module('wages')
  .directive('lineChart', ['$filter', function($filter) {

    var yearFormat = $filter('yearFormat');

    function link($scope, $element, attrs) {

      var node = $element.get(0);

      /*
        debounced responsive redraw
      */
      responsive(draw);

      $scope.$watch('mapData.data', draw);

      function draw() {

        var data = $scope.mapData.data;

        if (!data) return;

        var values = d3.entries(data[0])
          .filter(function(d) { return !isNaN(Number(d.key)); })
          .map(function(d) {
            return {
              year : Number(d.key),
              value : Number(d.value)
            };
          });

        var container = d3.select(node).html('')
          .classed('line-chart', true);

        var bb = node.getBoundingClientRect();

        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = bb.width - margin.left - margin.right,
            height = bb.height - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .domain(d3.extent(values, function(d) { return d.year; }))
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, d3.max(values, function(d) { return d.value; })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .ticks(5)
            .scale(x)
            .tickFormat(yearFormat)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .tickFormat(fmt)
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.value); });

        var svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("path")
            .datum(values)
            .attr("class", "line")
            .attr("d", line);

      }

    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        mapData : '=',
        year: '=',
        mapHover : '='
      }
    };

  }]);
