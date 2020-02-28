'use strict';

import spUtils from "../sp-utils/sp-utils.service";

class SPPropertiesCommentsController {
  constructor($scope, $timeout,spUtils) {
    "ngInject";
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.comment = {};
    this.activeUser = this.currentUser ? this.currentUser : {//TOdo remove this test data
        "avatarFileId": "",
        "email": "rest@gmail.com",
        "firstName": "irakli",
        "inviteAccepted": true,
        "lastName": "ibdurahmanovich",
        "userId": "db064ab3-c977-4a3c-8748-cabcf0ca7d91"
    };
    this.scrollHeight = this.scrollAreaHeight;
    this.commentsExpended = false;
    this.addingComment = false;
    this.editingComment = false;
    this.activeIndex = 0;
    this.spUtils = spUtils;
  }

  $onChanges(changesObj) {
    if ('spComments' in changesObj) {
      this._onCommentsClose();
    }
  }

  toggleComments(event) {
    if (event) event.stopPropagation();
    this.commentsExpended = !this.commentsExpended;
  }

  addComment() {
    if (angular.equals(this.comment, {}) || angular.equals(this.activeUser, {})) return;
    if (!this.comment.text  || (!this.comment.text.trim())) return;

    this.comment.dtCreated = new Date();
    this.comment.dtUpdated = undefined;
    if (!this.activeUser.avatarFileId) {
       this.spUtils.setAvatar(this.activeUser);
    }
    this.comment.createdBy = {
      id: this.activeUser.id,
      avatarFileId: this.activeUser.avatarFileId,
      firstName: this.activeUser.last_name || this.activeUser.lastName,
      lastName: this.activeUser.last_name || this.activeUser.firstName,
      position: (this.activeUser.positions) ? this.activeUser.positions : "No position"
    };

    this.spComments.unshift(this.comment);
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
    if (!this.spComments.length) {
      this.commentsExpended = false;
    }
  }

  hoverIn(index) {
    this.activeIndex = index;

    let _createdByUserId = this.spComments[this.activeIndex].createdBy.id;

    if (this.activeUser.id === _createdByUserId) {
      this.spComments[this.activeIndex].showActions = true;
    }
  }

  hoverOut() {
    this.spComments[this.activeIndex].showActions = false;
  }

  deleteComment() {
    this.spComments[this.activeIndex].isDeleted = true;
    this.saveComments();
    // call delete comment api here
  }

  restoreComment() {
    this.spComments[this.activeIndex].isDeleted = false;
    this.saveComments();
    // call undelete comment api here
  }

  editCommit(text) {
    this.spComments[this.activeIndex].text = text;
    this.spComments[this.activeIndex].dtUpdated = new Date();
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

export default SPPropertiesCommentsController;
