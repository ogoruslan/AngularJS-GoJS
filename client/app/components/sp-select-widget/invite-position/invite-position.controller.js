'use strict';

class InvitePositionController {
  constructor() {
    'ngInject'
    this.positions = [];
    this.searchText = '';
    this.selectedItem = null;
    this.nodesById = {};
    this.userEmail = '';
  }
  
  $onChanges (changes) {
    let ctrl = this;
    if ('spPositions' in changes) {
      let positions = changes.spPositions.currentValue;
      if (positions) {
        this.nodesById = {};
        positions.forEach((node) => {
          ctrl.nodesById[node.nodeId] = node;
        });
        positions.forEach((node) => {
          if (node.position && node.position.users.length <= 0) {
            let department = ctrl.findParentDepartment(node);
            let departmentName = department && department.department.departmentName || '';
            this.positions.push({
              nodeId: node.nodeId,
              name: node.position.designation,
              department: departmentName,
            });
          }
        })
      }
    }
  }
  
  findParentDepartment (node) {
    if (!node || !node.parentNodeId) return null;
    let parent = this.nodesById[node.parentNodeId];
    if (parent && parent.department) {
      return parent;
    } else {
      return this.findParentDepartment(parent);
    }
  }

  checkEmail(inputValue){
      let query = inputValue.$viewValue.toLowerCase();
      let filtred = true;
      this.spSearchUsers && this.spSearchUsers(query).then(function(result){
        result.forEach((node) => {
              let email = '';
              email = node.email.toLowerCase();
              if (query === email){
                  filtred =  false;
              }
          });
          inputValue.$setValidity('equal', filtred);
      });
  }
  
  querySearch (query) {
    return query ? this.positions.filter((position) => {
      let name = position.name.toLowerCase();
      let department = position.department.toLowerCase();
      let email = '';
      if (position.user) email = position.user.email.toLowerCase();
      return name.indexOf(query) >= 0 || department.indexOf(query) >= 0 || email.indexOf(query) >= 0;
    }) : this.positions;
  }
  
  invitePosition () {
    this.onPositionCreated({
      position: {
        nodeId: this.selectedItem && this.selectedItem.nodeId,
        position: {
          designation: this.searchText,
          permission :this.spPosition.permission,
          users: [{
              email: this.userEmail
          }]

        }
      }
    });
  }
  
}

export default InvitePositionController;
