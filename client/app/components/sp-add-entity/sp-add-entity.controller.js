import dialogTemplate from './sp-add-entity-dialog.html';

'use strict';

class DialogController {
  constructor(mdPanelRef, name, type, searchEntities, selectedEntities, onSelectedEntities, spSnackbar) {
    'ngInject';
    this.name = name;
    this.type = type;
    this.mdPanelRef = mdPanelRef;
    this.entities = [];
    this.selectedEntities = selectedEntities;
    this.onSelectedEntities = onSelectedEntities;
    this.newSelectedEntities = [];
    this.searchEntities = searchEntities;
    this.spSnackbar = spSnackbar;
  }
  
  close () {
    this.mdPanelRef && this.mdPanelRef.close();
  }
  
  getSelectedEntities (entities) {
    if (entities) {
      this.newSelectedEntities = entities;
    }
  }
  
  submit () {
    this.onSelectedEntities(this.newSelectedEntities);
    this.close();
  }
  
}

class SPAddEntityController {
  constructor($mdDialog, spPopupFullscreen) {
    'ngInject';
    this.spPopupFullscreen = spPopupFullscreen;
    this.expanded = false;
    this.$mdDialog = $mdDialog;
  }
  
  $onChanges (changesObj) {
    this.expanded = false;
  };
  
  open (e) {
    let self = this;
    this.spPopupFullscreen.open(e, dialogTemplate, DialogController, {
      name: this.spName || '',
      type: this.spType || '',
      searchEntities: this.spSearchEntities,
      selectedEntities: [],//this.spEntities,
      //selectedEntities: this.spEntities,
      onSelectedEntities: (entities) => {
        self.addEntities(entities);
      }
    });
  }
  
  addEntities (entities) {
    let ctrl = this;
    this.expanded = true;
    entities.forEach((entity) => {
      for (let i = 0; i < ctrl.spEntities.length; i++) {
        if(ctrl.spEntities[i].entityId === entity.entityId) {
          return;
        }
      }
      ctrl.spEntities.push(entity);
      ctrl.onEntityAdded({
        entity: entity
      });
    })
  }
  
  toggle () {
    this.expanded = !this.expanded;
  }
  
  removeEntity (e, entity) {
    let ctrl = this;
    this.createRemoveConfirmation(entity.entityName, e, false, function () {
      for (let i = 0; i < ctrl.spEntities.length; i++) {
        if (ctrl.spEntities[i].entityId === entity.entityId) {
        ctrl.spEntities.splice(i, 1);
        ctrl.onEntityRemoved({
            entity: entity
        });
        break;
        }
      }
    });
  }
  
  createRemoveConfirmation (name, event, snackbar, callback, cancelCallback, undoCallback) {
    var confirm = this.$mdDialog.confirm()
    .targetEvent(event)
    .ok('REMOVE')
    .cancel('CANCEL');
    
    confirm
    .title("Remove " + name.slice(0,44) + "...")
    .textContent("Do you want to remove the entity " + name.slice(0,33) + "..." + " from the goal?");
    
    this.$mdDialog.show(confirm).then(function () {
      callback && callback();
      snackbar && this.spSnackbar.undo("Entity successfully removed.", () => {
        undoCallback && undoCallback();
      });
    }, function () {
      cancelCallback && cancelCallback();
    });
    
  };
}

export default SPAddEntityController;
