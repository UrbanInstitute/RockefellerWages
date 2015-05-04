'use strict';

var responsive = require('../util/responsive');
var fmt = require('../util/format');
var _ = require('lodash');

angular.module('wages')
  .directive('lineChart', ['$filter', function($filter) {

    var yearFormat = $filter('yearFormat');

    function link($scope, $element, attrs) {

      var node = $element.get(0);

      var svg, yearLine, lineText, x;

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
            return x(year) - bb.width/2;
          })

      });


      function getSeries(data, id) {
        return d3.entries(data[Number(id)])
          .filter(function(d) { return !isNaN(Number(d.key)); })
          .map(function(d) {
            return {
              year : Number(d.key),
              value : Number(d.value)
            };
          });
      }


      function draw() {

        var data = $scope.mapData.data;
        var year = $scope.year;

        if (!data) return;

        var values = [getSeries(data, 0)];

        var id = $scope.countyHover.id;
        if (id) values.push(getSeries(data, id));

        var container = d3.select(node).html('')
          .classed('line-chart', true);

        var bb = node.getBoundingClientRect();

        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = bb.width - margin.left - margin.right,
            height = bb.height - margin.top - margin.bottom;

        var flat = _.flatten(values);

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

        var yAxis = d3.svg.axis()
            .tickFormat(fmt)
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

        svg.append('g').selectAll('path')
            .data(values)
          .enter().append('path')
            .attr('class', 'line')
            .classed('county-line', function(d, i) { return i; })
            .attr('d', line);

        yearLine = svg.append('line')
          .attr('class', 'hoverline')
          .attr('x1', x(year))
          .attr('x2', x(year))
          .attr('y1', 0)
          .attr('y2', height)

        lineText = svg.append('text')
          .text("Map Display")
          .attr('y', -5)
          .attr('x', function() {
            var bb = this.getBBox();
            return x(year) - bb.width/2;
          });


      }

    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        mapData : '=',
        countyHover : '=',
        year: '='
      }
    };

  }]);
