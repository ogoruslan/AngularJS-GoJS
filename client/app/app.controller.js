'use strict';

class AppController {
    constructor(CONFIG, $http, $mdDialog, localStorageService) {
        'ngInject';
        
        this.$http = $http;
        this.$mdDialog = $mdDialog;
        this.CONFIG = CONFIG;
        this.localStorage = localStorageService;
        
        // this.authToken = this.localStorage.get('auth-token');
        // this.authorized = false;
        // this.instanceId = null;
        // this.currentUser = this.localStorage.get('current-user');
        // this.loginForm = false;
        //
        // if (!this.currentUser) this.authToken = '';
        //
        // this.setHeader(this.authToken);
        // this.getInstance().then((data) => {
        //     if (data) {
        //         this.instanceId = data;
        //         // this.authorized = true;
        //     }
        // });
        // this.authenticate().then((authenticated) => {
        //     if (authenticated) {
        //         this.authorized = true;
        //     }
        // });
    }

    setHeader (token) {
        this.$http.defaults.headers.common['Authorization'] = "Basic " + token;
    }
    
    authenticate () {
        return this.$http.get(`${this.CONFIG.API_E6_HOST}/`)
            .then(() => {
                return true;
            })
            .catch((err) => {
                this.showAuthDialog();
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
        }).then(
        (successResponse) => {
            let instanceId = null;
            for (let i in successResponse.data) {
                if (successResponse.data[i].master) {
                    instanceId = successResponse.data[i].id;
                    break;
                }
            }
            return instanceId;
        }, (errorResponse) => {
            this.$http({
                method: 'POST',
                url: `${this.CONFIG.API_E6_HOST}/instances/`,
                data: {
                    "is_master": true,
                    "name": "BPE instance"
                }
            }).then(
            (successResponse) => {
                return this.getInstance();
            }, (err) => {
                //this.showAuthDialog();
                console.error(err);
            });
        });
    }
    
    showAuthDialog () {
        let confirm = this.$mdDialog.prompt()
        .title('Authorizing data is expired!')
        .textContent('Enter an authorizing data in the field below')
        .placeholder('login@riverainc.com:password')
        .ariaLabel('auth data')
        .ok('Login')
        .cancel('Cancel');
    
        this.$mdDialog.show(confirm).then((authData) => {
            let email = authData.match(/^(.*)\:/)[1];
            this.authToken = window.btoa(authData);
            this.setHeader(this.authToken);
            this.localStorage.set('auth-token', this.authToken);
            // this.getInstance().then((data) => {
            //     if (data) {
            //         this.instanceId = data;
            //         this.getCurrentUser(email).then((user) => {
            //             this.localStorage.set('current-user', user);
            //             this.currentUser = user;
            //             this.authorized = true;
            //         });
            //     }
            // });
            this.authenticate().then((authenticated) => {
                if (authenticated) {
                    this.getCurrentUser(email).then((user) => {
                        this.localStorage.set('current-user', user);
                        this.currentUser = user;
                        this.authorized = true;
                    });
                }
            });
        }, () => {
            //this.showAuthDialog();
        });
    }
}

export default AppController;
