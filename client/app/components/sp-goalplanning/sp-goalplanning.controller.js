'use strict';

function SPGoalplanningController( $scope, spGoalplanningModel, $mdDialog, spGoalplanningConfig, spGoalplanningTemplates, spSnackbar, spGojsToolbar,spGoalplanningState,spGoalplanningTextEditor) {
    'ngInject';
    let goaldiagram;
    let ctrl = this;
    let $$ = go.GraphObject.make;
    let rootNodeId = "0";
    this.loading = true;
    let ie11 = false;
    if (navigator.userAgent.indexOf("Trident") !== -1) ie11 = true;
    let topVal = 0;
    let chrome = false;
    if(navigator.userAgent.indexOf("Chrome") !== -1) chrome = true;
    let nodeOutlineDefaultClr = "#ccc7d3";
    let deletedArray = [];
    let entityDeletedArray = [];


    ctrl.$onChanges = function (changesObj) {
        if ('spNodes' in changesObj) {
            let nodes = changesObj.spNodes.currentValue;
            if (nodes) {
                if (nodes && nodes.length > 0) {
                    this.loading = false;
                    goaldiagram.model = new go.TreeModel(nodes);
                    rootNodeId = goaldiagram.nodes.first().findTreeRoot().data.nodeid;
                    goaldiagram.nodes.each(function (node) { //link to root the nodes who lost the parent
                        if (!node.findTreeParentNode() && node.data.category !== "root") {
                            goaldiagram.model.setDataProperty(node.data, "parent", rootNodeId);
                            spGoalplanningModel.updateNode(node.data.nodeid,node.data);
                        }
                    });
                    layoutTree();
                    let selectedGoalId = this.spSelected;
                    if (selectedGoalId) {
                        this.selectGoal(selectedGoalId);
                    } else {
                        spGoalplanningState.loadState(goaldiagram);
                    }
                    spGoalplanningState.setStateHandlers(goaldiagram);
                }
            }
        }
        if('spEntityAdded' in changesObj){
            let entity = changesObj.spEntityAdded.currentValue;
            if(entity) {
                let node = goaldiagram.selection.first().data;
                addEntity(entity,node);
                layoutTree();
                spGoalplanningModel.updateNode(node.nodeid, node);
                spGoalplanningModel.updateEntityGoalMatched(entity,node.nodeid,'add');
            }
        }

        if('spEntityRemoved' in changesObj){
            let entity = changesObj.spEntityRemoved.currentValue;
            if(entity) {
                removeEntity(entity);
                layoutTree();
                let node = goaldiagram.selection.first().data;
                spGoalplanningModel.updateNode(node.nodeid, node);
                spGoalplanningModel.updateEntityGoalMatched(entity,node.nodeid,'delete');
            }
        }
        if('spEntityPositionsAdded' in changesObj){
            let positions = changesObj.spEntityPositionsAdded.currentValue;
            if(positions) {
                let selNode = goaldiagram.selection.first();
                let parentNode = goaldiagram.findNodeForKey(selNode.data.parent);
                let entityArrayKey,entityId;
                parentNode.data.entities.forEach((parentEntity,indexEntity) => { //finding entity key into enities array
                    if (selNode.data.entityId === parentEntity.entityId) {
                        entityArrayKey = indexEntity;
                        entityId = parentEntity.entityId;
                    }
                });
                let parentEntity = parentNode.data.entities[entityArrayKey];
                positions.forEach((position) => {
                    let posIndex  ;
                    if(parentEntity.positions && parentEntity.positions.length > 0){
                        parentEntity.positions.forEach((parentPosition,index) => {
                            if (parentPosition.nodeId === position.nodeId){
                                posIndex = index;
                            }
                        });
                    }
                    if(posIndex === undefined) {
                        parentNode.data.entities[entityArrayKey].positions.push(position);
                    }

                });
                spGoalplanningModel.updateNode(parentNode.data.nodeid,parentNode.data);
                spGoalplanningModel.updateEntityPositions(positions,entityId,'add');
            }
        }

        if('spEntityPositionsRemoved' in changesObj){
            let positionId = changesObj.spEntityPositionsRemoved.currentValue;
            if (positionId){
                let selNode = goaldiagram.selection.first();
                let parentNode = goaldiagram.findNodeForKey(selNode.data.parent);
                let entityArrayKey,entityId;
                parentNode.data.entities.forEach((parentEntity,indexEntity) => { //finding entity key into enities array
                    if (selNode.data.entityId === parentEntity.entityId) {
                        entityArrayKey = indexEntity;
                        entityId = parentEntity.entityId;
                    }
                });
                spGoalplanningModel.updateEntityPositions([{nodeId:positionId}],entityId,'delete');
            }
        }

        if ('spSelected' in changesObj) {
            if (!this.spNodes || !this.spNodes.length) return;
            let selectedGoalId = changesObj.spSelected.currentValue;
            if (selectedGoalId) {
                this.selectGoal(selectedGoalId);
            }
        }
    };

    function addEntity(entities,nodeData) {
        entities.forEach(function (entity, index, array) {
            if (goaldiagram.findNodeForKey(entity.entityId + nodeData.nodeid) !== null){}
            else {
                goaldiagram.startTransaction("Add Node");
                let newdata = {};
                newdata.nodeid = newdata.key = entity.entityId + nodeData.nodeid;
                newdata.entityId = entity.entityId;
                newdata.text = newdata.entityName = entity.entityName;
                newdata.dir = ((nodeData.dir) ? nodeData.dir : "right");
                newdata.parent = nodeData.key;
                newdata.category = 'entity';
                newdata.entityParentId = entity.entityParentId;
                newdata.entityOwnerId = entity.entityOwnerId;
                newdata.entityType = entity.entityType;
                newdata.url = entity.url;
                newdata.notificationFlag = entity.notificationFlag;
                newdata.removed = false;
                newdata.visible = nodeData.entityOpen;
                newdata.countSubObjects = entity.countSubObjects;
                newdata.positions = entity.positions;
                newdata.notifications = entity.notifications;
                newdata.comments = entity.comments;
                goaldiagram.model.addNodeData(newdata);
                goaldiagram.commitTransaction("Add Node");
            }
        });
        let nodeEntity = nodeData.entities;
        goaldiagram.startTransaction("Updated Node entities");
        goaldiagram.model.setDataProperty(nodeData, "entities", '');
        goaldiagram.model.setDataProperty(nodeData, "entities", nodeEntity);
        goaldiagram.commitTransaction("Updated Node entities");

        goaldiagram.clearSelection();
        let node = goaldiagram.findNodeForKey(nodeData.key);
        node.isSelected = true;
        ctrl.onSelectedNodeData({selectedNodeData: node.data});
        ctrl.avoidSidebar(node);
        ctrl.onRightSidebarInit ({rightSidebarToggle:true});
    }

    function removeEntity(entity){
        let parentNode = goaldiagram.selection.first();
        let node = goaldiagram.findNodeForKey(entity.entityId + parentNode.data.nodeid);
        goaldiagram.clearSelection();
        node.isSelected = true;
        goaldiagram.commandHandler.deleteSelection();
        goaldiagram.startTransaction("Updated Node entity");
        let nodeEntity = parentNode.data.entities;
        goaldiagram.model.setDataProperty(parentNode.data, "entities", '');
        goaldiagram.model.setDataProperty(parentNode.data, "entities", nodeEntity );
        goaldiagram.commitTransaction("Updated Node entity");

        parentNode.isSelected = true;
        ctrl.onSelectedNodeData({selectedNodeData: parentNode.data});
        ctrl.avoidSidebar(parentNode);
        ctrl.onRightSidebarInit ({rightSidebarToggle:true});

    }
    
    goaldiagram = $$(go.Diagram, "spGoalplanning", spGoalplanningConfig.diagramConfig());
    ctrl.onGoaldiagramInit({goaldiagram: goaldiagram});

    function showConnections(node) {
        if (node) {
            goaldiagram.startTransaction("highlight");
            goaldiagram.clearHighlighteds();
            node.isHighlighted = true;
            node.findTreeParentChain().each(function (l) {
                l.isHighlighted = true;
            });
            goaldiagram.commitTransaction("highlight");
        }
    }

    //change dir for 1 level of nodes. Drop to empty space.
    let dragTool = goaldiagram.toolManager.draggingTool;
    dragTool.doDeactivate = function () {
        let node = goaldiagram.selection.first();
        if (node.data.category !== "root" && node.data.category !== "private" && node.data.parent === "0") {
            let dropDirection = "right";
            if ((node.location.x + node.actualBounds.width) / 2 - go.Point.stringify(goaldiagram.lastInput.documentPoint).split(' ')[0] > 0) dropDirection = 'left';
            else dropDirection = 'right';
            if (dropDirection) {
                spGoalplanningTemplates.updateNodeDirection && spGoalplanningTemplates.updateNodeDirection(node, dropDirection);
            }
        }
        go.DraggingTool.prototype.doDeactivate.call(dragTool);
        showConnections(node);
    };

    //textedit mode start
    let tool = goaldiagram.toolManager.textEditingTool;

    function setTextareaPosition(){
        if (tool.textBlock === null) return;
        let textArea = spGoalplanningTextEditor.getTexarea();
        tool.textBlock.text = textArea.value;
        let loc = tool.textBlock.getDocumentPoint(go.Spot.TopLeft);
        let pos = goaldiagram.position;
        let scale = goaldiagram.scale;

        let maxWidth = parseInt(tool.textBlock._maxWidth);
        let width = tool.textBlock.naturalBounds.width;
        if ( width > maxWidth)  {
            width = maxWidth;
            tool.textBlock.width = maxWidth;
        }

        textArea.style.maxwidth = maxWidth + 'px!important;';
        textArea.style.width = width + 'px';
        textArea.style.height = tool.textBlock.naturalBounds.height + "px";
        textArea.style.left = Math.floor((loc.x - pos.x - 1) * scale) + 'px';
        textArea.style.top = Math.floor((loc.y - pos.y + topVal) * scale) + 'px';
    }

    spGoalplanningTextEditor.setTextEditor(goaldiagram);
    spGoalplanningTextEditor.getTexarea().addEventListener('input', function(e) {
        spGoalplanningTemplates.updateNodeDirection();
        if(ie11){
            setTimeout(function(){
                setTextareaPosition();
            },7);
        }else {
            setTextareaPosition();
        }
    });

    spGoalplanningTextEditor.getTexarea().addEventListener('focus', function(e) {
        spGoalplanningTemplates.updateNodeDirection();
        if(ie11){
            setTimeout(function(){
                setTextareaPosition();
            },7);
        }else {
            setTextareaPosition();
        }
    });


    tool.selectsTextOnActivate = false;
    tool.minimumEditorScale = 0.75;
    tool.doActivate = function () {
        if (tool.diagram.scale < 0.75) {
            tool.diagram.commandHandler.resetZoom();
        }
        let selnode = goaldiagram.selection.first();
        if (selnode){
            let text = selnode.findObject("TEXT");
            if (text) {
                text.setProperties({
                    isMultiline:true,
                    maxLines: 5
                });
            }
            let textType = selnode.findObject("textType");
            if (textType) {
                textType.setProperties({
                    isMultiline:true,
                    maxLines: 5
                });
            }
            let textTypeRisk = selnode.findObject("textTypeRisk");
            if (textTypeRisk) {
                textTypeRisk.setProperties({
                    isMultiline:true,
                    maxLines: 5
                });
            }
        }
        go.TextEditingTool.prototype.doActivate.call(tool);
    };

    tool.doDeactivate = function () { //textedit mode check
        let category = '';
        let selnode = goaldiagram.selection.first();
        let deleted = false;
        if (selnode !== null) {
            if (!tool.textBlock.text.trim()) {
                category = selnode.data.category;
                if (category !== "root") {
                    if ((selnode.findTreeParts().iterator.count === 1 && selnode.data.nodeid.indexOf('unsaved') >= 0) || (goaldiagram.originalString === '' || goaldiagram.originalString === undefined)) {
                        goaldiagram.commandHandler.deleteSelection();
                        deleted = true;
                    }
                    else {
                        tool.textBlock.text = goaldiagram.originalString;
                    }
                }
                else {
                    tool.textBlock.text = goaldiagram.originalString;
                }
            }
            if(!deleted){
                    if (selnode.data.text.trim()){
                    selnode.isSelected = true;
                    if(selnode.data.nodeid) {
                        spGoalplanningModel.updateNode(selnode.data.nodeid, selnode.data).then (function(result){});
                    }
                    if (selnode.data.category !== 'root') {
                        ctrl.avoidSidebar(selnode);
                        ctrl.onRightSidebarInit ({rightSidebarToggle:true});
                    }
                }
            }
        }

        if (selnode){
            let text = selnode.findObject("TEXT");
            if (text) {
                if (selnode.data.text.length > 65) {
                    text.setProperties({
                        alignment: go.Spot.Left,
                        textAlign: "left",
                        isMultiline:false,
                        maxLines: 1
                    });
                } else {
                    text.setProperties({
                        alignment: go.Spot.Center,
                        textAlign: "center",
                        isMultiline:false,
                        maxLines: 1
                    });
                }
            }
            let textType = selnode.findObject("textType");
            if (textType) {
                textType.setProperties({
                    isMultiline:false,
                    maxLines: 1
                });
            }
            let textTypeRisk = selnode.findObject("textTypeRisk");
            if (textTypeRisk) {
                textTypeRisk.setProperties({
                    isMultiline:false,
                    maxLines: 1
                });
            }
        }

        go.TextEditingTool.prototype.doDeactivate.call(tool);
        layoutTree(true);
    };

    //textedit mode end
    spGoalplanningTemplates.updateNodeDirection = function (fnode, dir) {
        if (fnode && dir) {
            let nodesArray = [];
            goaldiagram.startTransaction("Updated Node direction");
            goaldiagram.model.setDataProperty(fnode.data, "dir", dir);
            goaldiagram.commitTransaction("Updated Node direction");
            if (fnode.data.category !== 'entity') {
                nodesArray.push(fnode.data);
            }
            fnode.findTreeParts().each(function (node) {
                if (node instanceof go.Node) {
                    if (node.findTreeChildrenNodes) {
                        node.findTreeChildrenNodes().each(function (childNode) {
                            goaldiagram.startTransaction("Updated Node direction");
                            goaldiagram.model.setDataProperty(childNode.data, "dir", dir);
                            goaldiagram.commitTransaction("Updated Node direction");
                            if (childNode.data.category !== 'entity') {
                                nodesArray.push(childNode.data);
                            }
                        });
                    }
                }
            });
            spGoalplanningModel.updateMultypleNodes(nodesArray);
            setTimeout(() => {
                        layoutTree(true);
                    },0);
        } else{
            if(ie11){//check microsoft ie 11)
                // setTimeout(() => {
                    layoutTree(true);
                // }, 7);

            } else {
                   layoutTree(true);
            }
        }

    };

    let templmap = new go.Map("string", go.Node);
    let rootTemplate = spGoalplanningTemplates.makeRoot();
    rootTemplate.selectionAdornmentTemplate = spGojsToolbar.makeToolbarAdornment({
        margin: 7,
        strokeWidth: 0,
        buttons: [
            {
                id: "addPosition",
                tooltip: "Create Subgoal",
                click: function (e, node) {
                    addNodeAndLink(e, goaldiagram.selection.first());
                }
            }
        ]
    });
    templmap.add("root", rootTemplate);

    let privateTemplate = spGoalplanningTemplates.makePrivate();
    privateTemplate.selectionAdornmentTemplate = $$(go.Adornment);
    templmap.add("private", privateTemplate);

    let childTemplate = spGoalplanningTemplates.makeChild();
    childTemplate.selectionAdornmentTemplate = spGojsToolbar.makeToolbarAdornment({
        margin: 7,
        strokeWidth: 0,
        buttons: [
            {
                id: "addPosition",
                tooltip: "Create Subgoal",
                click: function (e, node) {
                    addNodeAndLink(e, goaldiagram.selection.first());
                }
            },
            {
                id: "addSiblingPosition",
                tooltip: "Create Sibling Goal",
                click: function (e, node) {
                    let parentNode = goaldiagram.selection.first().findTreeParentNode();
                    addNodeAndLink(e, parentNode);
                }
            },
            {
                id: "remove",
                tooltip: "Remove Goal",
                click: function (e, node) {
                    deleteSelection();
                }
            }
        ],
        buttonsMulty: [
            {
                id: "remove",
                tooltip: "Remove Goals",
                click: function (e, node) {
                    deleteSelection();
                }
            }
        ]
    });
    templmap.add("child", childTemplate);

    let entityTemplate = spGoalplanningTemplates.makeEntity();
    entityTemplate.selectionAdornmentTemplate = spGojsToolbar.makeToolbarAdornment({
        margin: 7,
        strokeWidth: 0,
        buttons: [
            {
                id: "remove",
                tooltip: "Remove Entity",
                click: function (e) {
                    deleteSelection();
                }
            }
        ],
        buttonsMulty: [
            {
                id: "remove",
                tooltip: "Remove Goals",
                click: function (e, node) {
                    deleteSelection();
                }
            }
        ]
    });
    templmap.add("entity", entityTemplate);

    goaldiagram.nodeTemplateMap = templmap;
    goaldiagram.linkTemplate = spGoalplanningTemplates.makeLink();

    ctrl.avoidSidebar = function(node) {
        if (!this.spAvoidingRightSidebarWidth) {
            return;
        }
        if (node.data !== null && node.data.category !== "root") {
            let nodeRect = node.actualBounds;
            let width = nodeRect.width;
            if (width > 390) width = 400;
            let nodeRightSideX = nodeRect.x - goaldiagram.position.x + width;
            let diagramWidth = goaldiagram.viewportBounds.width;
            let sidebarWidth = this.spAvoidingRightSidebarWidth / goaldiagram.scale;
            let offset = nodeRightSideX - (diagramWidth - sidebarWidth);
            if (offset > 0) {
                goaldiagram.position = new go.Point(goaldiagram.position.x + offset, goaldiagram.position.y);
            }
        }
    };

    goaldiagram.commandHandler.doKeyDown = function () {
        let e = goaldiagram.lastInput;
        let selNode = goaldiagram.selection.first();
        // console.log("doKeyDown",e.key,e);
        if ((e.key === 'Enter' || e.key === 'NumpadEnter') && goaldiagram.selection.count === 1) {
           //  let node = selNode.findTreeParentNode();
           //
           //  if (node === null) {
           //      // Cannot create sibling of root node
           //      return;
           //  }
           // addNodeAndLink(event, node,selNode)
        }
        else if (e.key === 'Tab' && goaldiagram.selection.count === 1) {
            // addNodeAndLink(event, selNode);
        } else if (e.key === 'Del' || e.key === 'Backspace') {

            if (!selNode) {
                return;
            } else {
                if(selNode.data.category !== "root" && selNode.data.category !== "private") deleteSelection();
            }
        }
        else {
            go.CommandHandler.prototype.doKeyDown.call(goaldiagram.commandHandler);
        }
    };

    function addNodeAndLink(e, obj) {
        goaldiagram.startTransaction("Add Node");
        let parentKey = obj.data.key;
        let newdata = {
            nodeid:'',
            text: '',
            dir : ((obj.data.dir) ? obj.data.dir : "right"),
            parent : parentKey,
            category : 'child',
            dueDate: undefined,
            notes: '',
            tags: [],
            entities: [],
            positions: [],
            successCriteria: '',
            failureCriteria: '',
            entityOpen: false,
            _isTreeLeaf: false,
            _isTreeExpanded: true,
        };
        goaldiagram.model.addNodeData(newdata);
        goaldiagram.commitTransaction("Add Node");

        goaldiagram.startTransaction("Updated Node _isTreeLeaf");
        goaldiagram.model.setDataProperty(obj.data, "_isTreeLeaf", '');
        goaldiagram.model.setDataProperty(obj.data, "_isTreeLeaf", true);
        goaldiagram.commitTransaction("Updated Node _isTreeLeaf");
        goaldiagram.startTransaction("Updated Node _isTreeExpanded");
        goaldiagram.model.setDataProperty(obj.data, "_isTreeExpanded", '');
        goaldiagram.model.setDataProperty(obj.data, "_isTreeExpanded", true);
        goaldiagram.commitTransaction("Updated Node _isTreeExpanded");
        spGoalplanningTemplates.updateChildNodesVisible(obj,true);
        layoutTree(true);
        let key = goaldiagram.model.getKeyForNodeData(newdata);
        goaldiagram.clearSelection();
        let selnode = goaldiagram.findNodeForKey(key);
        selnode.isSelected = true;
        if(selnode !== null) {
            let tempNodeId = "unsaved" + key;
            goaldiagram.model.setDataProperty(selnode.data, "nodeid", tempNodeId);
            selnode.data.nodeid = tempNodeId;
            selnode.data.text = "new Node";
            spGoalplanningModel.createNode(selnode.data).then(function (result) {
                if (!result) return;
                goaldiagram.model.setDataProperty(selnode.data, "nodeid", result.nodeid);
                goaldiagram.model.setKeyForNodeData(selnode.data, result.nodeid);
                spGoalplanningModel.updateNode(result.nodeid, result);
            });
            ctrl.onSelectedNodeData({selectedNodeData: selnode.data});
            ctrl.avoidSidebar(selnode);
            let tb = selnode.findObject('TEXT');
            if (tb) goaldiagram.commandHandler.editTextBlock(tb);
        }
    }

    goaldiagram.addDiagramListener("ChangedSelection", function (e, x) {
        let selNode = goaldiagram.selection.first();
        if (goaldiagram.selection.count > 1) {//multiple delete. unselect the root node and private nodes
            let nodes = [];
            goaldiagram.selection.each(function (part) {
                if (part.data.category === "root" || part.data.category === "private") {
                    nodes[nodes.length] = part;
                }
            });
            nodes.forEach(function(node){
                if (node !== null){
                    node.isSelected = false;
                    let nodeOutline = node.findObject("NODE-OUTLINE");
                    if (nodeOutline !== null) {
                        if(node.data.category === "private") {
                            nodeOutline.stroke = 'transparent';
                        } else {
                            nodeOutline.stroke = nodeOutlineDefaultClr;
                        }

                    }
                }
            });
        }

        if ( selNode !== null) {
            ctrl.onSelectedNodeData({selectedNodeData: selNode.data});
            ctrl.avoidSidebar(selNode);
            if (selNode.data.category !== 'root') {
                ctrl.onRightSidebarInit ({rightSidebarToggle:true});
            } else ctrl.onRightSidebarInit ({rightSidebarToggle:false});
        }else  {
            if( ie11){//check microsoft ie 11
                // setTimeout(function(){
                    ctrl.onSelectedNodeData({selectedNodeData: null});
                    ctrl.onRightSidebarInit ({rightSidebarToggle:false});
                // },7);
            }else{
                ctrl.onSelectedNodeData({selectedNodeData: null});
                ctrl.onRightSidebarInit ({rightSidebarToggle:false});
            }
            goaldiagram.startTransaction("no highlighteds");
            goaldiagram.clearHighlighteds();
            goaldiagram.commitTransaction("no highlighteds");
        }
        $scope.$applyAsync();
    });

    goaldiagram.addDiagramListener("SelectionMoved", function (e) {
        layoutTree();
    });

    function layoutAngle(parts, angle) {
        let layout = go.GraphObject.make(go.TreeLayout,
                        {
                            angle: angle,
                            arrangement: go.TreeLayout.ArrangementFixedRoots,
                            nodeSpacing: 25,
                            layerSpacing: 60,
                            setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
                            setsChildPortSpot: false
                        });
        layout.doLayout(parts);
    }

    function layoutTree(short) {
        let root = goaldiagram.findNodeForKey(rootNodeId);
        if (root === null) return;
        goaldiagram.startTransaction("Layout");
        // split the nodes from the oposite tree into two collections
        let rightward = new go.Set(go.Part);
        let leftward = new go.Set(go.Part);
        root.findLinksConnected().each(function (link) {
            let child = link.toNode;
            if (child.data.dir === "left") {
                leftward.add(root);  // the root node is in both collections
                leftward.add(link);
                leftward.addAll(child.findTreeParts());
            } else {
                rightward.add(root);  // the root node is in both collections
                rightward.add(link);
                rightward.addAll(child.findTreeParts());
            }
        });
        // do one layout and then the other without moving the shared root node
        layoutAngle(rightward, 0);
        layoutAngle(leftward, 180);
        goaldiagram.commitTransaction("Layout");

        if (!short){ //do Tree Leaf (Leaf = have children)
            let _isTreeLeaf = false;
            root.findTreeParts().each(function (node){
                if (node instanceof go.Node) {
                    if (node.data.category !== 'root' && node.data.category !== 'entity') {
                        let children = node.findTreeChildrenNodes();
                        if (children) {
                            children.each(function (childNode){
                                if (childNode.data.category !== "entity") _isTreeLeaf = true;
                            });

                        }
                        goaldiagram.startTransaction("Updated Node _isTreeLeaf");
                        goaldiagram.model.setDataProperty(node.data, "_isTreeLeaf", '');
                        goaldiagram.model.setDataProperty(node.data, "_isTreeLeaf", _isTreeLeaf);
                        goaldiagram.commitTransaction("Updated Node _isTreeLeaf");
                        _isTreeLeaf = false;
                    }
                }
            });
        }
    }

    goaldiagram.addDiagramListener("SelectionDeleted", function (e) {
        let deletedGoals = [];
        e.subject.each(function (part) {
             if (part instanceof go.Link) return;
             if(part.data.category !== "root" && part.data.category !== "entity" && part.data.category !== "private") {
                 if (part.data.nodeid){
                     deletedGoals.push({goalId:part.data.nodeid});
                 }
             }
         });
        if (deletedGoals.length > 0) {
            spGoalplanningModel.removeNodes(deletedGoals);
        }
        ctrl.onSelectedNodeData({selectedNodeData: null});
        layoutTree();
    });

    function makeObjClone(node){
        return Object.assign({}, node);
    }

    function deleteSelection(){
        let selNode = goaldiagram.selection.first();
        let children = Math.ceil(selNode.findTreeParts().count/2-1);
        deletedArray = [];
        createRemoveConfirmation(selNode.data.text, goaldiagram.selection.first().data.category , true, goaldiagram.selection.count, children, function () {
            goaldiagram.selection.each(function (part) {
                saveDeletedNodeForUndo(part);
                if(part.data.category === "entity"){
                    updateParentGoalAfterRemoveEntityGoal(part.data);
                    spGoalplanningModel.updateEntityGoalMatched(part.data,part.data.parent,'delete');
                }
                if (part.data.entities && part.data.entities.length > 0){
                    part.data.entities.forEach(function (entity){
                        spGoalplanningModel.updateEntityGoalMatched(entity,part.data.nodeid,'delete');
                    });
                }
            });
            goaldiagram.commandHandler.deleteSelection();
        },null,undoNodes);
    }

    function saveDeletedNodeForUndo(node){
        deletedArray.push(makeObjClone(node.data));
        if (node.data.category === 'entity'){
            entityDeletedArray.push(makeObjClone(node.data));
        }
        node.findTreeParts().each(function (childNode){
            if (childNode instanceof go.Node) {
                if (childNode.data.category !== 'root' && childNode.data.category !== 'entity') {
                    if (childNode.findTreeChildrenNodes) {
                        childNode.findTreeChildrenNodes().each(function (childNode){
                                deletedArray.push(makeObjClone(childNode.data));
                        });
                    }
                }
            }
        });
    }

    let undoNodes = function(){
        let deletedArrayIds = [];
        if(deletedArray){
            deletedArray.forEach(function (item) {
                item._isTreeExpanded = true;
                if (item.entityOpen) item.entityOpen = false;
                goaldiagram.startTransaction("Add Node");
                goaldiagram.model.addNodeData(item);
                goaldiagram.commitTransaction("Add Node");
                if (item.category !== 'entity')deletedArrayIds.push({goalId:item.nodeid});
                if (item.category === 'entity'){
                    updateParentGoalAfterRestoreEntityGoal(item);
                }
            });
            if(deletedArrayIds.length >= 1){
                spGoalplanningModel.restoreGoals(deletedArrayIds);
            }
        }
        deletedArray = [];
        layoutTree();
    };

    function updateParentGoalAfterRestoreEntityGoal(selNode){
        let parentNode = goaldiagram.findNodeForKey(selNode.parent);
        let entityIndex = null;
        if(parentNode) {
            parentNode.data.entities.forEach(function (node, index, array) {
                if (node['entityId'] === selNode.entityId) {
                    entityIndex = index;
                    return;
                }
            });
            if (entityIndex === null){
                let newEntityData = {};
                newEntityData.entityId = selNode.entityId;
                newEntityData.entityName = selNode.entityName;
                newEntityData.entityParentId = selNode.entityParentId;
                newEntityData.entityOwnerId = selNode.entityOwnerId;
                newEntityData.entityType = selNode.entityType;
                newEntityData.url = selNode.url;
                newEntityData.notificationFlag = selNode.notificationFlag;
                newEntityData.removed = selNode.removed;
                newEntityData.countSubObjects = selNode.countSubObjects;
                newEntityData.positions = selNode.positions;
                newEntityData.notifications = selNode.notifications;
                newEntityData.comments = selNode.comments;

                let nodeEntity = parentNode.data.entities;
                nodeEntity.push(newEntityData);
                goaldiagram.startTransaction("Updated Node entity");
                goaldiagram.model.setDataProperty(parentNode.data, "entities", '');
                goaldiagram.model.setDataProperty(parentNode.data, "entities", nodeEntity);
                goaldiagram.commitTransaction("Updated Node entity");

                let flag = false;
                for (let i = 0; i < parentNode.data.entities.length; i++) {
                    if (parentNode.data.entities[i].notificationFlag === true) {
                        flag = true;
                        break;
                    }
                }
                parentNode.data.notificationFlag = flag;

                goaldiagram.startTransaction("Updated Node flag");
                goaldiagram.model.setDataProperty(parentNode.data, "notificationFlag", '');
                goaldiagram.model.setDataProperty(parentNode.data, "notificationFlag", flag);
                goaldiagram.commitTransaction("Updated Node flag");
                spGoalplanningTemplates.toggleEntity(null,parentNode,true);
                spGoalplanningModel.updateNode(parentNode.data.nodeid, parentNode.data);
                spGoalplanningModel.updateEntityGoalMatched(newEntityData,parentNode.data.nodeid,'add');
            }
        }
    }

    function updateParentGoalAfterRemoveEntityGoal(selNode){
        let parentNode = goaldiagram.findNodeForKey(selNode.parent);
        let entityIndex;
        if(parentNode) {
            parentNode.data.entities.forEach(function (node, index, array) {
                if (node['entityId'] === selNode.entityId) {
                    entityIndex = index;
                    return;
                }
            });
            parentNode.data.entities.splice(entityIndex, 1);
            goaldiagram.startTransaction("Updated Node entity");
            let nodeEntity = parentNode.data.entities;
            goaldiagram.model.setDataProperty(parentNode.data, "entities", '');
            goaldiagram.model.setDataProperty(parentNode.data, "entities", nodeEntity);
            goaldiagram.commitTransaction("Updated Node entity");

            let flag = false;
            for (let i = 0; i < parentNode.data.entities.length; i++) {
                if (parentNode.data.entities[i].notificationFlag === true) {
                    flag = true;
                    break;
                }
            }
            parentNode.data.notificationFlag = flag;

            goaldiagram.startTransaction("Updated Node flag");
            goaldiagram.model.setDataProperty(parentNode.data, "notificationFlag", '');
            goaldiagram.model.setDataProperty(parentNode.data, "notificationFlag", flag);
            goaldiagram.commitTransaction("Updated Node flag");
            spGoalplanningModel.updateNode(parentNode.data.nodeid, parentNode.data);
        }
    }

    let createRemoveConfirmation = function (name, type, snackbar, countNodes, countSubnodes, callback, cancelCallback, undoCallback) {
        let typeText = "goal";
        if (type === "entity") typeText = type;
        let multyText;
        let clampName = name, clampName1 = name;
        if (name && name.length > 44) {
            clampName = name.slice(0,44) + "...";
            clampName1 = name.slice(0,30) + "...";
        }
        let confirm = $mdDialog.confirm()
            .ok('DELETE')
            .cancel('CANCEL');

        if (countNodes > 1) {
            multyText = "multiple " + typeText + " were";
            confirm
                .title("Deleting Multiple goals")
                .textContent("Do you want to delete the selected goals");
        } else {
            let dialogTextContent = "";
            if (countSubnodes > 0) {
                dialogTextContent = "Are you sure you want to delete? The " + typeText + " \"" + clampName1 + "\" and " + countSubnodes + " sub" + typeText + "(s) will be deleted.";
            } else {
                dialogTextContent = "Are you sure you want to delete  " + typeText + " " + clampName + "?";
            }
            confirm
                .title("Deleting " + clampName)
                .textContent(dialogTextContent);
        }

        $mdDialog.show(confirm).then(function () {
            callback && callback();
            let text = "";
            if (countSubnodes){
                text = " and " + countSubnodes + " subgoals were";
            } else text = "was";
            let resetUndeleteArray = setTimeout(function(){
                                                    deletedArray = [];
                                                },4000); //clear array if not do "Undone"
            snackbar && spSnackbar.undo("The " + ((multyText) ? multyText : (typeText + " \"" + clampName1 + "\" " + text)) + " successfully deleted.", () => {
                clearTimeout(resetUndeleteArray);
                undoCallback && undoCallback();
            });
        }, function () {
            cancelCallback && cancelCallback();
        });
    };

    function pasteNode(parentKey, newNode) {
        // goaldiagram.startTransaction("paste node");//todo disabled before Maria give explained task
        // goaldiagram.model.setDataProperty(newNode.data, "parent", parentKey);
        // goaldiagram.commitTransaction("paste node");
        // layoutTree();
    }

    goaldiagram.addDiagramListener("ClipboardPasted", function () {
        //pasteNode(parent_key, goaldiagram.selection.first());
    });
    
    this.selectGoal = function (key) {
        let node = goaldiagram.findNodeForKey(key);
        if(node){
            goaldiagram.select(node);
            goaldiagram.commandHandler.scrollToPart();
        }
    };
}

export default SPGoalplanningController;
