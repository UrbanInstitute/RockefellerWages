'use strict';

var industries = require('../json/industry_codes.json');

angular.module('wages', [
    'ngSanitize',
    'ui.select',
    'ui.slider'
  ])
  .controller('main', ['$scope', function($scope) {

    var colors = $scope.colors = [
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

    $scope.$watch('category.selected', function(value) {

      if ( !(value && value.prefixes ) ) return;

      var code_starts_with = new RegExp('^(' + value.prefixes.join('|') + ')');

      var match = function(d) {
        return code_starts_with.test(d.code);
      };

      $scope.industries = industries.detail.filter(match);

    });


  }]);

/*
  Extend angular module with components
*/
require('./components/yearFormat');
require('./components/propsFilter');
require('./components/countyMap');
require('./components/countyLegend');

