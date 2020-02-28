'use strict';

function spGoalplanningTemplates(spGoalplanningModel) {
    'ngInject';
    
    let $$ = go.GraphObject.make;
    let self;

// colors for to keep consistency
// default colors
    let linkDefaultFillColor = '#e8e8e8';
    let rootDefaultFillColor =  '#ffffff';
    let treeExpanderShapeStrokeColor = '#d5d1da';
    let nodeFillDefaultClr = "transparent";
    let nodeOutlineDefaultClr = "#ccc7d3";
    let nodeOutlineDefaultColorTransparent = "transparent";
    let nodeStrokeWidth = 2;
// hover colors
    let nodeFillHoverClr = "transparent";//"#e8e8e8";
    let nodeOutlineHoverClr = "rgb(63,81,181)";
// mouse drag enter colors
    let selectedNodeDragEnterColor = "#e8e8e8";
    let selectedNodeDragOutColor = "transparent";
    let nodeOutlineMouseDragEnterClr = "#ccc7d3";

    go.GraphObject.defineBuilder("PositionsTreeExpanderGoals", function (args) {
        let button = ($$(go.Panel,
            {
                "_treeExpandedFigure": "MinusLine",
                "_treeCollapsedFigure": "PlusLine",
                cursor: "pointer"
            },
            $$(go.Shape,
                {
                    figure: "Circle",
                    desiredSize: new go.Size(20, 20),
                    stroke: "transparent",
                    strokeWidth: nodeStrokeWidth,
                    fill: linkDefaultFillColor
                }
            ),
            $$(go.Shape,
                {
                    name: "TreeExpanderShape",
                    figure: "Circle",
                    desiredSize: new go.Size(20, 20),
                    stroke: treeExpanderShapeStrokeColor,
                    strokeWidth: nodeStrokeWidth,
                    fill: nodeFillDefaultClr
                },
                new go.Binding("stroke", "isHighlighted", function(h,e) {
                    return (h && !e.part.isSelected) ? nodeOutlineHoverClr : treeExpanderShapeStrokeColor; }).ofObject()
            ),
            $$(go.Shape,  // the icon
                {
                    name: "ButtonIcon",
                    figure: "MinusLine",
                    desiredSize: new go.Size(10, 10),
                    margin: 5,
                    stroke: treeExpanderShapeStrokeColor,
                    strokeWidth: nodeStrokeWidth
                },
                new go.Binding("figure", "_isTreeExpanded", function (exp, shape) {
                    var but = shape.panel;
                    return exp ? but["_treeExpandedFigure"] : but["_treeCollapsedFigure"];
                }),
                new go.Binding("stroke", "isHighlighted", function(h,e) {
                    return (h && !e.part.isSelected) ? nodeOutlineHoverClr : treeExpanderShapeStrokeColor; }).ofObject()
            ),
            {
                visible: true
            },
            new go.Binding("visible", "_isTreeLeaf", function (leaf) {
                if(leaf === true) return true;
                else return false;
            })
        ));



        button.click = function (e, button) {
            let node = button.part;
            if (node instanceof go.Adornment) node = node.adornedPart;
            if (!(node instanceof go.Node)) return;
            let diagram = node.diagram;
            if (diagram === null) return;
            let _isTreeExpanded = node.data._isTreeExpanded;
            diagram.startTransaction("Updated Node _isTreeExpanded");
            diagram.model.setDataProperty(node.data, "_isTreeExpanded", '');
            diagram.model.setDataProperty(node.data, "_isTreeExpanded", !_isTreeExpanded );
            diagram.commitTransaction("Updated Node _isTreeExpanded");
            _isTreeExpanded = !_isTreeExpanded;
            self.updateChildNodesVisible (node, _isTreeExpanded);
            self.updateNodeDirection();
        };
        return button;
    });

    go.Shape.defineFigureGenerator("customShape", function (shape, w, h) {
        let p1 = 20,
        geo = new go.Geometry();
        geo.add(new go.PathFigure(0, p1)
        .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
        .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
        .add(new go.PathSegment(go.PathSegment.Line, p1, h))
        .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p1, h - p1, p1, p1).close()));
        return geo;
    });

    function spotConverter(dir, from) {
        if (dir === "left") {
            return (from ? go.Spot.Left : go.Spot.Right);
        } else {
            return (from ? go.Spot.Right : go.Spot.Left);
        }
    }

    function checkNodeChilds (node,part){
        let it1 = part.findTreeParts().iterator; // find all child nodes
        while(it1.next()) {
            if (it1.value instanceof go.Node) {
                if ((("" + node.data.key) === ("" + it1.value.data.key)) && ("" + it1.value.data.parent !== "0")) {
                    return true;
                }
            }
        }
        return false;
    }

    let getEntityIcon = function (entityType) {
        switch (entityType){
            case "Project" : return "/assets/strategical-planning-assets/icons/entity-project.svg";
            case "BPM" : return "/assets/strategical-planning-assets/icons/entity-bpm.svg";
            case "DataAsset" : return "entity-data-assets.svg";
            case "Report" : return "/assets/strategical-planning-assets/icons/entity-report.svg";
            case "openDoc" : return "/assets/strategical-planning-assets/icons/entity-oo-doc.svg";
        }
    };

    function showConnections(e) {
        let diagram = e.diagram;
        let node = e.part;
        if (node) {
            diagram.startTransaction("highlight");
            diagram.clearHighlighteds();
            node.isHighlighted = true;
            node.findTreeParentChain().each(function (l) {
                l.isHighlighted = true;
            });
            diagram.commitTransaction("highlight");
        }
    }

    return self = {
        updateNodeDirection: null,
        toggleEntity: function (e, obj,visible = null){
            let node = obj.part;
            let data = node.data;
            let entityOpen;
            if (data) {
                data.entities.forEach(function (node, index, array) {
                    let tmpNode = obj.diagram.findNodeForKey(node.entityId + data.nodeid);
                    if (tmpNode !== null) {
                        if(visible === null){
                            tmpNode.visible = !tmpNode.visible;
                            entityOpen = tmpNode.visible;
                        } else {
                            tmpNode.visible = visible;
                            entityOpen = visible;
                        }
                    }
                });
                self.updateNodeDirection();
                data.entityOpen = entityOpen;
                obj.diagram.startTransaction("Updated Node text");
                obj.diagram.model.setDataProperty(data, "entityOpen", '');
                obj.diagram.model.setDataProperty(data, "entityOpen", entityOpen );
                obj.diagram.commitTransaction("Updated Node text");
            }
        },
        updateChildNodesVisible: function (node, _isTreeExpanded) {
            let diagram = node.diagram;
            // recursively update the visible of the child nodes
            let children = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
            while (children.next()) {
                let childNode = children.value;
                if (_isTreeExpanded === true){//visible true
                    if (childNode.data.category === "entity") {
                        if (diagram.findNodeForKey(childNode.data.parent).visible === true && diagram.findNodeForKey(childNode.data.parent).data.entityOpen === true){
                            childNode.visible = true;
                        }
                    }
                    if (childNode.data.category === "child" && diagram.findNodeForKey(childNode.data.parent).data._isTreeExpanded !== false){
                        if (diagram.findNodeForKey(childNode.data.parent).visible === true){
                            childNode.visible = true;
                        }
                    }
                }

                if (_isTreeExpanded === false){//visible false
                    if (diagram.findNodeForKey(childNode.data.parent).visible === true && childNode.data.category === "entity"){
                    }else childNode.visible = false;
                }
                self.updateChildNodesVisible (children.value, _isTreeExpanded);
            }
        },
        makeRoot: function (events) {
            return $$(go.Node, "Auto",
                {
                    zOrder: 15,
                    selectionObjectName: "NODE-OUTLINE",
                    minSize: new go.Size(123, 40),
                    selectionChanged: function (node) {
                        if (node.diagram.selection.count > 1){
                            node.isSelected = false;
                        }
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline !== null) {
                            if (node.isSelected) {
                                nodeOutline.stroke = nodeOutlineHoverClr;
                            }
                            else
                                nodeOutline.stroke = nodeOutlineDefaultClr;
                        }
                    },
                },
                {
                    mouseDrop: function (e, node) {
                        let goaldiagram = node.diagram;
                        let dropDirection = 'right';
                        if((node.location.x + node.actualBounds.width)/2 - go.Point.stringify(e.diagram.lastInput.documentPoint).split(' ')[0] > 0) dropDirection = 'left';
                        else dropDirection = 'right';
                        for (let it = goaldiagram.selection.iterator; it.next(); ) {
                            let part = it.value;  // part is now a Node or a Group or a Link or maybe a simple Part
                            if (part instanceof go.Node) {
                                if (part.data.category === 'root' || part.data.category === 'entity'  || part.data.category === 'private') continue;
                                if(checkNodeChilds (node,part)){
                                    continue; //parent node can not insert to childs node
                                }
                                let link = part.findTreeParentLink();
                                if (link !== null) { // reconnect any existing link
                                    link.fromNode = node;
                                } else { // else create a new link
                                    goaldiagram.toolManager.linkingTool.insertLink(node, node.port, part, part.port);
                                }
                                let nodeX;
                                nodeX = part.location.x;
                                if (dropDirection) {
                                    self.updateNodeDirection && self.updateNodeDirection(part, dropDirection);
                                }else {
                                    if (Math.abs(nodeX) === nodeX ) {
                                        self.updateNodeDirection && self.updateNodeDirection(part, "right");
                                    } else if (Math.abs(nodeX) !== nodeX) {
                                        self.updateNodeDirection && self.updateNodeDirection(part, "left");
                                    }
                                }
                            }
                        }
                    },
                    // Simple hover over the node
                    mouseEnter: function (e, node) {
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline) {
                            nodeOutline.stroke = nodeOutlineHoverClr;
                        }
                    },
                    mouseLeave: function (e, node) {
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline && !node.isSelected) {
                            nodeOutline.stroke = nodeOutlineDefaultClr;
                        }
                    },
                    mouseDragEnter: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        nodeOutline.fill = nodeOutlineMouseDragEnterClr;
                        let selectedNodeOutline = e.diagram.selection.first().findObject("NODE-OUTLINE");
                        if (selectedNodeOutline) {
                            selectedNodeOutline.fill = selectedNodeDragEnterColor;
                        }
                    },
                    mouseDragLeave: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline) {
                            nodeOutline.fill = rootDefaultFillColor;
                        }
                        let selectedNodeOutline = e.diagram.selection.first().findObject("NODE-OUTLINE");
                        if (selectedNodeOutline) {
                            selectedNodeOutline.fill = selectedNodeDragOutColor;
                        }
                    },
                },
                $$(go.Shape, 'customShape',
                    {
                        name: "NODE-OUTLINE",
                        alignment: go.Spot.Center,
                        fill: rootDefaultFillColor,
                        stroke: nodeOutlineDefaultClr,
                        strokeWidth: nodeStrokeWidth,
                        stretch: go.GraphObject.Fill,
                        minSize: new go.Size(123, 40),
                        maxSize: new go.Size(400, 110),
                        margin: new go.Margin(0, 0, 0, 0),
                    },
                ),
                $$(go.TextBlock,
                    {
                        _maxLength: 255,
                        _maxWidth: 275,
                        _required: true,
                        _trim: true,
                        name: "TEXT",
                        alignment: go.Spot.TopCenter,
                        editable: true,
                        font: "normal 16px 'Roboto', 'Helvetica Neue', sans-serif",
                        stroke: "rgba(0, 0, 0, 0.87)",
                        textAlign: "center",
                        margin: new go.Margin(11, 16, 8, 16),
                        minSize: new go.Size(100, 17),
                        maxSize: new go.Size(275, 110),
                        isMultiline: false,
                        maxLines: 1,
                        overflow: go.TextBlock.OverflowEllipsis,
                        wrap: go.TextBlock.WrapFit,
                        portId: "",
                        fromSpot: go.Spot.LeftRightSides,
                        toSpot: go.Spot.LeftRightSides,
                    },
                    // remember not only the text string but the scale and the font in the node data
                    new go.Binding("text", "text").makeTwoWay(),
                    new go.Binding("scale", "scale").makeTwoWay(),
                    new go.Binding("font", "font").makeTwoWay(),
                    new go.Binding("fromSpot", "dir", function (d,node) {
                        return spotConverter(d, true,node); }),
                    new go.Binding("toSpot", "dir", function (d,node) {
                        return spotConverter(d, false,node); }),
                ),
                // remember the locations of each node in the node data
                //new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                // make sure text "grows" in the desired direction
                new go.Binding("locationSpot", "dir", function (d,node) { return spotConverter(d, false,node); }),
            )
        },
        makeChild: function (events) {
            return $$(go.Node, "Vertical",
                {
                   minSize: new go.Size(123, 40),
                   margin: new go.Margin(0, 0, 0, 0),
                   maxSize:new go.Size(452, 144),
                   zOrder: 15,
                   selectionObjectName: "NODE-OUTLINE",
                },
                {
                    mouseDrop: function (e, node) {
                        let goaldiagram = node.diagram;
                        let dropDirection = node.data.dir;
                        let updated = false;
                        for (let it = goaldiagram.selection.iterator; it.next(); ) {
                            let part = it.value;
                            let parentNode;
                            let entityIndex = null;
                            if (part instanceof go.Node) {
                                if (part.data.category === 'root') continue;
                                if (part.data.category === 'private') continue;
                                if (part.data.category === 'entity'){//do nothing if entity is in the goal
                                    parentNode = goaldiagram.findNodeForKey(part.data.parent);
                                    node.data.entities.forEach(function (entity, index, array) {
                                        if (entity['entityId'] === part.data.entityId) {
                                            entityIndex = index;
                                        }
                                    });
                                    if (entityIndex !== null) continue;
                                }
                                if(checkNodeChilds (node,part)){
                                    continue; //parent node can not insert to childs node
                                }
                                if (part.data.category === 'entity'){
                                    //update old parent node
                                    entityIndex = null;
                                    parentNode.data.entities.forEach(function (entity, index, array) {
                                        if (entity['entityId'] === part.data.entityId) {
                                            entityIndex = index;
                                        }
                                    });
                                    parentNode.data.entities.splice(entityIndex,1);
                                    let nodeEntity = parentNode.data.entities;
                                    goaldiagram.startTransaction("Updated Node entity");
                                    goaldiagram.model.setDataProperty(parentNode.data, "entities", '');
                                    goaldiagram.model.setDataProperty(parentNode.data, "entities", nodeEntity );
                                    goaldiagram.commitTransaction("Updated Node entity");
                                    spGoalplanningModel.updateNode(parentNode.data.nodeid, parentNode.data);

                                    //update new parent node
                                    nodeEntity = null;
                                    let entity = {};
                                    entity.entityId = part.data.entityId;
                                    entity.entityName = part.data.entityName;
                                    entity.entityParentId = part.data.entityParentId;
                                    entity.entityOwnerId = part.data.entityOwnerId;
                                    entity.entityType = part.data.entityType;
                                    entity.url = part.data.url;
                                    entity.notificationFlag = part.data.notificationFlag;
                                    entity.removed = part.data.removed;
                                    entity.countSubObjects = part.data.countSubObjects;
                                    entity.positions = part.data.positions;
                                    entity.notifications = part.data.notifications;
                                    entity.comments = part.data.comments;
                                    nodeEntity = node.data.entities;
                                    nodeEntity[nodeEntity.length] = entity;
                                    goaldiagram.startTransaction("Updated Node entity");
                                    goaldiagram.model.setDataProperty(node.data, "entities", '');
                                    goaldiagram.model.setDataProperty(node.data, "entities", nodeEntity );
                                    goaldiagram.commitTransaction("Updated Node entity");
                                    spGoalplanningModel.updateNode(node.data.nodeid, node.data);

                                    if (entity.entityType === 'Project') {
                                        spGoalplanningModel.changeEntityGoalsMatched(part.data.entityId,[{nodeId:node.data.nodeid,type:"add"},{nodeId:parentNode.data.nodeid,type:"delete"}]);
                                    }

                                    //update entity
                                    let nodeid  = part.data.entityId + node.data.nodeid;
                                    goaldiagram.startTransaction("Updated Node nodeid");
                                    goaldiagram.model.setDataProperty(part.data, "nodeid", '');
                                    goaldiagram.model.setDataProperty(part.data, "nodeid", nodeid );
                                    goaldiagram.commitTransaction("Updated Node nodeid");
                                    goaldiagram.startTransaction("Updated Node key");
                                    goaldiagram.model.setDataProperty(part.data, "key", '');
                                    goaldiagram.model.setDataProperty(part.data, "key", nodeid );
                                    goaldiagram.commitTransaction("Updated Node key");

                                    self.toggleEntity(null,node,true);
                                }
                                let link = part.findTreeParentLink();
                                if (link !== null) { // reconnect any existing link
                                    link.fromNode = node;
                                } else { // else create a new link
                                    goaldiagram.toolManager.linkingTool.insertLink(node, node.port, part, part.port);
                                }
                                if (part.data.category !== 'entity') {
                                    updated = true;
                                }
                                let nodeX;
                                nodeX = part.location.x;
                                if (dropDirection) {
                                    self.updateNodeDirection && self.updateNodeDirection(part, dropDirection);
                                }else {
                                    if (Math.abs(nodeX) === nodeX ) {
                                        self.updateNodeDirection && self.updateNodeDirection(part, "right");
                                    } else if (Math.abs(nodeX) !== nodeX) {
                                        self.updateNodeDirection && self.updateNodeDirection(part, "left");
                                    }
                                }
                            }
                        }
                        if (updated){
                            goaldiagram.startTransaction("Updated Node _isTreeLeaf");
                            goaldiagram.model.setDataProperty(node.data, "_isTreeLeaf", '');
                            goaldiagram.model.setDataProperty(node.data, "_isTreeLeaf", true);
                            goaldiagram.commitTransaction("Updated Node _isTreeLeaf");
                            goaldiagram.startTransaction("Updated Node _isTreeExpanded");
                            goaldiagram.model.setDataProperty(node.data, "_isTreeExpanded", '');
                            goaldiagram.model.setDataProperty(node.data, "_isTreeExpanded", true);
                            goaldiagram.commitTransaction("Updated Node _isTreeExpanded");
                            self.updateChildNodesVisible(node,true);
                        }
                    },
                    // Simple hover over the node
                    mouseEnter: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline) {
                            nodeOutline.stroke = nodeOutlineHoverClr;
                        }
                        let nodePicture = node.findObject("Picture");
                        if (nodePicture) {
                            if (nodePicture.source.indexOf('ic-connection-default.svg') >= 0){
                                nodePicture.source = "/assets/strategical-planning-assets/icons/ic-connections-hover.svg";
                            }
                        }
                        let nodePicture1 = node.findObject("Picture1");
                        if (nodePicture1) {
                            if (nodePicture1.source.indexOf('ic-connection-default.svg') >= 0){
                                nodePicture1.source = "/assets/strategical-planning-assets/icons/ic-connections-hover.svg";
                            }
                        }
                    },
                    mouseLeave: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline && !node.isSelected) {
                            // restore original colors
                            nodeOutline.stroke = nodeOutlineDefaultColorTransparent;
                        }
                        let nodePicture = node.findObject("Picture");
                        if (nodePicture && !node.isSelected) {
                            if (nodePicture.source.indexOf('ic-connections-hover.svg') >= 0){
                                nodePicture.source = "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                            }
                        }
                        let nodePicture1 = node.findObject("Picture1");
                        if (nodePicture1 && !node.isSelected) {
                            if (nodePicture1.source.indexOf('ic-connections-hover.svg') >= 0){
                                nodePicture1.source = "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                            }
                        }
                    },
                    mouseDragEnter: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        nodeOutline.fill = nodeOutlineMouseDragEnterClr;
                        nodeOutline.stroke = nodeOutlineMouseDragEnterClr;
                        let selectedNodeOutline = e.diagram.selection.first().findObject("NODE-OUTLINE");
                        if (selectedNodeOutline) {
                            selectedNodeOutline.fill = selectedNodeDragEnterColor;
                        }
                    },
                    mouseDragLeave: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline) {
                            nodeOutline.stroke = nodeOutlineDefaultColorTransparent;
                            nodeOutline.fill = nodeFillDefaultClr;
                        }
                        let selectedNodeOutline = e.diagram.selection.first().findObject("NODE-OUTLINE");
                        if (selectedNodeOutline) {
                            if (e.diagram.selection.first().data.category === "root") selectedNodeOutline.fill = rootDefaultFillColor;
                            else selectedNodeOutline.fill = selectedNodeDragOutColor;
                        }

                    },
                },
                $$(go.Panel, "Horizontal",
                    $$(go.Panel, "Spot",
                        {
                            margin: new go.Margin(0, 0, 0, 0),
                            alignment: new go.Spot(1, 0, 0, 0),
                            desiredSize: new go.Size(22, 22),
                        },
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                    ),
                    $$(go.Panel, "Vertical",
                        $$(go.Panel, "Auto",
                            $$(go.Shape, 'customShape', {
                                    name: "NODE-OUTLINE",
                                    fill: nodeFillDefaultClr,
                                    stroke: nodeOutlineHoverClr,
                                    strokeWidth: nodeStrokeWidth,
                                    //stretch: go.GraphObject.Horizontal,
                                    // isPanelMain: true,
                                    stretch: go.GraphObject.Fill,
                                    scale: 1,
                                    margin: new go.Margin(0, 0, 0, 0),
                                    minSize: new go.Size(123, 40),
                                    maxSize: new go.Size(400, 140),
                                },
                                new go.Binding("stroke", "isSelected",(value, node) => {
                                    if (value){
                                        return nodeOutlineHoverClr;
                                    } else {
                                        return nodeOutlineDefaultColorTransparent;
                                    }
                                }).ofObject(),
                                new go.Binding("stroke", "isHighlighted", function(h,e) {
                                    return (e.part.isSelected ||  (e.part.isSelected && h)) ? nodeOutlineHoverClr : nodeOutlineDefaultColorTransparent;
                                }).ofObject()
                            ),
                            //with the type icon and no risk icon
                            $$(go.Panel, "Horizontal",
                                {
                                    margin: new go.Margin(0,16, 0, 0),
                                    minSize: new go.Size(60, 40),
                                    maxSize: new go.Size(300, 110),
                                    visible:true,
                                    alignment: go.Spot.Center,
                                    name:"textPanel",

                                },
                                new go.Binding("visible", "entities", (entities, node) =>{
                                    let flag = false;
                                    for(let i = 0; i < entities.length;i++) {
                                        if (entities[i].notificationFlag === true) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if (entities.length > 0 && !flag) return true;
                                    else return false;
                                }),
                                $$(go.Picture,
                                    {
                                        click: self.toggleEntity,
                                        cursor: 'pointer',
                                        name: 'Picture',
                                        desiredSize: new go.Size(32, 32),
                                        margin: new go.Margin(0, 5, 0, 4),
                                        imageStretch: go.GraphObject.Uniform,
                                        source: "/assets/strategical-planning-assets/icons/ic-connection-default.svg",
                                    },
                                    new go.Binding("visible", "entities", (entities, node) =>{
                                        if (entities.length > 0) return true;
                                         else return false;
                                    }),
                                    new go.Binding("source", "entityOpen", (entityOpen,e) => {
                                        if(entityOpen) return "/assets/strategical-planning-assets/icons/ic-connection-open.svg";
                                        else if(e.part.isSelected){
                                            return "/assets/strategical-planning-assets/icons/ic-connections-hover.svg";
                                        }else {
                                            return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                        }
                                    }),
                                    new go.Binding("source", "isSelected",(value, node) => {
                                        if (value){
                                            if (node.source.indexOf('ic-connection-default.svg') >= 0 || node.source.indexOf('ic-connections-hover.svg') >= 0){
                                                return "/assets/strategical-planning-assets/icons/ic-connections-hover.svg";
                                            }
                                            if (node.source.indexOf('ic-connection-default.svg') >= 0) {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                            } else {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-open.svg";
                                            }
                                        } else {
                                            if (node.source.indexOf('ic-connections-hover.svg') >= 0){
                                                return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                            }
                                            if (node.source.indexOf('ic-connection-default.svg') >= 0) {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                            } else {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-open.svg";
                                            }
                                        }
                                    }).ofObject(),
                                ),
                                $$(go.TextBlock,
                                    {
                                        _maxLength: 255,
                                        _maxWidth: 252,
                                        _required: true,
                                        _trim: true,
                                        name: "textType",
                                        alignment: go.Spot.Center,
                                        editable: true,
                                        font: "normal 16px 'Roboto', 'Helvetica Neue', sans-serif",
                                        stroke: "rgba(0, 0, 0, 0.87)",
                                        textAlign: "left",
                                        margin: new go.Margin(8, 0, 5, 0),
                                        minSize: new go.Size(65, 17),
                                        maxSize: new go.Size(252, 110),
                                        isMultiline: false,
                                        maxLines: 1,
                                        overflow: go.TextBlock.OverflowEllipsis,
                                        wrap: go.TextBlock.WrapFit,
                                    },
                                    // remember not only the text string but the scale and the font in the node data
                                    new go.Binding("text", "text").makeTwoWay(),
                                    new go.Binding("scale", "scale").makeTwoWay(),
                                    new go.Binding("font", "font").makeTwoWay()//,
                                ),
                            ),
                            //with the type icon and with the risk icon
                            $$(go.Panel, "Table",
                                {
                                    margin: new go.Margin(0,10, 0, 0),
                                    minSize: new go.Size(60, 40),
                                    maxSize: new go.Size(300, 110),
                                    visible:true,
                                    alignment: go.Spot.Center,
                                    name:"textPanel",
                                },
                                $$(go.RowColumnDefinition, { column: 0, width: 41 }),
                                $$(go.RowColumnDefinition, { column: 1,  maximum: 233 }),
                                $$(go.RowColumnDefinition, { column: 2, width: 24}),
                                new go.Binding("visible", "entities", (entities, node) =>{
                                    let flag = false;
                                    for(let i = 0; i < entities.length;i++) {
                                        if (entities[i].notificationFlag === true) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if (entities.length > 0 && flag) return true;
                                    else return false;
                                }),
                                $$(go.Picture,
                                    {
                                        click: self.toggleEntity,
                                        cursor: 'pointer',
                                        name: 'Picture1',
                                        desiredSize: new go.Size(32, 32),
                                        margin: new go.Margin(0, 5, 0, 4),
                                        imageStretch: go.GraphObject.Uniform,
                                        source: "/assets/strategical-planning-assets/icons/ic-connection-default.svg",
                                        row: 0, column: 0,
                                    },

                                    new go.Binding("source", "entityOpen", (entityOpen,e) => {
                                        if(entityOpen) return "/assets/strategical-planning-assets/icons/ic-connection-open.svg";
                                        else if(e.part.isSelected){
                                            return "/assets/strategical-planning-assets/icons/ic-connections-hover.svg";
                                        }else {
                                            return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                        }
                                    }),
                                    new go.Binding("visible", "entities", (entities, node) =>{
                                        if (entities.length > 0) return true;
                                        else return false;
                                    }),
                                    new go.Binding("source", "isSelected",(value, node) => {
                                        if (value){
                                            if (node.source.indexOf('ic-connection-default.svg') >= 0 || node.source.indexOf('ic-connections-hover.svg') >= 0){
                                                return "/assets/strategical-planning-assets/icons/ic-connections-hover.svg";
                                            }
                                            if (node.source.indexOf('ic-connection-default.svg') >= 0) {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                            } else {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-open.svg";
                                            }
                                        } else {
                                            if (node.source.indexOf('ic-connections-hover.svg') >= 0){
                                                return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                            }
                                            if (node.source.indexOf('ic-connection-default.svg') >= 0) {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-default.svg";
                                            } else {
                                                return "/assets/strategical-planning-assets/icons/ic-connection-open.svg";
                                            }
                                        }
                                    }).ofObject(),
                                ),
                                $$(go.TextBlock,
                                    {
                                        _maxLength: 255,
                                        _maxWidth: 233,
                                        _required: true,
                                        _trim: true,
                                        name: "textTypeRisk",
                                        alignment: go.Spot.LeftCenter,
                                        editable: true,
                                        font: "normal 16px 'Roboto', 'Helvetica Neue', sans-serif",
                                        stroke: "rgba(0, 0, 0, 0.87)",
                                        textAlign: "left",
                                        margin: new go.Margin(8, 0, 8, 0),
                                        minSize: new go.Size(45, 17),
                                        maxSize: new go.Size(233, 110),
                                        isMultiline: false,
                                        maxLines: 1,
                                        overflow: go.TextBlock.OverflowEllipsis,
                                        wrap: go.TextBlock.WrapFit,
                                        row: 0, column: 1,
                                    },
                                    // remember not only the text string but the scale and the font in the node data
                                    new go.Binding("text", "text").makeTwoWay(),
                                    new go.Binding("scale", "scale").makeTwoWay(),
                                    new go.Binding("font", "font").makeTwoWay(),
                                ),
                                $$(go.Picture,
                                    {
                                        name: 'Risk',
                                        desiredSize: new go.Size(16, 16),
                                        margin: new go.Margin(0, 0, 0, 8),
                                        imageStretch: go.GraphObject.Uniform,
                                        source: "/assets/strategical-planning-assets/icons/entity-risk.svg",
                                        alignment: go.Spot.RightCenter,
                                        row: 0, column: 2,
                                    },
                                ),
                            ),
                            //no icons
                            $$(go.Panel, "Table",
                                {
                                    margin: new go.Margin(0,0, 0, 0),
                                    minSize: new go.Size(60, 40),
                                    maxSize: new go.Size(340, 110),
                                    visible:true,
                                    alignment: go.Spot.Center,
                                },
                                $$(go.RowColumnDefinition, { column: 0, width: 16 }),
                                $$(go.RowColumnDefinition, { column: 1,  maximum: 275, alignment: go.Spot.Center }),
                                $$(go.RowColumnDefinition, { column: 2, width: 16}),
                                new go.Binding("visible", "entities", (entities, node) =>{
                                    if (entities.length > 0) return false;
                                    else return true;
                                }),
                                $$(go.Picture,
                                    {
                                        desiredSize: new go.Size(16, 16),
                                        margin: new go.Margin(0, 0, 0, 0),
                                        source: "",
                                        alignment: go.Spot.Center,
                                        row: 0, column: 0,
                                    },
                                ),
                                $$(go.TextBlock,
                                    {
                                        _maxLength: 255,
                                        _maxWidth: 275,
                                        _required: true,
                                        _trim: true,
                                        name: "TEXT",
                                        alignment: go.Spot.Center,
                                        editable: true,
                                        font: "normal 16px 'Roboto', 'Helvetica Neue', sans-serif",
                                        stroke: "rgba(0, 0, 0, 0.87)",
                                        textAlign: "center",
                                        margin: new go.Margin(8, 0, 8, 0),
                                        minSize: new go.Size(60, 17),
                                        maxSize: new go.Size(275, 110),
                                        isMultiline: false,
                                        maxLines: 1,
                                        overflow: go.TextBlock.OverflowEllipsis,
                                        wrap: go.TextBlock.WrapFit,
                                        row: 0, column: 1,
                                    },
                                    new go.Binding("text", "text").makeTwoWay(),
                                    new go.Binding("scale", "scale").makeTwoWay(),
                                    new go.Binding("font", "font").makeTwoWay(),
                                    new go.Binding("text", "text", function (text,node) {
                                        if (node) {
                                            if (text.length > 65) {
                                                node.setProperties({
                                                    alignment: go.Spot.Left,
                                                    textAlign: "left",
                                                });
                                            } else {
                                                node.setProperties({
                                                    alignment: go.Spot.Center,
                                                    textAlign: "center",
                                                });
                                            }
                                        }
                                        return text;
                                    }),
                                ),
                                $$(go.Picture,
                                    {
                                        desiredSize: new go.Size(16, 16),
                                        margin: new go.Margin(0, 0, 0, 8),
                                        source: "",
                                        alignment: go.Spot.Center,
                                        row: 0, column: 2,
                                    },
                                ),
                            ),
                        ),

                        $$(go.Shape, "Rectangle",
                            {
                                name:"NODE-LINE",
                                height: 2,
                                stretch: go.GraphObject.Horizontal,
                                strokeWidth: 0,
                                stroke: treeExpanderShapeStrokeColor,
                                fill: treeExpanderShapeStrokeColor,
                                portId: "",
                                fromSpot: go.Spot.LeftRightSides,
                                toSpot: go.Spot.LeftRightSides,
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(125, 2),
                                alignment: go.Spot.Bottom,
                                maxSize: new go.Size(400, 2),
                            },
                            new go.Binding("fromSpot", "dir", function (d,node) { return spotConverter(d, true,node); }),
                            new go.Binding("toSpot", "dir", function (d,node) { return spotConverter(d, false,node); }),
                            new go.Binding("fill", "isHighlighted", function(h,e) {
                                return h ? nodeOutlineHoverClr : treeExpanderShapeStrokeColor; }).ofObject()
                        ),
                    ),
                    // the expander right side button
                    $$(go.Panel, "Spot",
                        {
                            margin: new go.Margin(0, 0, 0, 0),
                            alignment: new go.Spot(1, 1, 0, 0),
                            desiredSize: new go.Size(22, 22),
                        },
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                    ),
                ),
                // the expander right side button
                $$(go.Panel, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 0),
                        alignment: new go.Spot(1, 0, 0, -12),
                        desiredSize: new go.Size(22, 22),
                    },
                    $$("PositionsTreeExpanderGoals",
                        {
                            isActionable: true,
                            alignment: go.Spot.Bottom,
                            margin: new go.Margin(0, 0, 0, 0),
                            desiredSize: new go.Size(22, 22),
                            mouseEnter: function (e, node) {
                                e.handled = true;
                            }
                        },
                    ),
                    $$(go.Shape, "Rectangle",//fix gojs info message in the console
                        {
                            name:"temp",
                            strokeWidth: 0,
                            stroke: 'transparent',
                            fill: 'transparent',
                            margin: new go.Margin(0, 0, 0, 0),
                            minSize: new go.Size(1, 1),
                            maxSize: new go.Size(1, 1),
                        },
                    ),
                    new go.Binding("visible", "dir", function (dir) {
                        if (dir === "right") return true;
                        else return false;
                    }),
                ),
                // the expander Left side button
                $$(go.Panel, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 0),
                        alignment: new go.Spot(0, 0, 0, -12),

                        desiredSize: new go.Size(22, 22),
                    },
                    $$("PositionsTreeExpanderGoals",
                        {
                            isActionable: true,
                            alignment: go.Spot.Bottom,
                            margin: new go.Margin(0, 0, 0, 0),
                            desiredSize: new go.Size(22, 22),
                            mouseEnter: function (e, node) {
                                e.handled = true;
                            }
                        },
                    ),
                    $$(go.Shape, "Rectangle",//fix gojs info message in the console
                        {
                            name:"temp",
                            strokeWidth: 0,
                            stroke: 'transparent',
                            fill: 'transparent',
                            margin: new go.Margin(0, 0, 0, 0),
                            minSize: new go.Size(1, 1),
                            maxSize: new go.Size(1, 1),
                        },
                    ),
                    new go.Binding("visible", "dir", function (dir) {
                        if (dir === "left") return true;
                        else return false;
                    }),
                ),
                // new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                // make sure text "grows" in the desired direction
                new go.Binding("locationSpot", "dir", function (d,node) { return spotConverter(d, false,node); }),
                new go.Binding('zOrder', 'isSelected', function (value, e) {
                    if(value && e.diagram.selection.count === 1) {
                        showConnections(e);
                    } else {
                        e.diagram.clearHighlighteds();
                    }
                    return value ? 17 : 15;
                }).ofObject(),
            );
        },
        makeEntity: function (events) {
            return $$(go.Node, "Vertical",
                {
                    minSize: new go.Size(123, 40),
                    margin: new go.Margin(0, 0, 0, 0),
                    zOrder: 15,
                    selectionObjectName: "NODE-OUTLINE",
                    visible:true,
                },
                $$(go.Shape, 'customShape', {
                        name: "NODE-OUTLINE",
                        fill: linkDefaultFillColor,
                        stroke: "rgb(63,81,181)",
                        strokeWidth: nodeStrokeWidth,
                        stretch: go.GraphObject.Fill,
                        scale: 1,
                        margin: new go.Margin(0, 0, 0, 0),
                        minSize: new go.Size(123, 40),
                        maxSize: new go.Size(400, 40),
                    },
                    new go.Binding("stroke", "isSelected",(value, node) => {
                        if (value){
                            return nodeOutlineHoverClr
                        } else {
                            return nodeOutlineDefaultColorTransparent;
                        }
                    }).ofObject(),
                    new go.Binding("stroke", "isHighlighted", function(h,e) {
                        return (e.part.isSelected ||  (e.part.isSelected && h)) ? nodeOutlineHoverClr : nodeOutlineDefaultColorTransparent;
                    }).ofObject()
                ),

                $$(go.Panel, "Horizontal",{
                        margin: new go.Margin(-40,0, 0, 0),
                        minSize: new go.Size(123, 40),

                    },
                    $$(go.Picture,
                        {
                            name: 'Picture',
                            desiredSize: new go.Size(32, 32),
                            margin: new go.Margin(0, 8, 0, 4),
                            imageStretch: go.GraphObject.Uniform,
                            scale: 1,
                            visible:true,
                            // Simple hover over the node
                            mouseEnter: function (e, node) {
                                e.handled = true;
                                let hoverEntity = node.part.findObject("hoverEntity");
                                if (hoverEntity) {
                                    hoverEntity.visible = true;
                                }
                            },
                            mouseLeave: function (e, node) {
                                e.handled = true;
                                let hoverEntity = node.part.findObject("hoverEntity");
                                if (hoverEntity) {
                                    hoverEntity.visible = false;
                                }
                            },
                        },
                        new go.Binding("source", "entityType", getEntityIcon),

                    ),
                    $$(go.TextBlock,
                        {
                            _maxLength: 255,
                            _maxWidth: 300,
                            _required: true,
                            _trim: true,
                            name: "TEXT",
                            alignment: go.Spot.Left,
                            editable: false,
                            font: "normal 16px 'Roboto', 'Helvetica Neue', sans-serif",
                            stroke: "rgba(0, 0, 0, 0.87)",
                            textAlign: "left",
                            margin: new go.Margin(0, 16, 0, 0),
                            minSize: new go.Size(40, 17),
                            maxSize: new go.Size(330, 17),
                            isMultiline: false,
                            maxLines: 1,
                            overflow: go.TextBlock.OverflowEllipsis,
                            wrap: go.TextBlock.WrapFit,
                        },
                        new go.Binding("text", "text").makeTwoWay(),
                        new go.Binding("scale", "scale").makeTwoWay(),
                        new go.Binding("font", "font").makeTwoWay()//,
                    ),
                    $$(go.Picture,
                        {
                            name: 'Risk',
                            desiredSize: new go.Size(16, 16),
                            margin: new go.Margin(0, 10, 0, -8),
                            imageStretch: go.GraphObject.Uniform,
                            source: "/assets/strategical-planning-assets/icons/entity-risk.svg",
                            alignment: go.Spot.RightCenter,
                        },
                        new go.Binding("visible", "notificationFlag", (notificationFlag, obj) =>{
                            if (notificationFlag === true) return true;
                            else return false;
                        }),
                    ),
                ),
                $$(go.Shape, "Rectangle",
                    {
                        name:"NODE-LINE",
                        height: 2,
                        stretch: go.GraphObject.Horizontal,
                        strokeWidth: 0,
                        stroke: treeExpanderShapeStrokeColor,
                        fill: treeExpanderShapeStrokeColor,
                        portId: "",
                        fromSpot: go.Spot.LeftRightSides,
                        toSpot: go.Spot.LeftRightSides,
                        margin: new go.Margin(0, 0, 0, 0),
                        minSize: new go.Size(125, 2),
                        alignment: go.Spot.Bottom,
                        maxSize: new go.Size(400, 2),
                    },
                    new go.Binding("fromSpot", "dir", function (d,node) { return spotConverter(d, true,node); }),
                    new go.Binding("toSpot", "dir", function (d,node) { return spotConverter(d, false,node); }),
                    new go.Binding("fill", "isHighlighted", function(h,e) {return h ? nodeOutlineHoverClr : treeExpanderShapeStrokeColor; }).ofObject()
                ),

                $$("TreeExpanderButton",
                    {
                        margin: new go.Margin(-4, 0, 0, 0),
                        alignment: go.Spot.BottomCenter
                    },
                    { visible: false }
                ),
                $$(go.Panel, "Vertical",{//do invisiple space for bottom panel
                        margin: new go.Margin(-2,0, 0, 0),
                        minSize: new go.Size(48, 22),
                        visible:true,
                        alignment: go.Spot.Left,
                    },
                ),
                $$(go.Panel, "Vertical",{ //hoverEntity panel - by entity type- when node is hover the panel show-hide
                        margin: new go.Margin(-22,0, 0, 0),
                        minSize: new go.Size(48, 22),
                        visible:false,
                        name:"hoverEntity",
                        alignment: go.Spot.Left,
                    },
                    $$(go.Shape, 'Rectangle', {
                            name: "Rectangle",
                            fill: "rgba(97, 97, 97, 0.9)",
                            stroke: "rgb(63,81,181)",
                            strokeWidth: 0,
                            stretch: go.GraphObject.Fill,
                            margin: new go.Margin(0, 0, 0, 0),
                            minSize: new go.Size(48, 22),
                            maxSize: new go.Size(108, 22),
                        },
                    ),
                    $$(go.TextBlock,
                        {
                            name: "entityText",
                            alignment: go.Spot.Center,
                            editable: false,
                            font: "normal 10px 'Roboto', 'Helvetica Neue', sans-serif",
                            stroke: rootDefaultFillColor,
                            textAlign: "center",
                            margin: new go.Margin(-16, 0, 0, 0),
                            minSize: new go.Size(48, 15),
                            // maxSize: new go.Size(330, 15),
                            isMultiline: false,
                            maxLines: 1,
                            overflow: go.TextBlock.OverflowEllipsis,
                            wrap: go.TextBlock.WrapFit,
                        },
                        // remember not only the text string but the scale and the font in the node data
                        new go.Binding("text", "entityType",(entityType) => {
                            return entityType;
                        }),
                        new go.Binding("scale", "scale").makeTwoWay(),
                        new go.Binding("font", "font").makeTwoWay()//,
                    ),


                ),

                // remember the locations of each node in the node data
                // new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                    // make sure text "grows" in the desired direction
                new go.Binding("locationSpot", "dir", function (d,node) { return spotConverter(d, false,node); }),
                new go.Binding('zOrder', 'isSelected', function (value, e) {
                    if(value && e.diagram.selection.count === 1) {
                        showConnections(e);
                    } else {
                        e.diagram.clearHighlighteds();
                    }
                    return value ? 17 : 15;
                }).ofObject(),
                new go.Binding("visible", "visible", (visible,node) => {
                    return visible;
                }),
            );
        },
        makePrivate: function (events) {
            return $$(go.Node, "Vertical",
                {
                    minSize: new go.Size(123, 40),
                    margin: new go.Margin(0, 0, 0, 0),
                    maxSize:new go.Size(452, 144),
                    zOrder: 15,
                    selectionObjectName: "NODE-OUTLINE",
                },
                {
                    // Simple hover over the node
                    mouseEnter: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline) {
                            nodeOutline.stroke = nodeOutlineHoverClr;
                        }
                        let nodePicture = node.findObject("Picture");
                        if (nodePicture) {
                            if (nodePicture.source.indexOf('private.svg') >= 0){
                                nodePicture.source = "/assets/strategical-planning-assets/icons/private-hover.svg";
                            }
                        }
                    },
                    mouseLeave: function (e, node) {
                        e.handled = true;
                        let nodeOutline = node.findObject("NODE-OUTLINE");
                        if (nodeOutline && !node.isSelected) {
                            // restore original colors
                            nodeOutline.stroke = nodeOutlineDefaultColorTransparent;
                        }
                        let nodePicture = node.findObject("Picture");
                        if (nodePicture && !node.isSelected) {
                            if (nodePicture.source.indexOf('private-hover.svg') >= 0){
                                nodePicture.source = "/assets/strategical-planning-assets/icons/private.svg";
                            }
                        }
                    },
                },
                $$(go.Panel, "Horizontal",
                    $$(go.Panel, "Spot",
                        {
                            margin: new go.Margin(0, 0, 0, 0),
                            alignment: new go.Spot(1, 0, 0, 0),
                            desiredSize: new go.Size(22, 22),
                        },
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                    ),
                    $$(go.Panel, "Vertical",
                        $$(go.Panel, "Auto",
                            $$(go.Shape, 'customShape', {
                                    name: "NODE-OUTLINE",
                                    fill: nodeFillDefaultClr,
                                    stroke: "rgb(63,81,181)",
                                    strokeWidth: nodeStrokeWidth,
                                    //stretch: go.GraphObject.Horizontal,
                                    // isPanelMain: true,
                                    stretch: go.GraphObject.Fill,
                                    scale: 1,
                                    margin: new go.Margin(0, 0, 0, 0),
                                    minSize: new go.Size(123, 40),
                                    maxSize: new go.Size(400, 140),
                                },
                                new go.Binding("stroke", "isSelected",(value, node) => {
                                    if (value){
                                        return nodeOutlineHoverClr;
                                    } else {
                                        return nodeOutlineDefaultColorTransparent;
                                    }
                                }).ofObject(),
                                new go.Binding("stroke", "isHighlighted", function(h,e) {
                                    return (e.part.isSelected ||  (e.part.isSelected && h)) ? nodeOutlineHoverClr : nodeOutlineDefaultColorTransparent;
                                }).ofObject()
                            ),

                            $$(go.Panel, "Horizontal",
                                {
                                    margin: new go.Margin(0,16, 0, 0),
                                    minSize: new go.Size(60, 40),
                                    maxSize: new go.Size(300, 110),
                                    visible:true,
                                    alignment: go.Spot.Center,
                                },
                                $$(go.Picture,
                                    {
                                        name: 'Picture',
                                        desiredSize: new go.Size(32, 32),
                                        margin: new go.Margin(0, 0, 0, 0),
                                        imageStretch: go.GraphObject.Uniform,
                                        source: "/assets/strategical-planning-assets/icons/private.svg",
                                        alignment: go.Spot.Left,
                                    },
                                    new go.Binding("source", "isSelected",(value, node) => {
                                        if (value){
                                            if (node.source.indexOf('private.svg') >= 0 || node.source.indexOf('private-hover.svg') >= 0){
                                                return "/assets/strategical-planning-assets/icons/private-hover.svg";
                                            }
                                            if (node.source.indexOf('private.svg') >= 0) {
                                                return "/assets/strategical-planning-assets/icons/private.svg";
                                            }
                                        } else {
                                            if (node.source.indexOf('private-hover.svg') >= 0){
                                                return "/assets/strategical-planning-assets/icons/private.svg";
                                            }
                                            if (node.source.indexOf('private.svg') >= 0) {
                                                return "/assets/strategical-planning-assets/icons/private.svg";
                                            }
                                        }
                                    }).ofObject(),
                                ),
                                $$(go.TextBlock,
                                    {
                                        _maxLength: 255,
                                        _maxWidth: 252,
                                        _required: true,
                                        _trim: true,
                                        name: "TEXT",
                                        alignment: go.Spot.Left,
                                        editable: false,
                                        font: "normal 16px 'Roboto', 'Helvetica Neue', sans-serif",
                                        stroke: "rgba(0, 0, 0, 0.87)",
                                        textAlign: "left",
                                        margin: new go.Margin(3, 0, 0, 0),
                                        minSize: new go.Size(65, 17),
                                        maxSize: new go.Size(252, 110),
                                        isMultiline: false,
                                        maxLines: 1,
                                        overflow: go.TextBlock.OverflowEllipsis,
                                        wrap: go.TextBlock.WrapFit,
                                    },
                                    // remember not only the text string but the scale and the font in the node data
                                    new go.Binding("text", "text").makeTwoWay(),
                                    new go.Binding("scale", "scale").makeTwoWay(),
                                    new go.Binding("font", "font").makeTwoWay()//,
                                ),
                            ),
                        ),

                        $$(go.Shape, "Rectangle",
                            {
                                name:"NODE-LINE",
                                height: 2,
                                stretch: go.GraphObject.Horizontal,
                                strokeWidth: 0,
                                stroke: treeExpanderShapeStrokeColor,
                                fill: treeExpanderShapeStrokeColor,
                                // this line shape is the port -- what links connect with
                                portId: "",
                                fromSpot: go.Spot.LeftRightSides,
                                toSpot: go.Spot.LeftRightSides,
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(125, 2),
                                alignment: go.Spot.Bottom,
                                maxSize: new go.Size(400, 2),
                            },
                            new go.Binding("fromSpot", "dir", function (d,node) { return spotConverter(d, true,node); }),
                            new go.Binding("toSpot", "dir", function (d,node) { return spotConverter(d, false,node); }),
                            new go.Binding("fill", "isHighlighted", function(h,e) {return h ? nodeOutlineHoverClr : treeExpanderShapeStrokeColor; }).ofObject()
                        ),
                    ),
                    // the expander right side button
                    $$(go.Panel, "Spot",
                        {
                            margin: new go.Margin(0, 0, 0, 0),
                            alignment: new go.Spot(1, 1, 0, 0),
                            desiredSize: new go.Size(22, 22),
                        },
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                        $$(go.Shape, "Rectangle",//fix gojs info message in the console
                            {
                                name:"temp",
                                strokeWidth: 0,
                                stroke: 'transparent',
                                fill: 'transparent',
                                margin: new go.Margin(0, 0, 0, 0),
                                minSize: new go.Size(1, 1),
                                maxSize: new go.Size(1, 1),
                            },
                        ),
                    ),
                ),
                // the expander right side button
                $$(go.Panel, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 0),
                        alignment: new go.Spot(1, 0, 0, -12),
                        desiredSize: new go.Size(22, 22),
                    },
                    $$("PositionsTreeExpanderGoals",
                        {
                            isActionable: true,
                            alignment: go.Spot.Bottom,
                            margin: new go.Margin(0, 0, 0, 0),
                            desiredSize: new go.Size(22, 22),
                            mouseEnter: function (e, node) {
                                e.handled = true;
                            }
                        },
                    ),
                    $$(go.Shape, "Rectangle",//fix gojs info message in the console
                        {
                            name:"temp",
                            strokeWidth: 0,
                            stroke: 'transparent',
                            fill: 'transparent',
                            margin: new go.Margin(0, 0, 0, 0),
                            minSize: new go.Size(1, 1),
                            maxSize: new go.Size(1, 1),
                        },
                    ),
                    new go.Binding("visible", "dir", function (dir) {
                        if (dir === "right") return true;
                        else return false;
                    }),
                ),
                // the expander Left side button
                $$(go.Panel, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 0),
                        alignment: new go.Spot(0, 0, 0, -12),

                        desiredSize: new go.Size(22, 22),
                    },
                    $$("PositionsTreeExpanderGoals",
                        {
                            isActionable: true,
                            alignment: go.Spot.Bottom,
                            margin: new go.Margin(0, 0, 0, 0),
                            desiredSize: new go.Size(22, 22),
                            mouseEnter: function (e, node) {
                                e.handled = true;
                            }
                        },
                    ),
                    $$(go.Shape, "Rectangle",//fix gojs info message in the console
                        {
                            name:"temp",
                            strokeWidth: 0,
                            stroke: 'transparent',
                            fill: 'transparent',
                            margin: new go.Margin(0, 0, 0, 0),
                            minSize: new go.Size(1, 1),
                            maxSize: new go.Size(1, 1),
                        },
                    ),
                    new go.Binding("visible", "dir", function (dir) {
                        if (dir === "left") return true;
                        else return false;
                    }),
                ),
                // new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                // make sure text "grows" in the desired direction
                new go.Binding("locationSpot", "dir", function (d,node) { return spotConverter(d, false,node); }),
                new go.Binding('zOrder', 'isSelected', function (value, e) {
                    if(value && e.diagram.selection.count === 1) {
                        showConnections(e);
                    } else {
                        e.diagram.clearHighlighteds();
                    }
                    return value ? 17 : 15;
                }).ofObject(),
            );
        },
        makeLink: function () {
            return $$(go.Link,
            {
                curve: go.Link.Bezier,
                toEndSegmentLength: 30, fromEndSegmentLength: 30,
                selectable: false,
                adjusting: go.Link.Stretch,
                zOrder:10
            },
            new go.Binding("zOrder", "isHighlighted", function (val,node) {
                return (val) ? 11 : 10;
            }).ofObject(),
            $$(go.Shape,
                {
                    strokeWidth: nodeStrokeWidth,
                    angle: 0,
                    stroke: treeExpanderShapeStrokeColor
                },
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? nodeOutlineHoverClr : treeExpanderShapeStrokeColor; }).ofObject()
            )
            );
        }
    }
}
export default spGoalplanningTemplates;
