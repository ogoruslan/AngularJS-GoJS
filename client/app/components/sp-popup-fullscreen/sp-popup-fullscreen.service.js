'use strict';

class SPPopupFullscreenController {
  constructor(mdPanelRef) {
    'ngInject';
    
    this.mdPanelRef = mdPanelRef;
  }
  
  close () {
    this.mdPanelRef && this.mdPanelRef.close();
  }
}

let SPPopupFullscreenFactory = function ($mdPanel) {
  'ngInject';
  
  let panelRef;
  let config = {
    attachTo: angular.element(document.body),
    controllerAs: '$ctrl',
    fullscreen: true,
    escapeToClose: true,
    focusOnOpen: true,
    panelClass: 'sp-popup-fullscreen'
  };
  
  
  return {
    open: ($event, template, controller, locals) => {
      let panelAnimation = $mdPanel.newPanelAnimation()
        .openFrom({
          top: $event.clientY,
          left: $event.clientX
        })
        .withAnimation($mdPanel.animation.SCALE)
        .closeTo({
          top: $event.clientY,
          left: $event.clientX
        });
      $mdPanel.open(Object.assign({}, config, {
        animation: panelAnimation,
        targetEvent: $event,
        controller: controller || SPPopupFullscreenController,
        locals,
        template: '' +
        '<div class="close-panel" ng-click="$ctrl.close()">' +
          '<md-icon md-svg-icon="close" aria-label="Close panel"></md-icon>' +
        '</div>' +
        '<div class="sp-popup-fullscreen-container">' +
          template +
        '</div>',
      }))
        .then(function(result) {
          panelRef = result;
        });
    }
  }
};

export default SPPopupFullscreenFactory;