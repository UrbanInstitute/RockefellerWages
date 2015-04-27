'use strict';

var us = require('../../json/us.json');
var genFilename = require('../genFilename');
var decode = require('../decode');
var _ = require('lodash');
var topology = topojson.feature(us, us.objects.counties).features;


var colors = [
  "#ff4f00",
  "#ff8400",
  "#fdb913",
  "#ffd990",
  "#ffebc4",
  "#cfe3f5",
  "#82c4e9",
  "#1696d2",
  "#0076bc",
  "#1D4281"
];

var colorf = d3.scale.quantize()
  .domain([0,700])
  .range(colors);

angular.module('wages')
  .directive('countyMap', function() {


    function link($scope, $element, attrs) {


      var svg;
      var data;
      var counties;
      var node = $element.get(0);

      // initial render
      draw();
      // debounced responsive redraw
      $(window).on('resize', _.debounce(draw, 300))
      // fill map on change of industry
      $scope.$watch('industry', get);
      // watch year changes
      $scope.$watch('year', fill);


      function draw() {

        var bb = node.getBoundingClientRect();

        var ratio = 588 / 1011;

        var margin = { top: 0, right: 0, bottom: 0, left: 0 },
            width = bb.width - margin.left - margin.right,
            height = (bb.width*ratio) - margin.top - margin.bottom;

        var projection = d3.geo.albersUsa()
            .scale(width*1.2)
            .translate([width/2, height/2]);

        var path = d3.geo.path().projection(projection);

        var container = d3.select(node);

        svg = container.html('').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        counties = svg.append('g')
          .selectAll('path')
            .data(topology)
          .enter().append('path')
            .attr('d', path)
            .attr('class', 'county-map-paths');


      }


      function fill(year) {
        counties.attr('fill', function(d) {
          return data[d.id] ? colorf(data[d.id][year]) : "#777";
        })
      }

      function get(industry) {
        if ( !(industry && (industry.code !== undefined) ) ) return;
        var code = industry.code;
        var year = $scope.year;
        d3.csv(genFilename(code, 'wages'), function(e, raw) {
          data = decode(raw);
          console.log(data)
          fill(5);
        })
      }


    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        countyData : '=',
        industry : '=',
        year: '='
      }
    }

  });