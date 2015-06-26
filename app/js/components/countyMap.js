'use strict';

var responsive = require('../util/responsive');
var us = require('../../json/us.json');
var decode = require('../util/decode');
var fmt = require('../util/format');
var genFilename = require('../util/genFilename');
var county_names = require('../../json/county-names.json');

var topology = topojson.feature(us, us.objects.counties).features;

angular.module('wages')
  .directive('countyMap', ['$filter', '$rootScope', function($filter, $rootScope) {

    var yearFormat = $filter('yearFormat');

    function link($scope, $element, attrs) {

      var svg;
      var data;
      var counties;
      var clickedNode;
      var margin, width, height, zoom;
      var node = $element.get(0);
      var path = d3.geo.path();

      // initial render
      draw();
      // debounced responsive redraw
      responsive(draw);
      $scope.$watch('variable', get);
      // fill map on change of industry
      $scope.$watch('industry', get);
      // watch year changes
      $scope.$watch('year', fill);

      $scope.$watch('legendHover.color', function(color) {
        color ? highlight(color) : fill();
      });

      var zeros = d3.format("05d");


      function targetCounty(node, duration) {

        // zoom to bounding box : http://bl.ocks.org/mbostock/9656675
        var bounds = path.bounds(node.__data__),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            extent = zoom.scaleExtent(),
            scale = 0.9 / Math.max(dx / width, dy / height);

        // cap scale at zoom bounds
        scale = Math.min(extent[1], Math.max(extent[0], scale));
        var translate = [width / 2 - scale * x, height / 2 - scale * y];

        // zoom to boundary
        svg.transition()
            .duration(duration || 750)
            .call(zoom.translate(translate).scale(scale).event);

      }



      function draw() {

        var bb = node.getBoundingClientRect();

        var ratio = 588 / 1011;

        margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = bb.width - margin.left - margin.right,
        height = (bb.width*ratio) - margin.top - margin.bottom;

        // slightly off center to allow for
        // better display of the aleutian islands
        var center = [width/2*1.05, height/2];

        var zoom_extent = [1, 10];

        var projection = d3.geo.albersUsa()
            .scale(width*1.2)
            .translate(center);

        path.projection(projection);

        var container = d3.select(node)
          .classed('county-map', true);

        container.select('svg').remove();

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
            .attr('id', function(d) { return 'county-' + d.id; })
            .attr('class', 'county-map-paths');

        if ($rootScope.clickedNode) {
          var id = '#county-' + $rootScope.tooltipData.id;
          var county = d3.select(id);
          highlightNode.call(county.node(), county.data()[0]);
        }



        function highlightNode(d, click) {
          var year = $scope.year;
          var id = zeros(d.id);
          var county = county_names[id];
          var variable = $scope.variable;

          d3.select(this).moveToFront();

          var node = this;
          $scope.$apply(function() {
            if (click) {
              $rootScope.clickedNode = node;
            }
            $scope.countyHover.id = id;
            $rootScope.tooltipData.node = node;
            $rootScope.tooltipData.id = id;
            $rootScope.tooltipData.title = county.name + ", " + county.state;
            $rootScope.tooltipData.getVal = function(id) {
              return data[id];
            };
          })
        }

        function unHighlightNode() {
          $scope.$apply(function() {
            $rootScope.tooltipData.node = null;
            $scope.countyHover.id = null;
          });
        }


        counties
          .on('click', function(d) {
            if ($rootScope.clickedNode) return;
            var that = this;
            highlightNode.call(this, d, true);
            counties.classed('selected-county', function() {
              return this === that;
            })
            d3.select(this).moveToFront();
            targetCounty(this);
          })
          .on('mouseover', function(d) {
            !$rootScope.clickedNode && highlightNode.call(this, d);
          })
          .on('mouseout', function() {
            !$rootScope.clickedNode && unHighlightNode();
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

        var resetMap = function(){
          svg.transition()
                .duration(750)
                .call(zoom.translate([0,0]).scale(1).event);
        };

        // recenter map on click of reset button
        container.select(".fa-home")
          .on('click', resetMap);

        // zoom in + out
        container.selectAll(".fa-search-plus, .fa-search-minus")
          .on('click', function(){
            var zoomin = d3.select(this).classed('fa-search-plus');
            zoomByFactor((zoomin ? 2 : (1/2)), 500);
          });

        $rootScope.$on('close-tooltip', function() {
          resetMap();
          counties.classed('selected-county', false);
        })


        // initialize zoom based on dimensions
        zoom = d3.behavior.zoom()
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
        $rootScope.$broadcast('zooming');
        counties
          .attr("transform","translate("+ t +")scale("+ s +")")
          .style("stroke-width", 0.5*(1 / s) + "px");
      }

      function fill() {
        var colorf = $scope.colorf;
        var year = $scope.year;
        counties.attr('fill', function(d) {
          var df = data && data[d.id];
          return df && df[year] !== 0 ? colorf(df[year]) : "#ddd";
        });
      }

      function highlight(color) {
        counties.attr('fill', function() {
          var fill = this.attributes.fill;
          return (fill && (fill.value === color) ? color : "#ddd");
        });
      }


      function get() {
        var industry = $scope.industry;
        if ( !(industry && (industry.code !== undefined) ) ) return;
        var code = industry.code;
        var variable = $scope.variable;
        d3.csv(genFilename(code, variable), function(e, raw) {
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
        variable : '=',
        industry : '=',
        year: '=',
        colorf : '=',
        legendHover : '=',
        countyHover : '=',
        mapData : '=',
        mapHover : '='
      }
    };

  }]);