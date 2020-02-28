'use strict';

class BPPropertiesCommentsController {
  constructor($scope, bpSettingsService, $timeout, Utils) {
    "ngInject";
    this.bpSettingsService = bpSettingsService;
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.Utils = Utils;
    this.comment = {};
    this.activeUser = this.bpSettingsService.activeUser ? this.bpSettingsService.activeUser : {};
    this.commentsExpended = false;
    this.addingComment = false;
    this.editingComment = false;
    this.activeIndex = 0;
  }

  $onChanges(changesObj) {
    if ('bpComments' in changesObj) {
      this._onCommentsClose();
    }
  }

  toggleComments(event) {
    if (event) event.stopPropagation();
    this.commentsExpended = !this.commentsExpended;
  }

  addComment() {
    if (angular.equals(this.comment, {}) || angular.equals(this.activeUser, {})) return;

    if (!this.comment.text  || this.Utils.hasWhiteSpaceOnly(this.comment.text)) return;


    this.comment.dtCreated = new Date();
    this.comment.dtUpdated = undefined;
    this.comment.createdBy = {
      id: this.activeUser.id,
      picture: this.activeUser.picture,
      firstName: this.activeUser.firstName,
      lastName: this.activeUser.lastName,
      position: this.activeUser.positions[0].name
    };

    this.bpComments.unshift(this.comment);
    this.commentsExpended ? this.commentsExpended = true : this.commentsExpended = false;
    this.comment = {};
    this.addingComment = false;
    this.saveComments();
  }

  startAdding(event) {
    if (event) event.stopPropagation();

    this.addingComment = true;
    this.commentsExpended = true;
    this.$timeout(() => {
      angular.element(document.getElementById('addComment'))[0].focus();
    }, 50);
  }

  cancelAdd() {
    this.comment = {};
    this.addingComment = false;
    if (!this.bpComments.length) {
      this.commentsExpended = false;
    }
  }

  hoverIn(index) {
    this.activeIndex = index;

    let _createdByUserId = this.bpComments[this.activeIndex].createdBy.id;

    if (this.activeUser.id === _createdByUserId) {
      this.bpComments[this.activeIndex].showActions = true;
    }
  }

  hoverOut() {
    this.bpComments[this.activeIndex].showActions = false;
  }

  deleteComment() {
    this.bpComments[this.activeIndex].isDeleted = true;
    this.saveComments();
    // call delete comment api here
  }

  restoreComment() {
    this.bpComments[this.activeIndex].isDeleted = false;
    this.saveComments();
    // call undelete comment api here
  }

  editCommit(text) {
    this.bpComments[this.activeIndex].text = text;
    this.bpComments[this.activeIndex].dtUpdated = new Date();
    this.saveComments();
    // call edit comment api here
  }

  editStart(isEditing) {
    this.editingComment = isEditing || false;
  }

  editEnd(isEditing) {
    this.editingComment = isEditing || false;
  }

  saveComments() {
    if (this.onCommentsChanged) {
      this.onCommentsChanged({
        whatIsChanged: 'Comments'
      })
    }
  }

  _onCommentsClose() {
    this.comment = {};
    this.commentsExpended = false;
    this.addingComment = false;
  }
}

export default BPPropertiesCommentsController;
