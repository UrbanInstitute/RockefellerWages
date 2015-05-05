'use strict';

var _ = require('lodash');
var fmt = require('../util/format');
var responsive = require('../util/responsive');
var county_names = require('../../json/county-names.json');

angular.module('wages')
  .directive('lineChart', ['$filter', function($filter) {

    var yearFormat = $filter('yearFormat');

    function link($scope, $element, attrs) {

      var node = $element.get(0);

      var svg, yearLine, lineText, x, width;

      var zeros = d3.format("05d");

      /*
        debounced responsive redraw
      */
      responsive(draw);

      $scope.$watch('mapData.data', draw);
      $scope.$watch('countyHover.id', draw);
      $scope.$watch('year', function(year) {
        if (!yearLine) return;

        yearLine
          .attr('x1', x(year))
          .attr('x2', x(year));

        lineText
          .attr('x', function() {
            var bb = this.getBBox();
            var w = bb.width;
            return Math.min(
              Math.max(
                x(year) - w/2, 0
              ), (width - w)
            )
          })

      });


      function getSeries(data, id) {
        return {
          values : d3.entries(data[Number(id)])
            .filter(function(d) { return !isNaN(Number(d.key)); })
            .map(function(d) {
              return {
                year : Number(d.key),
                value : Number(d.value)
              };
            }),
          id : id
        };
      }


      function draw() {

        var data = $scope.mapData.data;
        var year = $scope.year;

        if (!data) return;

        // start with US line
        var values = [getSeries(data, 0)];

        var id = $scope.countyHover.id;
        if (id) values.push(getSeries(data, id));

        var container = d3.select(node).html('')
          .classed('line-chart', true);

        var bb = node.getBoundingClientRect();

        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            height = bb.height - margin.top - margin.bottom;

        width = bb.width - margin.left - margin.right;

        var flat = _.flatten(_.pluck(values, 'values'));

        // declared in upper scope
        x = d3.scale.linear()
            .domain(d3.extent(flat, function(d) { return d.year; }))
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, 2000])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .ticks(5)
            .scale(x)
            .tickFormat(yearFormat)
            .orient('bottom');

        var variable = $scope.variable;

        var yAxis = d3.svg.axis()
            .tickFormat(fmt[variable])
            .scale(y)
            .orient('left');

        var line = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.value); });

        svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        yearLine = svg.append('line')
          .attr('class', 'hoverline')
          .attr('x1', x(year))
          .attr('x2', x(year))
          .attr('y1', -10)
          .attr('y2', height);

        lineText = svg.append('text')
          .text("Map Display")
          .attr('y', -15)
          .attr('x', function() {
            var bb = this.getBBox();
            var w = bb.width;
            return Math.min(
              Math.max(
                x(year) - w/2, 0
              ), (width - w)
            )
          });

        var legend_height = 15;
        var legend_line_width = 25;

        var legend = svg.append('g').selectAll('g')
            .data(values)
          .enter().append('g')
            .attr('transform', function(d, i) { return "translate(10," + i*legend_height + ")"; })

        legend.append('line')
          .attr('class', 'line legend-line')
          .classed('county-line', function(d, i) { return i; })
          .attr('x1', 0)
          .attr('x2', legend_line_width)
          .attr('y1', -legend_height/4)
          .attr('y2', -legend_height/4);

        legend.append('text')
          .text(function(d) {
            if (d.id === 0) return "U.S.";
            var county = county_names[zeros(d.id)];
            return county.name + ", " + county.state;
          })
          .attr('x', legend_line_width + 5)
          .attr('y', function() {
            var bb = this.getBBox();
            return legend_height/2 - bb.height/2;
          })

        svg.append('g').selectAll('path')
            .data(values)
          .enter().append('path')
            .attr('class', 'line')
            .classed('county-line', function(d, i) { return i; })
            .attr('d', function(d) { return line(d.values); });

      }

    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        variable : '=',
        mapData : '=',
        countyHover : '=',
        year: '='
      }
    };

  }]);
