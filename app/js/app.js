'use strict';

var countries = require('./testData/countries');
var defaults = require('../defaults.json');

angular.module('wages', [
    'ngSanitize',
    'ui.select',
    'ui.slider'
  ])
  .controller('main', ['$scope', function($scope) {

    // start model with default config
    $scope = angular.extend($scope, defaults);

    $scope.country = {};
    $scope.countries = countries;

  }]);