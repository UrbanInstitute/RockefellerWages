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

    var colors = $scope.colors = [
      "#F7FAFD",
      "#cfe3f5",
      "#82c4e9",
      "#1696d2",
      "#0076bc",
      "#00578b",
      "#010f22"
    ];

    // hide tooltip initially
    tooltip.hide();

    // choropleth + legend color scale
    var colorf = $scope.colorf = d3.scale.quantize()
      .range(colors);

    // quarters in slider 1 == 1990, 41 == 2000 Q1 | 95 == 2013, Q3
    $scope.yearRange = [41, 95];

    $scope.variableDescription = "";

    $scope.$watch('variable', function(variable) {
      colorf.domain([0, variable == "wages" ? 1200 : 400]);
      if (variable === "wages") {
        $scope.variableDescription = "Weekly Wages ($2014)";
      } else if (variable === "employment") {
        $scope.variableDescription = "Percent of County Employed in Industry";
      } else {
        throw new Error("Unknown variable type : " + variable);
      }
    });

    // indent options without (Total) in name
    $scope.indentIndustry = function(industry) {
      return /\([T|t]otal\)/.test(industry.name) ? '' : 'indent-industry';
    }

    $scope.variable = "wages";

    $scope.legendHover = {color : null};
    $scope.mapHover = {county : null};

    // start model with default config
    $scope.year = $scope.yearRange[1];

    // general categories of industry for general dropdown
    $scope.category = {selected : industries.general[0]};
    $scope.categories = industries.general;

    // more specific industries as a result of selecting general category
    $scope.industry = {selected : industries.detail[0]};
    $scope.industries = industries.detail;

    $scope.mapData = {data : null};
    $scope.countyHover = {id : null};

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
require('./components/yearAxis');
