'use strict';

import spDateComponent from './sp-date.component';

let spDateModule = angular.module('spDate', [])

.config(function($mdDateLocaleProvider) {
    "ngInject";
    $mdDateLocaleProvider.formatDate = function(date) {
        return date ? moment(date).format('LL') : '';
    };
})

.component('spDate', spDateComponent)

.name;

export default spDateModule;
