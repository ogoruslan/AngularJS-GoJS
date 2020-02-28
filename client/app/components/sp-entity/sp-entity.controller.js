'use strict';

class SPEntityController {
  constructor($location) {
    'ngInject';
    
    this.name = '';
    this.type = '';
    this.link = null;
    this.$location = $location;
    
  }
  
  $onChanges (changes) {
    if ('spEntity' in changes && changes.spEntity.currentValue) {
      let entity = changes.spEntity.currentValue;
      this.parseEntity(entity);
    }
  }
  
  parseEntity (entity) {
    if (entity.type === 'projectDto') {
      this.project = true;
      this.type = 'Project';
      this.name = entity.projectName;
      this.id = entity.id;
    } else if (entity._cls === 'BusinessProcess') {
      this.bpm = true;
      this.type = 'BPM';
      this.name = entity.name;
      this.id = entity.id;
      // todo: WTF
    //} else if (entity.type === 'goalDto') {
    } else if (entity.nodeid) {
      this.goal = true;
      this.type = 'Strategic Goal';
      this.name = entity.text;
      this.id = entity.nodeid;
      this.link = '/goals/' + entity.nodeid
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
  
  goTo () {
    if (!this.link) return;
    this.$location.path(this.link);
  }
}

export default SPEntityController;
