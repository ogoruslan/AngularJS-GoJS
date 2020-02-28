'use strict';

function SPZoombarController($scope) {
    'ngInject';
    
    let noop = () => {};
    let isPanActivatedByKey = false;
    
    let activatePanMode = (e) => {
        if (this.mode === 'pan') return;
        if ((!e || e.key === 'Control' || e.key === 'Meta') && this.spDiagram) {
            isPanActivatedByKey = !!e;
            this.spDiagram.toolManager.clickSelectingTool.isEnabled = false;
            this.spDiagram.toolManager.draggingTool.isEnabled = false;
            this.spDiagram.toolManager.actionTool.isEnabled = false;
            this.spDiagram.toolManager.textEditingTool.isEnabled = false;
            this.spDiagram.toolManager.__standardMouseOver = this.spDiagram.toolManager.standardMouseOver;
            this.spDiagram.toolManager.standardMouseOver = noop;
        }
    };
    
    let deactivatePanMode = (e) => {
        if (this.mode === 'pan') return;
        if ((!e || e.key === 'Control' || e.key === 'Meta') && this.spDiagram) {
            if (!isPanActivatedByKey && e) return;
            isPanActivatedByKey = false;
            this.spDiagram.toolManager.clickSelectingTool.isEnabled = true;
            this.spDiagram.toolManager.draggingTool.isEnabled = true;
            this.spDiagram.toolManager.actionTool.isEnabled = true;
            this.spDiagram.toolManager.textEditingTool.isEnabled = true;
            if (this.spDiagram.toolManager.__standardMouseOver) {
                this.spDiagram.toolManager.standardMouseOver = this.spDiagram.toolManager.__standardMouseOver;
                delete this.spDiagram.toolManager.__standardMouseOver;
            }
        }
    };
    
    let deactivePanModeSpecially = (e) => {
        if (isPanActivatedByKey && !(e.metaKey || e.ctrlKey)) {
            deactivatePanMode();
        }
    };
    
    window.document.addEventListener('keydown', activatePanMode);
    window.document.addEventListener('keyup', deactivatePanMode);
    window.document.addEventListener('click', deactivePanModeSpecially);
    window.addEventListener('focus', deactivePanModeSpecially);
    
    this.mode = 'pointer';
    
    this.zoomIn = function () {
        if (this.spDiagram) {
            this.spDiagram.toolManager.textEditingTool.doMouseDown();
            this.spDiagram.commandHandler.increaseZoom(1.25);
        }
    };
    
    this.zoomOut = function () {
        if (this.spDiagram) {
            this.spDiagram.toolManager.textEditingTool.doMouseDown();
            this.spDiagram.commandHandler.decreaseZoom(0.75);
        }
    };
    
    this.scrollToCenter = function () {
        if (this.spDiagram) {
            this.spDiagram.toolManager.textEditingTool.doMouseDown();
            if(this.spDiagram.nodes.count > 0){
                let rootNode = this.spDiagram.nodes.first().findTreeRoot();
                if(rootNode !== null){
                    this.spDiagram.clearSelection();
                    rootNode.isSelected = true;
                    this.spDiagram.commandHandler.resetZoom();
                    this.spDiagram.commandHandler.scrollToPart();
                }
            }
        }
    };
    
    this.panMode = () => {
        activatePanMode();
        this.mode = 'pan';
    };
    
    this.pointerMode = () => {
        this.mode = 'pointer';
        deactivatePanMode();
    };
    
    this.$onDestroy = () => {
        window.document.removeEventListener('keydown', activatePanMode);
        window.document.removeEventListener('keyup', deactivatePanMode);
        window.document.removeEventListener('click', deactivePanModeSpecially);
        window.removeEventListener('focus', deactivePanModeSpecially);
    }
}

export default SPZoombarController;
