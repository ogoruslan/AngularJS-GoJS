'use strict';

class PositionsListController {
  constructor() {
    this.positions = [];
    this.actualPositions = [];
    this.actualItems = [];
    this.counter = {};
    this.hidden = {};
    this.selected = {};
    this.counterSelected = {};
    this.selectedGroup = {};
  }
  
  $onChanges (changesObj) {
    if ('spSelectedGroup' in changesObj) {
      let parentSelectedGroup = changesObj.spSelectedGroup.currentValue;
      if (parentSelectedGroup) {
        this.actualItems.forEach((node) => {
          if (node.position) {
            this.selected[node.nodeId] = true;
          }
          this.selectedGroup[node.nodeId] = true;
        });
        this.sendSelected();
      } else {
        this.actualItems.forEach((node) => {
          if (node.position) {
            this.selected[node.nodeId] = false;
          }
          this.selectedGroup[node.nodeId] = false;
        });
        this.sendSelected();
      }
    }
    if ('spPositions' in changesObj || 'spRootId' in changesObj  || 'spSearchString' in changesObj) {
      let nodes = [];
      if (changesObj.spPositions) {
        nodes = changesObj.spPositions.currentValue;
      } else if (this.spPositions) {
        nodes = this.spPositions;
      } else {
        return;
      }
      
      let str = '';
      if (changesObj.spSearchString) {
        str = changesObj.spSearchString.currentValue || '';
      } else if (this.spSearchString) {
        str = this.spSearchString;
      }
      
      let parentId = '';
      if (changesObj.spRootId) {
        parentId = changesObj.spRootId.currentValue;
      } else if (this.spRootId) {
        parentId = this.spRootId;
      }
      
      if (nodes) {
        this.positions = [];
        this.actualPositions = [];
        this.actualItems = [];
        nodes.forEach((item) => {
          if (item.parentNodeId === parentId || (!parentId && !item.parentNodeId)) {
            this.positions.push(item);
            if (this.compareWithSearchString(item, str)) {
              this.actualItems.push(item);
              item.position && this.actualPositions.push(item);
            }
            if ('spSearchString' in changesObj && changesObj.spSearchString.currentValue !== '') {
              this.hidden[item.nodeId] = false;
            } else {
              if (item.department && changesObj.spSearchString.currentValue === '' && changesObj.spSearchString.previousValue !== '') {
                this.hidden[item.nodeId] = !!parentId;
              } else if (item.department && !(item.nodeId in this.hidden)) {
                this.hidden[item.nodeId] = !!parentId;
              }
            }
           
          }
        });
        let positions = this.actualPositions.slice();
        if (this.onPositions) {
          for( let prop in this.counter) {
            if (!this.counter.hasOwnProperty(prop)) continue;
            positions = positions.concat(this.counter[prop]);
          }
          this.onPositions({
            positions: positions
          })
        }
      }
    }
    if ('spSelectedItems' in changesObj) {
      let selectedItems = changesObj.spSelectedItems.currentValue;
      if (selectedItems && selectedItems.length > 0) {
        this.actualPositions.forEach((position) => {
          selectedItems.forEach((selectedPosition) => {
            if (selectedPosition.nodeId === position.nodeId) {
              this.selectUser(true, position)
            }
          });
        });
      }
    }
  }
  
  compareWithSearchString (node, searchString) {
    if (node.department) return true;
    if (this.selected[node.nodeId]) return true;
    if (!searchString) return true;
    if (node.position) {
      let str = searchString.toLowerCase().replace(/\s+/, ' ');
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
  
  getPositions (positions, node) {
    if (node.nodeId) {
      this.counter[node.nodeId] = positions;
      let _positions = this.actualPositions.slice();
      for( let prop in this.counter) {
        if (!this.counter.hasOwnProperty(prop)) continue;
        _positions = _positions.concat(this.counter[prop]);
      }
      this.onPositions({
        positions: _positions
      });
    }
  }
  
  getSelectedPositions (positions, node) {
    this.counterSelected[node.nodeId] = positions;
    this.sendSelected();
  }
  
  sendSelected () {
    let selectedPositions = [];
    for( let prop in this.counterSelected) {
      if (!this.counterSelected.hasOwnProperty(prop)) continue;
      selectedPositions = selectedPositions.concat(this.counterSelected[prop]);
    }
    for( let prop in this.selected) {
      if (!this.selected.hasOwnProperty(prop)) continue;
      if (!this.selected[prop]) continue;
      selectedPositions.push(prop);
    }
  
    this.onSelectedPositions({
      positions: selectedPositions
    });
  }
  
  selectUser (selected, node) {
    this.selected[node.nodeId] = selected;
    this.sendSelected();
  }

}

export default PositionsListController;
