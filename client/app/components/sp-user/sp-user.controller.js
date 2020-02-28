'use strict';

class SPUserController {
  constructor($scope, spUtils) {
    'ngInject';
    
    this.user = null;
    this.userMode = false;
    this.inviteAccepted = false;
    this.inited = false;
    this.scope = $scope;
    this.spUtils = spUtils;
    let ctrl = this;
    //this.scope = $scope;
    
    $scope.dragstart = (e) => {
      //e.dataTransfer.setData('type', 'sp-user');
      if (ctrl.onDragstart) {
          ctrl.onDragstart({
              event: e
          })
      }
    };
    
    $scope.dragend = (e) => {
        if (ctrl.onDragend) {
            ctrl.onDragend({
                event: e
            })
        }
    };
    
    $scope.$safeApply = function (fn) {
        let phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
  }
  
  $onChanges (changes) {
    if ('spPosition' in changes && changes.spPosition.currentValue) {
        if (changes.spPosition.currentValue.users && changes.spPosition.currentValue.users[0]) {
        this.user = changes.spPosition.currentValue.users[0];

        this.spUtils.setAvatar(this.user);
        this.inviteAccepted = this.user.inviteAccepted;
        this.inited = false;
        setTimeout(() => {
            this.inited = true;
            this.scope.$safeApply();
        }, 300);
      } else {
        this.user = null;
      }
      this.userMode = false;
    }
  
    if ('spUser' in changes && changes.spUser.currentValue) {
      this.user = changes.spUser.currentValue;
      if (this.user) {
        this.spUtils.setAvatar(this.user);
        this.userMode = true;
        this.inviteAccepted = this.user.inviteAccepted;
        this.inited = false;
        setTimeout(() => {
            this.inited = true;
            this.scope.$safeApply();
        }, 300);
      }
    }
  }
  
  toggle () {
    this.spSelect = !this.spSelect;
    this.onSelect({
      selected: this.spSelect
    });
  }
  
  select () {
    this.spSelect = true;
    this.onSelect({
      selected: this.spSelect
    });
  }
  
  remove (e) {
    this.onDelete({
      event: e
    });
  }
  
  restore (e) {
    this.onRestore({
      event: e
    });
  }
  
  selectPosition (position) {
    this.onSelectAssignedPosition({
        position: position
    })
  }

  changedPermission (e){
      this.onPermissionChanged ({
          event: e
      })
  }

}

export default SPUserController;
