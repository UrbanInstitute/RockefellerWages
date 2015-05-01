'use strict';

var industries = require('../json/industry_codes.json');
var tooltipFactory = require('./util/tooltip');

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

angular.module('wages', [
    'ngSanitize',
    'ui.select',
    'ui.slider'
  ])
  .controller('main', ['$scope', function($scope) {

    var tooltip = $scope.tooltip = tooltipFactory();

    // hide tooltip initially
    tooltip.position();

    var colors = $scope.colors = [
      "#ffffff",
      "#cfe3f5",
      "#82c4e9",
      "#1696d2",
      "#0076bc",
      "#00578b",
      "#010f22"
    ];

    $scope.colorf = d3.scale.quantize()
      .domain([0,1200])
      .range(colors);

    $scope.legendHover = {color : null};

    // start model with default config
    $scope.year = 90;

    // general categories of industry for general dropdown
    $scope.category = {selected : industries.general[0]};
    $scope.categories = industries.general;

    // more specific industries as a result of selecting general category
    $scope.industry = {selected : industries.detail[0]};
    $scope.industries = industries.detail;

    $scope.mapData = {data : null};

    $scope.$watch('category.selected', function(value) {

      if ( !(value && value.prefixes ) ) return;

      var code_starts_with = new RegExp('^(' + value.prefixes.join('|') + ')');

      var match = function(d) {
        return code_starts_with.test(d.code);
      };

      var filtered = industries.detail.filter(match);

      // set industry dropdown to filtered industries,
      // select first of the filtered industries initially
      $scope.industries = filtered;
      $scope.industry = {selected : filtered[0]};

    });


  }]);

/*
  Extend angular module with components
*/
require('./components/yearFormat');
require('./components/propsFilter');
require('./components/countyMap');
require('./components/countyLegend');
require('./components/histogram');
require('./components/lineChart');
