'use strict';

let SPGoalplanningStateFactory = function (localStorageService) {
  'ngInject';
  let rootNode;
  let preventDiagramOutside = (diagram) => {
      let prevent = false;
      let left = diagram.documentBounds.left;
      let right = diagram.documentBounds.right;
      let top = diagram.documentBounds.top;
      let bottom = diagram.documentBounds.bottom;

      let vLeft = diagram.viewportBounds.left;
      let vRight = diagram.viewportBounds.right;
      let vTop = diagram.viewportBounds.top;
      let vBottom = diagram.viewportBounds.bottom;

      if(right - vLeft < 140 ){//left
          prevent = true;
      }
      if(left - vRight > -140 ){//right
          prevent = true;
      }
      if(bottom - vTop < 120){//top
          prevent = true;
      }
      if((top - vBottom) > -120){//bottom
          prevent = true;
      }

      //prevent if diagram have the X figure
      let pos = diagram.position;
      let scale = diagram.scale;
      let w = diagram.viewportBounds.width;
      let h = diagram.viewportBounds.height;

      if (!prevent){
          prevent = true;
          diagram.nodes.each(function (node){
              if (node instanceof go.Node) {
                  let flag = false;
                  let loc = node.getDocumentPoint(go.Spot.TopLeft);
                  let left = Math.floor((loc.x - pos.x - 1) * scale);
                  let top = Math.floor((loc.y - pos.y - 1) * scale);
                  if (left < 0 || left > w) {
                      flag = true;
                  }
                  if (top < 0 || top > h) {
                      flag = true;
                  }
                  if (!flag) prevent = false;
              }
          });
      }

      if(prevent) scrollToRoot(diagram);
  };

  let scrollToRoot = (diagram) => {
      rootNode = diagram.nodes.first().findTreeRoot();
      if(rootNode !== null) {
        diagram.clearSelection();
        rootNode.isSelected = true;
        diagram.commandHandler.resetZoom();
        diagram.commandHandler.scrollToPart();
        rootNode.isSelected = false;
      }
  };

  return {
    setStateHandlers: (diagram) => {
      diagram.addDiagramListener('ViewportBoundsChanged', function (e) {
        localStorageService.set('goal-position', {
          x: diagram.position.x,
          y: diagram.position.y
        });
        localStorageService.set('goal-scale', diagram.scale);
          let point = localStorageService.get('goal-position');
          let scale = localStorageService.get('goal-scale');
      });

      diagram.addDiagramListener('LayoutCompleted', function (e) {
        localStorageService.set('goal-position', {
          x: diagram.position.x,
          y: diagram.position.y
        });
        localStorageService.set('goal-scale', diagram.scale);
          let point = localStorageService.get('goal-position');
          let scale = localStorageService.get('goal-scale');
      });
    },
    loadState: (diagram) => {
      let point = localStorageService.get('goal-position');
      if (point) {
        diagram.position = new go.Point(point.x, point.y);
      }

      let scale = localStorageService.get('goal-scale');
      if (scale) {
         diagram.scale = scale;
      }
      preventDiagramOutside(diagram);
      if (!point && !scale){
          scrollToRoot(diagram);
      }
      return point;
    }
  }
};

export default SPGoalplanningStateFactory;