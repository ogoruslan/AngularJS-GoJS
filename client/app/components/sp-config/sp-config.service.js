'use strict';

function spConfig($http, $q) {
    'ngInject';
    
    return {
        setAPIHost (apiHost) {
            this.API_HOST = apiHost;
        },
        API_HOST: ''
    };
}

export default spConfig;
