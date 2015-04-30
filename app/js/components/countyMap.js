'use strict';

var us = require('../../json/us.json');
var genFilename = require('../util/genFilename');
var decode = require('../util/decode');
var _ = require('lodash');
var topology = topojson.feature(us, us.objects.counties).features;


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
      $(window).on('resize', _.debounce(draw, 300));
      // fill map on change of industry
      $scope.$watch('industry', get);
      // watch year changes
      $scope.$watch('year', fill);

      $scope.$watch('legendHover.color', function(color) {
        color ? highlight(color) : fill();
      });


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

        var container = d3.select(node).classed('county-map', true);

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

        if (data) {
          fill();
        }

        // initialize zoom based on dimensions
        var zoom = d3.behavior.zoom()
          .center([width/2, height/2])
          .scaleExtent([1,10])
          .on("zoom", zoomed);

        svg
          .call(zoom)
          .call(zoom.event);

      }


      function zoomed() {
        var s = d3.event.scale,
            t = d3.event.translate;
        counties
          .attr("transform","translate("+ t +")scale("+ s +")")
          .style("stroke-width", 0.5*(1 / s) + "px");
      }

      function fill() {
        var colorf = $scope.colorf;
        var year = $scope.year;
        counties.attr('fill', function(d) {
          return data && data[d.id] ? colorf(data[d.id][year]) : "#777";
        });
      }

      function highlight(color) {
        counties.attr('fill', function() {
          var fill = this.attributes.fill;
          return (fill && (fill.value === color) ? color : "#777");
        });
      }


      function get(industry) {
        if ( !(industry && (industry.code !== undefined) ) ) return;
        var code = industry.code;
        d3.csv(genFilename(code, 'wages'), function(e, raw) {
          $scope.mapData.data = data = decode(raw);
          $scope.$apply();
          fill();
        });
      }


    }

    return {
      link : link,
      restrict : 'EA',
      scope : {
        industry : '=',
        year: '=',
        colorf : '=',
        legendHover : '=',
        mapData : '='
      }
    };
  });