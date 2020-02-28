'use strict';

function CMLoginController($scope, cmAuthentication, $location) {
    'ngInject';
    
    $scope.title = 'loginController';
    
    if (cmAuthentication.getTokenInfo() !== null) {
        $location.path('/goals')
    }
    
    if (cmAuthentication.authToken) cmAuthentication.authenticate('/goals').then(() => {
        $location.path('/goals');
    });
    
    $scope.displayBlock = $location.path().replace('/', '');
    
    $scope.signIn = {};
    $scope.errorMessage = '';
    
    $scope.login = function (form) {

        $scope.errorMessage = '';
        $scope.showResendVerificationLink = false;

        if (!form.$invalid) {
            $scope.staticEmail = $scope.signIn.Email;
            angular.element(document.querySelector(".submitBtn")).html('<img style="margin-top:15px" src="assets/img/loader.svg" class="hightsvg" />');
            cmAuthentication.login($scope.signIn.Email, $scope.signIn.Password).catch( (response) => {
                $scope.errorMessage = "Something unexpected occurred. Please try again!";
                angular.element(document.querySelector(".submitBtn")).html('SIGN IN');
            });
        }
    };
}

export default CMLoginController;
