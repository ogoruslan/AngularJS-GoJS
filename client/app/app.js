'use strict';

import 'babel-polyfill';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import 'angular-messages';
import 'angular-animate';
import 'angular-aria';
import 'angular-material';
import 'angular-local-storage';

import * as moment from 'moment';
window.moment = moment.default;
import 'moment';

import 'normalize.css';
import 'angular-material/angular-material.css';
import 'gojs';

import Pages from './pages/pages';
import Components from './components/app-components';
import AppComponent from './app.component';

angular.module('app', [
    uiRouter,
    'LocalStorageModule',
    'ngMaterial',
    'ngMessages',
    Pages,
    Components
])
.provider('CONFIG', function () {
    // Will be loaded from json
    let configurationData;
    
    this.initialize = (data) => {
        configurationData = typeof data === 'string' ? JSON.parse(data) : data;
    };
    
    this.$get = () => {
        return configurationData;
    };
})
.config(($urlRouterProvider, $locationProvider, $mdThemingProvider, $mdIconProvider, localStorageServiceProvider, $stateProvider) => {
    "ngInject";
    
    $locationProvider.html5Mode(true);
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .warnPalette("red");
    go.licenseKey = "";

    $mdIconProvider
        .icon("captureMgrLogo", "assets/icons/captureMgrLogo.svg", 24);
    $stateProvider
        .state('cm-strategical-planning', {
            url: '/',
            component: 'cmStrategicalPlanning',
            resolve: {
                authData: function (cmAuthentication) {
                    'ngInject';
                    return cmAuthentication.authenticate('/goals');
                },
                cmApiHost: function (authData) {
                    'ngInject';
                    return authData.apiHost;
                },
                cmCurrentUser: function (authData) {
                    'ngInject';
                    return authData.user;
                }
            }
        });

    localStorageServiceProvider.setPrefix('spGoals');
    $urlRouterProvider.otherwise('/');
})

.component('app', AppComponent);

angular.element(document).ready(() => {
    
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/config/config.json', true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        let status = xhr.status;
        if (status === 200) {
            angular.module('app').config((CONFIGProvider) => {
                "ngInject";
                CONFIGProvider.initialize(xhr.response);
            });
            angular.bootstrap(document, ['app']);
        } else {
            console.log('Config is not loaded!')
        }
    };
    xhr.send();
});