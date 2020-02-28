'use strict';

function SPRightSidebarController($scope, $mdSidenav) {
    'ngInject';
    
    this.noCacheFlag = true;
    
    this.$onChanges = function (changes) {
        // Redrawing sidebar when spVisible was changed to the same value
        if ('spVisible' in changes) {
            let visible = changes.spVisible;
            if (visible.currentValue && (!visible.currentValue === !visible.previousValue)) {
                this.noCacheFlag = !this.noCacheFlag;
            }
        }
    };
    
    $scope.sidenavToggle = function (state) {
        let sidebar = $mdSidenav('sp-right-sidebar');
        
        if (state) {
            sidebar.open();
        } else {
            sidebar.close();
        }
    }
}

export default SPRightSidebarController;
