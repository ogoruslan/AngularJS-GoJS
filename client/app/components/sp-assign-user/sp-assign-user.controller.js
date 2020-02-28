import dialogTemplate from './sp-assign-user-dialog.html';

'use strict';
import spUtils from "../sp-utils/sp-utils.service";

class DialogController {
  constructor(mdPanelRef, name, type, searchPositions, searchUsers, selectedPositions, onSelectedPositions, spAddPosition, spInviteUser) {
    'ngInject';
    this.name = name;
    this.type = type;
    this.mdPanelRef = mdPanelRef;
    this.positions = [];
    this.selectedPositions = selectedPositions;
    this.onSelectedPositions = onSelectedPositions;
    this.newSelectedPositions = [];
    this.searchPositions = searchPositions;
    this.spAddPosition = spAddPosition;
    this.spInviteUser = spInviteUser;
    this.spSearchUsers = searchUsers;

  }
  
  close () {
    this.mdPanelRef && this.mdPanelRef.close();
  }
  
  getSelectedPositions (items) {
    if (items) {
      this.newSelectedPositions = items;
    }
  }
  
  submit () {
    this.onSelectedPositions(this.newSelectedPositions);
    this.close();
  }
  
}

class CPAssignUserController {
  constructor($mdDialog, spPopupFullscreen, spSnackbar, spUtils) {
    'ngInject';
    this.spPopupFullscreen = spPopupFullscreen;
    this.expanded = false;
    this.$mdDialog = $mdDialog;
    this.spSnackbar = spSnackbar;
    this.spUtils = spUtils;
  }
  
  $onChanges (changesObj) {
    this.expanded = false;
    if ('spPositions' in changesObj) {
      let positions = changesObj.spPositions.currentValue;
      if (positions && positions.length) {
        positions.forEach((position,key,array) => {
          if (position.position.users && position.position.users.length > 0) {
                this.spUtils.setAvatar(position.position.users[0]);
            }
        })
      }
    }
  };
  
  open (e) {
    let self = this;
    this.spPopupFullscreen.open(e, dialogTemplate, DialogController, {
      name: this.spName || '',
      type: this.spType || '',
      searchPositions: this.spSearchPositions,
      searchUsers: this.spSearchUsers,
      selectedPositions: [],//this.spPositions,
      onSelectedPositions: (positions) => {
        self.addUsers(positions);
      },
      spAddPosition: this.spAddPosition,
      spInviteUser: this.spInviteUser
    });
  }
  
  addUsers (positions) {
    let ctrl = this;
    this.expanded = true;
    let addPositionList = [];
    positions.forEach((position,key,array) => {

      for (let i = 0; i < ctrl.spPositions.length; i++) {
        if(ctrl.spPositions[i].nodeId === position.nodeId) {
          if(ctrl.spPositions[i].position.permission !== position.position.permission){
            ctrl.spPositions[i].position.permission = position.position.permission;
            this.onPermissionChanged({position:position});
          }
          return;
        }
      }
      this.onPermissionChanged({position:position});
      addPositionList.push(position);
      ctrl.spPositions.push(position);
      if (position.position.users && position.position.users.length > 0) {
        this.spUtils.setAvatar(position.position.users[0]);
      }
      // ctrl.onPositionAdded({
      //   positionId: position.nodeId
      // });

    });
    if (addPositionList.length > 0) {
      ctrl.onPositionsAdded({
          positions: addPositionList
      });
    }
  }
  
  toggle () {
    this.expanded = !this.expanded;
  }

  permissionChanged (e,position){
      this.onPermissionChanged({position:position});
  }
  
  removePosition (e, position) {
    let ctrl = this;
    this.createRemoveConfirmation(position.position.designation, e, true, function () {
      for (let i = 0; i < ctrl.spPositions.length; i++) {
        if (ctrl.spPositions[i].nodeId === position.nodeId) {
          ctrl.onPositionRemoved({
            positionId: position.nodeId
          });
          ctrl.spPositions.splice(i, 1);
          break;
        }
      }
    });
  }

  createRemoveConfirmation (name, event, snackbar, callback, cancelCallback, undoCallback) {
    var confirm = this.$mdDialog.confirm()
      .targetEvent(event)
      .ok('UNASSIGN')
      .cancel('CANCEL');
    let ctrl = this;
  
    confirm
      .title("Unassign " + name)
      .textContent("Do you want to unassign " + name + " from the goal?");
    
    this.$mdDialog.show(confirm).then(function () {
      callback && callback();
      snackbar && ctrl.spSnackbar.info("User successfully unassigned.", () => {
        undoCallback && undoCallback();
      });
    }, function () {
      cancelCallback && cancelCallback();
    });
    
  };
}

export default CPAssignUserController;
