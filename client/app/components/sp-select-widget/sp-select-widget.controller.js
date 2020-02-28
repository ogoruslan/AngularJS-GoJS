'use strict';

class spSelectWidgetController {
  constructor() {
    'ngInject'
    this.searchString = '';
    this.selectedItems = [];
    this.nodesById = {};
    this.items = [];
    this.loading = true;
    this.notFound = false;
    this.activePositions = [];
    this.selectedItemsTransfer = [];
    this.placeholder = '';
    this.mode = {
      entity: false,
      position: false
    }
  }
  
  $onChanges (changesObj) {
    if ('spItemType' in changesObj) {
      let type = changesObj.spItemType.currentValue;
      if (type === 'position') {
        this.placeholder = 'Search user';
        this.mode.position = true;
      }
      else if (type === 'entity') {
        this.placeholder = 'Search entity';
        this.mode.entity = true;
      }
    }
    let searchItems = changesObj.spSearchItems && changesObj.spSearchItems.currentValue || this.spSearchItems;
    if (searchItems) {
      this.updatePositionList();
    }
  };
  
  updatePositionList (callback) {
    this.loading = true;
    this.spSearchItems().then((data) => {
      let items = [];
      
	data && data.forEach((node) => {
		if (!this.selectedItems[node.nodeId || node.id || node.entityId]) {
		  this.nodesById[node.nodeId || node.id || node.entityId] = node;
		  items.push(node);
		}
	});
      
      this.items = items;
      this.loading = false;
      callback && callback(items);
    });
  }
  
  positionCreated (position) {
    let selectedItems = this.selectedItems;
    let ctrl = this;
    let selectCreatedPosition = (positionId) => {
      let found = null;
      this.updatePositionList((items) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].nodeId === positionId) {
            found = items[i];
            break;
          }
        }
        found && selectedItems.push(found);
        ctrl.selectedItemsTransfer = selectedItems;
      });
    };
    
    this.searchString = '';
    this.loading = true;
    
    if (!position.nodeId) {
      this.spAddPosition('dep_root', {
        "designation": position.position.designation,
        "notes": ""
      })
      .then((data) => {
        this.spInviteUser(data.nodeId, {
          email: position.position.users[0].email
        })
        .then(() => {
          selectCreatedPosition(data.nodeId);
        });
      });
    } else {
      this.spInviteUser(position.nodeId, {
        email: position.position.users[0].email
      })
      .then(() => {
        selectCreatedPosition(position.nodeId);
      });
    }
  }
  
  getSelectedPositions (positions) {
    let self = this;
    this.selectedItems = [];
    positions.forEach((id) => {
      self.nodesById[id] && this.selectedItems.push(self.nodesById[id]);
    });
    this.onSelectedItems({
      items: this.selectedItems
    });
  }
  
  getPositions (positions) {
    this.activePositions = positions;
    this.checkNotFound();
  }
  
  checkNotFound () {
    let notFound = !this.activePositions.length;
    if (this.searchString !== '' && this.activePositions.length > 0) {
      notFound = true;
      for (let i = 0; i < this.activePositions.length; i++) {
        let position = this.activePositions[i];
        if (this.comparePositionWithSearchString(position)) {
          notFound = false;
          break;
        }
      }
    }
    this.notFound = notFound;
    // if (notFound) {
    //   this.onSelectedItems({
    //     items: []
    //   });
    // } else {
    //   this.onSelectedItems({
    //     items: this.selectedItems
    //   });
    // }
  }
  
  getSelectedEntities (entities) {
    let self = this;
    this.selectedItems = [];
    entities.forEach((id) => {
      self.nodesById[id] && this.selectedItems.push(self.nodesById[id]);
    });
    this.onSelectedItems({
      items: this.selectedItems
    });
  }
  
  getEntities (entitiesLength) {
    this.notFound = !entitiesLength;
  }
  
  comparePositionWithSearchString (node) {
    if (node.position) {
        let str = this.searchString.toLowerCase().replace(/\s+/, ' ');
        let user = node.position.users[0];
        if (user) {
            let name = (user.firstName + ' ' + user.lastName).toLowerCase();
            let name2 = (user.lastName + ' ' + user.firstName).toLowerCase();
            if (name.indexOf(str) > -1) return true;
            if (name2.indexOf(str) > -1) return true;
            if (user.email.toLowerCase().indexOf(str) > -1) return true;
        }
      if (node.position.designation.toLowerCase().indexOf(str) > -1) return true;
    }
    return false;
  }
  
  searchStringChange () {
    this.checkNotFound();
  }
}

export default spSelectWidgetController;
