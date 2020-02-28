'use strict';

import cmLoginComponent from './cm-login.component';

let cmLoginModule = angular.module('cmLogin', [])
    .config(($stateProvider) => {
        "ngInject";
        
        $stateProvider
            .state('login', {
                url: '/login',
                component: 'cmLogin'
            });
    })
    .component('cmLogin', cmLoginComponent)
    .name;

export default cmLoginModule;
