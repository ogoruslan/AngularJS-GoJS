'use strict';

class SPCommentController {
  constructor($mdDialog) {
    "ngInject";
    this.$mdDialog = $mdDialog;
    this.savedText = undefined;
  }

  confirmAction (event, title, message, ok, error){
      let confirm = this.$mdDialog.confirm({
          multiple: true
      })
          .title(title)
          .textContent(message)
          .targetEvent(event)
          .ok('Yes')
          .cancel('No');
      return this.$mdDialog.show(confirm).then(ok, error);
  }

  deleteComment() {
    let ok = () => {
      this.spIsDeleted = true;
      if (this.spOnDelete) {
        this.spOnDelete();
      }
    };
    return this.confirmAction(event, 'Are you sure you want to delete this comment?', 'It will be deleted permanently.', ok);

  }

  startEditing() {
    this.savedText = this.spText;
    this.isEditing = true;

    if (this.spOnEditStart) {
      this.spOnEditStart({
        isEditing: this.isEditing
      })
    }
  }

  endEditing() {
    if (this.savedText) this.spText = this.savedText;
    this.isEditing = false;

    if (this.spOnEditEnd) {
      this.spOnEditEnd({
        isEditing: this.isEditing
      })
    }
  }

  saveEditing() {
    if (!this.spText || !this.spText.trim()) return;

    if (this.spOnEditCommit) {
      this.spOnEditCommit({
        text: this.spText
      });
    }
    this.endEditing();
  }

  restoreComment() {
    this.spIsDeleted = false;
    if (this.spOnRestore) {
      this.spOnRestore();
    }
  }
}

export default SPCommentController;
