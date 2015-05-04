'use strict';

var responsive = require('../util/responsive');
var us = require('../../json/us.json');
var decode = require('../util/decode');
var fmt = require('../util/format');
var genFilename = require('../util/genFilename');
var county_names = require('../../json/county-names.json');

var topology = topojson.feature(us, us.objects.counties).features;


angular.module('wages')
  .directive('countyMap', ['$filter', function($filter) {

    var yearFormat = $filter('yearFormat');

    function link($scope, $element, attrs) {

      var svg;
      var data;
      var counties;
      var node = $element.get(0);
      var tooltip = $scope.tooltip;

      // initial render
      draw();
      // debounced responsive redraw
      responsive(draw);
      // fill map on change of industry
      $scope.$watch('industry', get);
      // watch year changes
      $scope.$watch('year', fill);

      $scope.$watch('legendHover.color', function(color) {
        color ? highlight(color) : fill();
      });

      var zeros = d3.format("05d");


      function draw() {

        var bb = node.getBoundingClientRect();

        var ratio = 588 / 1011;

        var margin = { top: 0, right: 0, bottom: 0, left: 0 },
            width = bb.width - margin.left - margin.right,
            height = (bb.width*ratio) - margin.top - margin.bottom;

        // slightly off center to allow for
        // better display of the aleutian islands
        var center = [width/2*1.05, height/2];

        var zoom_extent = [1, 10];

        var projection = d3.geo.albersUsa()
            .scale(width*1.2)
            .translate(center);

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

        counties
          .on('mouseover', function(d) {
            var year = $scope.year;
            var id = zeros(d.id);
            var county = county_names[id];

            $scope.$apply(function() { $scope.countyHover.id = id; });

            d3.select(this).moveToFront();
            tooltip
              .text({
                "title" : county.name + ", " + county.state,
                "value" : yearFormat(year) + ": " + fmt(data[d.id][year])
              })
              .position(this);
          })
          .on('mouseout', function() {
            tooltip.hide();
            $scope.$apply(function() { $scope.countyHover.id = null; });
          });

        if (data) {
          fill();
        }

        // map control icons (fontawesome)
        container.selectAll('i')
          .data(['search-plus', 'search-minus', 'home'])
          .enter()
          .append('i')
          .attr('class', function(d) {
            return 'map-control fa fa-' + d;
          })
          .style('top', function(d, i) {
            return (10 + 30*i) + 'px';
          });

        // recenter map on click of reset button
        container.select(".fa-home")
          .on('click', function(){
            svg.transition()
                  .duration(750)
                  .call(zoom.translate([0,0]).scale(1).event);
          });

        // zoom in + out
        container.selectAll(".fa-search-plus, .fa-search-minus")
          .on('click', function(){
            var zoomin = d3.select(this).classed('fa-search-plus');
            zoomByFactor((zoomin ? 2 : (1/2)), 500);
          });


        // initialize zoom based on dimensions
        var zoom = d3.behavior.zoom()
          .center(center)
          .scaleExtent(zoom_extent)
          .on("zoom", zoomed);

        svg
          .call(zoom)
          .call(zoom.event);

        // after hours of failing at figuring this out,
        // taken from http://stackoverflow.com/a/21653008/1718488
        function zoomByFactor(factor, dur) {
          var scale = zoom.scale();
          var ext = zoom_extent;
          var newScale = Math.max(ext[0], Math.min(ext[1], scale*factor));
          var t = zoom.translate();
          var c = center;
          zoom
            .scale(newScale)
            .translate([
              c[0] + (t[0] - c[0]) / scale * newScale,
              c[1] + (t[1] - c[1]) / scale * newScale
            ])
            .event(svg.transition().duration(dur || 200));
        }

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
        countyHover : '=',
        mapData : '=',
        tooltip : '='
      }
    };

  }]);