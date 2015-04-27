'use strict';

var defaults = require('../defaults.json');
var industries = require('../json/industry_codes.json');

angular.module('wages', [
    'ngSanitize',
    'ui.select',
    'ui.slider'
  ])
  .controller('main', ['$scope', function($scope) {

    // start model with default config
    $scope = angular.extend($scope, defaults);

    // general categories of industry for general dropdown
    $scope.category = {};
    $scope.categories = industries.general;

    // more specific industries as a result of selecting general category
    $scope.industry = {};
    $scope.industries = industries.detail;


    $scope.$watch('category.selected', function(value) {

      if ( !(value && value.prefixes ) ) return;

      var code_starts_with = new RegExp('^(' + value.prefixes.join('|') + ')');

      var match = function(d) {
        return code_starts_with.test(d.code);
      };

      $scope.industries = industries.detail.filter(match);

    })


  }]);