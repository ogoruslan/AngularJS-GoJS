'use strict';

function spUsersModel($http, $q, spConfig) {
    'ngInject';
    
    let currentUser = null;
    
    return {
        setCurrentUser: function (user) {
            currentUser = user;
        },
        getCurrentUser: function () {
            return currentUser;
        },
        searchUsers: function (queryString) {
            let params = {};
            
            if (currentUser) {
                params.exclude_user = currentUser.id;
            }
            
            if (queryString) {
                params.search = '(name="' + queryString + '")';
            }
        
            return $http.get(spConfig.API_HOST + '/users/', {params: params})
                .then(function (response) {
                    response.data && response.data.forEach((user) => {
                        user.inviteAccepted = true;
                    });
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        getUser: function (id) {
            return $http.get(spConfig.API_HOST + '/users/', id)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        }
    };
}

export default spUsersModel;
