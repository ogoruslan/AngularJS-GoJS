'use strict';

class EntitiesListController {
  constructor() {
    this.entities = [];
    this.selected = {};
  }
  
  $onChanges (changesObj) {
    if ('spEntities' in changesObj || 'spSearchString' in changesObj) {
      let nodes = [];
      if (changesObj.spEntities) {
        nodes = changesObj.spEntities.currentValue;
      } else if (this.spEntities) {
        nodes = this.spEntities;
      } else {
        return;
      }
      
      let str = '';
      if (changesObj.spSearchString) {
        str = changesObj.spSearchString.currentValue || '';
      } else if (this.spSearchString) {
        str = this.spSearchString;
      }
      
      if (nodes) {
        this.entities = [];
        nodes.forEach((item) => {
          if (this.compareWithSearchString(item, str)) {
            this.entities.push(item);
          }
        });
        if (this.onEntities) {
          this.onEntities({
            entitiesLength: this.entities.length
          })
        }
      }
    }
  }
  
  compareWithSearchString (node, searchString) {
    if (this.selected[node.entityId]) return true;
    if (this.selected[node.id]) return true;
    if (searchString === '') return true;
    let str = searchString.toLowerCase();
    if (node.entityName && node.entityName.toLowerCase().indexOf(str) > -1) return true;
    //if (node.entityType.toLowerCase().indexOf(str) > -1) return true;
    if (node.name && node.name.toLowerCase().indexOf(str) > -1) return true;
    if (node.projectName && node.projectName.toLowerCase().indexOf(str) > -1) return true;
    //if (node.type.toLowerCase().indexOf(str) > -1) return true;
    return false;
  }
  
  selectEntity (selected, node) {
    if (node.entityId) this.selected[node.entityId] = selected;
    else this.selected[node.id] = selected;

    let selectedEntities = [];
    for( let prop in this.selected) {
      if (!this.selected.hasOwnProperty(prop)) continue;
      if (!this.selected[prop]) continue;
      selectedEntities.push(prop);
    }
    
    this.onSelectedEntities({
      entities: selectedEntities
    });
  }
}

export default EntitiesListController;
