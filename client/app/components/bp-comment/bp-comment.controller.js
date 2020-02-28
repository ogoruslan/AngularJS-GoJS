'use strict';

class BPCommentController {
  constructor(Utils) {
    "ngInject";
    this.Utils = Utils;
    this.savedText = undefined;
  }

  deleteComment() {
    let ok = () => {
      this.bpIsDeleted = true;
      if (this.bpOnDelete) {
        this.bpOnDelete();
      }
    };
    return this.Utils.confirmAction(event, 'Are you sure you want to delete this comment?', 'File will be deleted permanently.', ok);
  }

  startEditing() {
    this.savedText = this.bpText;
    this.isEditing = true;

    if (this.bpOnEditStart) {
      this.bpOnEditStart({
        isEditing: this.isEditing
      })
    }
  }

  endEditing() {
    if (this.savedText) this.bpText = this.savedText;
    this.isEditing = false;

    if (this.bpOnEditEnd) {
      this.bpOnEditEnd({
        isEditing: this.isEditing
      })
    }
  }

  saveEditing() {
    if (!this.bpText || this.Utils.hasWhiteSpaceOnly(this.bpText)) return;

    if (this.bpOnEditCommit) {
      this.bpOnEditCommit({
        text: this.bpText
      });
    }
    this.endEditing();
  }

  restoreComment() {
    this.bpIsDeleted = false;
    if (this.bpOnRestore) {
      this.bpOnRestore();
    }
  }
}

export default BPCommentController;
