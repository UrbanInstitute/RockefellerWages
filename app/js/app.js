'use strict';

var countries = require('./testData/countries');

angular.module('wages', [
    'ui.select',
    'ngSanitize'
  ])
  .controller('main', ['$scope', function($scope) {

    $scope.country = {};
    $scope.countries = countries;

  }]);