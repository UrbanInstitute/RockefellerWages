'use strict';

var us = require('../../json/us.json');

var topology = topojson.feature(us, us.objects.counties).features;

angular.module('wages')
  .directive('countyMap', function() {

    function link($scope, $element, attrs) {

      var node = $element.get(0);

      var bb = node.getBoundingClientRect();

      var ratio = 588 / 1011;

      var margin = { top: 0, right: 0, bottom: 0, left: 0 },
          width = bb.width - margin.left - margin.right,
          height = (bb.width*ratio) - margin.top - margin.bottom;

      var container = d3.select(node);

      var svg = container.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var projection = d3.geo.albersUsa()
          .scale(width*1.2)
          .translate([width/2, height/2]);

      var path = d3.geo.path().projection(projection);

      svg.append('g')
        .selectAll('path')
          .data(topology)
        .enter().append('path')
          .attr('d', path)
          .attr('class', 'county-map-paths');

    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        countyData : '='
      }
    }

  });