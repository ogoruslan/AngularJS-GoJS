'use strict';

class cmAuthenticationService {
    
    constructor ($http, $q, CONFIG, localStorageService, $location, cmSnackbar) {
        'ngInject';
    
        this.$http = $http;
        this.$q = $q;
        this.CONFIG = CONFIG;
        this.$location = $location;
        this.cmSnackbar = cmSnackbar;
        this.localStorage = localStorageService;
        
        this.authData = null;
        this.authenticated = null;
        this.rout = '/';
        
        this.authToken = this.localStorage.get('auth-token');
        this.user = this.localStorage.get('current-user');
        if (!this.user) this.authToken = '';
    
        
        // this.getInstance().then((data) => {
        //     if (data) {
        //         this.instanceId = data;
        //         this.authorized = true;
        //     }
        // });
    }
    
    getTokenInfo () {
        return this.authenticated;
    }
    
    authenticate (rout) {
        return this.$q((resolve) => {
            if (this.authenticated) {
                resolve(this.authData);
            }
            this.rout = rout;
            this.setHeader(this.authToken);
            this.checkAuthentication().then((authenticated) => {
                if (authenticated) this.getInstance().then((instanceId) => {
                    this.authenticated = true;
                    this.authData = {
                        apiHost: this.CONFIG.API_E6_HOST,
                        user: this.user,
                        instanceId: instanceId
                    };d
                    resolve(this.authData);
                })
            }).catch(() => {
                this.showAuthDialog();
            });
        })
    }
    
    setHeader (token) {
        if (!token || typeof token !== 'string') return;
        this.$http.defaults.headers.common['Authorization'] = "Basic " + token;
    }
    
    checkAuthentication () {
        return this.$http.get(`${this.CONFIG.API_E6_HOST}/`)
        .then(() => {
            return true;
        })
    }
    
    getCurrentUser (email) {
        return this.$http.get(this.CONFIG.API_E6_HOST + '/users/', {params: {search: '(name="' + email + '")'}})
        .then(function (response) {
            return response.data && response.data[0];
        })
        .catch(function (err) {
            // todo: handle error
            return [];
        });
    }
    
    getInstance () {
        return this.$http({
            method: 'GET',
            url: `${this.CONFIG.API_E6_HOST}/instances/`,
            data: {}
        }).then((successResponse) => {
            let instanceId = null;
            for (let i in successResponse.data) {
                if (successResponse.data[i].master) {
                    instanceId = successResponse.data[i].id;
                    break;
                }
            }
            if (!instanceId) {
                this.cmSnackbar.error("Instance is not found");
            }
            return instanceId;
        }).catch((errorResponse) => {
            this.cmSnackbar.error("Instance is not found");
            return null;
        });
    }
    
    showAuthDialog () {
        this.$location.path('/login');
    }
    
    login (email, password) {
        this.authToken = window.btoa(email + ':' + password);
        this.setHeader(this.authToken);
        this.localStorage.set('auth-token', this.authToken);
        // this.getInstance().then((data) => {
        //     if (data) {
        //         this.instanceId = data;
        //         this.getCurrentUser(email).then((user) => {
        //             this.localStorage.set('current-user', user);
        //             this.user = user;
        //             this.authorized = true;
        //         });
        //     }
        // });
        return this.checkAuthentication().then((authenticated) => {
            if (authenticated) {
                this.getCurrentUser(email).then((user) => {
                    this.getInstance().then((instanceId) => {
                        this.localStorage.set('current-user', user);
                        this.user = user;
                        this.authenticated = true;
                        this.authData = {
                            apiHost: this.CONFIG.API_E6_HOST,
                            user: this.user,
                            instanceId: instanceId
                        };
                        this.$location.path(this.rout);
                    })
                });
            }
            return authenticated;
        });
    }
    
    logout () {
        this.authenticated = false;
        this.authData = null;
        this.authenticated = null;
        this.authToken = null;
        this.localStorage.remove('auth-token');
        this.localStorage.remove('current-user');
        this.showAuthDialog();
    }
    
}

export default cmAuthenticationService;
