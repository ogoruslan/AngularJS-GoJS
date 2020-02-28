'use strict';

function spGoalplanningConfig() {
    'ngInject';
    
    let $$ = go.GraphObject.make;
    return {
        diagramConfig: function () {
            return {
                initialScale:1,
                initialViewportSpot: go.Spot.Center,
                initialContentAlignment: go.Spot.Center,
                hasHorizontalScrollbar: false,
                hasVerticalScrollbar: false,
                allowHorizontalScroll: true,
                allowVerticalScroll: true,
                scrollMode: go.Diagram.InfiniteScroll,
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelScroll,
                "draggingTool.dragsTree": false,
                "animationManager.isEnabled": false,
                "animationManager.duration": 1,
                allowClipboard: false,
                allowCopy:false,
                "commandHandler.copiesTree": false,
                "commandHandler.deletesTree": true,
                "undoManager.isEnabled": false,
                "commandHandler.copiesParentKey": true,
                "toolManager.holdDelay": 400,
                "dragSelectingTool.isEnabled": false,
            }
        }
    }
}

export default spGoalplanningConfig;