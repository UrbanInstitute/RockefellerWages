'use strict';

var _ = require('lodash');
var fmt = require('../util/format');
var responsive = require('../util/responsive');
var county_names = require('../../json/county-names.json');

angular.module('wages')
  .directive('lineChart', ['$filter', function($filter) {

    var yearFormat = $filter('yearFormat');

    function link($scope, $element, attrs) {


      var svg, yearLine, lineText, x, data, line,
          width, lineContainer, countyLineContainer,
          countyLegendContainer, yAxisG, y, yAxis, colorf, usLine;

      var node = $element.get(0);
      var zeros = d3.format("05d");
      var legend_height = 15;
      var legend_line_width = 25;

      /*
        debounced responsive redraw
      */
      responsive(draw);

      $scope.$watch('mapData.data', draw);
      $scope.$watch('countyHover.id', drawCountyLine);
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
            );
          });

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

      function cap(bounds) {
        var a = bounds[0];
        var b = bounds[1];
        return function(x) {
          var y = x.year;
          return (y >= a) && (y <= b);
        };
      }


      var avgCache; // memoize
      function avgUS(data) {
        if (avgCache) return avgCache;
        var totals = {};
        var tempSeries = {};
        var laggedValue;
        // running daily average of series
        _.each(data, function(series) {
          _.each(series, function(value, key) {
            laggedValue = (tempSeries[key] || 0) * (totals[key] || 1)
            totals[key] = (totals[key] || 0) + 1;
            tempSeries[key] = (laggedValue + value) / totals[key];
          })
        })
        var nationalSeries = {values : [], id: 0};
        _.each(tempSeries, function(value, qtr) {
          nationalSeries.values.push({value: value, year: qtr});
        })
        return avgCache = nationalSeries;
      }

      function draw() {
        // reset cache
        avgCache = null;

        data = $scope.mapData.data;

        var year = $scope.year;
        colorf = $scope.colorf;
        var yearRange = $scope.yearRange;

        if (!data) return;

        // start with US line
        var nationalSeries;
        if (!!data[0]) {
          nationalSeries = getSeries(data, 0);
        } else {
          nationalSeries = avgUS(data);
        }

        var container = d3.select(node)
          .classed('line-chart', true);

        container.select('svg').remove();

        var bb = node.getBoundingClientRect();

        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            height = bb.height - margin.top - margin.bottom;

        width = bb.width - margin.left - margin.right;

        // declared in upper scope
        x = d3.scale.linear()
            .domain(yearRange)
            .range([0, width]);

        y = d3.scale.linear()
            .domain([0, colorf.domain()[1]*1.5])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .ticks(5)
            .scale(x)
            .tickFormat(yearFormat)
            .orient('bottom');

        var variable = $scope.variable;

        yAxis = d3.svg.axis()
            .tickFormat(fmt[variable])
            .ticks(8)
            .scale(y)
            .orient('left');

        line = d3.svg.line()
            .defined(function(d) { return d.value; })
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

        yAxisG = svg.append('g')
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
            );
          });


        var legend = svg.append('g')
            .attr('transform', "translate(10,0)");

        countyLegendContainer = svg.append('g');
        lineContainer = svg.append('g');

        var values;

        legend.append('line')
          .attr('class', 'line legend-line')
          .attr('x1', 0)
          .attr('x2', legend_line_width)
          .attr('y1', -legend_height/4)
          .attr('y2', -legend_height/4);

        legend.append('text')
          .text("U.S.")
          .attr('x', legend_line_width + 5)
          .attr('y', function() {
            var bb = this.getBBox();
            return legend_height/2 - bb.height/2;
          });

        values = nationalSeries.values.filter(cap(yearRange));
        usLine = lineContainer.append('path')
          .attr('class', 'line')
          .attr('d', line(values));

        countyLineContainer = lineContainer.append('g');

      }


      function drawCountyLine(id) {

        if (!countyLineContainer) return;

        countyLineContainer.select('path').remove();
        countyLegendContainer.select('g').remove();

        var usData;

        var yearRange = $scope.yearRange;


        if (!id) {
          y.domain([0, colorf.domain()[1]*1.5]);
          yAxisG
            .transition()
            .duration(300)
            .call(yAxis);

          var nationalSeries;
          if (!!data[0]) {
            nationalSeries = getSeries(data, 0);
          } else {
            nationalSeries = avgUS(data);
          }

          usLine.attr('d', line(nationalSeries.values.filter(cap(yearRange))))

          return;
        }


        var legend = countyLegendContainer.append('g')
            .attr('transform', "translate(10," + legend_height + ")");

        var lineData = getSeries(data, id).values.filter(cap(yearRange));
        var max = d3.max(lineData, function(d) { return d.value; });

        var nationalSeries;
        if (!!data[0]) {
          nationalSeries = getSeries(data, 0);
        } else {
          nationalSeries = avgUS(data);
        }

        y.domain([0, (max > colorf.domain()[1]*1.5) ? max : colorf.domain()[1]*1.5 ])

        yAxisG
          .transition()
          .duration(300)
          .call(yAxis);

        legend.append('line')
          .attr('class', 'line legend-line county-line')
          .attr('x1', 0)
          .attr('x2', legend_line_width)
          .attr('y1', -legend_height/4)
          .attr('y2', -legend_height/4);

        legend.append('text')
          .text(function() {
            var county = county_names[zeros(id)];
            return county.name + ", " + county.state;
          })
          .attr('x', legend_line_width + 5)
          .attr('y', function() {
            var bb = this.getBBox();
            return legend_height/2 - bb.height/2;
          });

        countyLineContainer
          .append('path')
          .attr('class', 'line county-line')
          .attr('d', line(lineData));

        usLine.attr('d', line(nationalSeries.values.filter(cap(yearRange))))

      }


    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        variable : '=',
        mapData : '=',
        year: '=',
        yearRange : '=',
        countyHover : '=',
        colorf : '='
      }
    };

  }]);
