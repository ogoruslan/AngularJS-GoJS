'use strict';
function CMStrategicalPlanningController($scope, spGoalplanningModel, $stateParams,spGoalplanningTemplates,spConfig,spUsersModel) {
        'ngInject';
        let self = this;
        $scope.goaldiagram = null;
        $scope.nodes = null;
        $scope.selectedNodeData = null;
        $scope.searchPositions = spGoalplanningModel.getOrgStructure;
        $scope.searchEntities = spGoalplanningModel.getEntities;
        $scope.searchUsers = spGoalplanningModel.getUsersSearchByNameEmail;
        $scope.selectedGoalId = $stateParams.goalId;
        $scope.addPositionAPI = spGoalplanningModel.addPosition;
        $scope.inviteUserAPI = spGoalplanningModel.inviteUser;
        $scope.rightSidebarToggle = false;
        $scope.tempText = null;
        $scope.spConfig = spConfig;
        $scope.spUsersModel = spUsersModel;
        $scope.authData = this.authData;
        // $scope.spComments = [];
        $scope.permission = false;
        $scope.currentUser = this.cmCurrentUser;

        self.$onChanges  = function (changes) {
            if (changes.cmApiHost && changes.cmApiHost.isFirstChange()) {

                if (!this.cmApiHost) {
                    console.error('cmStrategicalPlanning component: cm-api-host attribute is required (ex. cm-api-host="https://host")');
                }
                if (!this.cmCurrentUser) {
                    console.error('cmStrategicalPlanning component: cm-current-user attribute is required (ex. cm-current-user="$ctrl.currentUser")');
                }
                $scope.spConfig.setAPIHost(this.cmApiHost);
                $scope.spUsersModel.setCurrentUser(this.cmCurrentUser);
                spGoalplanningModel.getEntities().then(
                    function(entities){
                        spGoalplanningModel.getOrgStructureArray().then(
                            function(response){
                                spGoalplanningModel.getAllGoals().then(function (goalPlanningNodesArray) {
                                    $scope.nodes = goalPlanningNodesArray;
                                });
                            });
                    }
                );
                // spGoalplanningModel.getCommentsAPI().then(
                //     function (items){
                //         $scope.spComments = items;
                //     }
                // );
            }
        };

        $scope.GoaldiagramInit = function (goaldiagram) {
            $scope.goaldiagram = goaldiagram;
        };

        $scope.RightSidebarInit = function (rightSidebarToggle) {
            $scope.rightSidebarToggle = rightSidebarToggle;
            if ($scope.rightSidebarToggle) {
                setTimeout( //do focus for use the keyboard key del
                    () => {
                        $scope.goaldiagram.focus();
                    }, 100);
            }
        };

        $scope.$on('changedUser', function(){
            $scope.changed("User");
        });

        $scope.textFocus = function(selectedNodeData,e){ //save text for revert after blur if text empty
            $scope.tempText = selectedNodeData.text;
        };

        $scope.textBlur = function(selectedNodeData,e){ //revert text if empty
            if (!selectedNodeData || (!selectedNodeData.text.trim() && $scope.tempText !== null)) {
                $scope.goaldiagram.startTransaction("Updated Node text");
                $scope.goaldiagram.model.setDataProperty(selectedNodeData, "text", '');
                $scope.goaldiagram.model.setDataProperty(selectedNodeData, "text", $scope.tempText);
                $scope.goaldiagram.commitTransaction("Updated Node text");
                $scope.tempText = null;
                spGoalplanningTemplates.updateNodeDirection();
                if (selectedNodeData) {
                    spGoalplanningModel.updateNode(selectedNodeData.nodeid, selectedNodeData);
                }
            }
        };
        $scope.trimAfterBlur = function (val,data){//trim after blur
            $scope.goaldiagram.startTransaction("Updated Node");
            $scope.goaldiagram.model.setDataProperty($scope.selectedNodeData, val, '');
            $scope.goaldiagram.model.setDataProperty($scope.selectedNodeData, val, data.trim() );
            $scope.goaldiagram.commitTransaction("Updated Node");
            if (data.trim()){
                spGoalplanningModel.updateNode($scope.selectedNodeData.nodeid,$scope.selectedNodeData);
            }
        };

        $scope.rightSidebarClick = function(){//exit from texedit mode
            let tool = $scope.goaldiagram.toolManager.textEditingTool;
            if (tool.isActive) tool.doCancel();
        };

        $scope.changed = function(val,data){
            let text = $scope.selectedNodeData.text;
            if (val) {
                switch (val){
                    case 'comments':
                        spGoalplanningModel.updateNode($scope.selectedNodeData.nodeid,$scope.selectedNodeData);
                        break;
                    case 'text':
                    case 'successCriteria':
                    case 'failureCriteria':
                    case 'notes':
                        $scope.goaldiagram.startTransaction("Updated Node");
                        $scope.goaldiagram.model.setDataProperty($scope.selectedNodeData, val, '');
                        $scope.goaldiagram.model.setDataProperty($scope.selectedNodeData, val, data );
                        $scope.goaldiagram.commitTransaction("Updated Node");
                        if(val === 'text') spGoalplanningTemplates.updateNodeDirection();
                        if (data.trim()){
                            spGoalplanningModel.updateNode($scope.selectedNodeData.nodeid,$scope.selectedNodeData);
                        }
                        break;
                    case 'Date':
                    case 'User':
                    case 'Tags':
                        spGoalplanningModel.updateNode($scope.selectedNodeData.nodeid,$scope.selectedNodeData);
                        break;
                }
            }
        };

        $scope.selectionChanged = function (selnodedata) {
            $scope.selectedNodeData = selnodedata;
            if ($scope.selectedNodeData && $scope.selectedNodeData.permission){
                switch ($scope.selectedNodeData.permission){
                    case "OWNER":
                    case "EDIT":
                        $scope.permission = true;
                        break;
                    default: $scope.permission = false;
                }
            }
        };
        spGoalplanningModel.getTagsLibrary().then(function (response) {
            $scope.TagsItemsLibrary = response.tags;
        });


        $scope.selectedTags = [];

        $scope.strLimit = function(searchText,limit){
            if (searchText.length > limit) {
                self.searchText = searchText.slice(0,limit)
            }
        };

        function createFilterTags(searchText) {
            return function filterFn(item) {
                return (item.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);
            };
        }

        $scope.searchTags = function (searchText) {
            return (searchText ? $scope.TagsItemsLibrary.filter(createFilterTags(searchText)) : []);
        };

        $scope.addPosition = (positionId) => {
            spGoalplanningModel.assignPosition($scope.selectedNodeData.nodeid, positionId);
        };

        $scope.addPositions = (positions) => {
            if (!positions || positions.length <= 0) return;
            let data = [];
            positions.forEach((position) => {
                data.push({
                    nodeId: position.nodeId
                })
            });
            spGoalplanningModel.assignPositions($scope.selectedNodeData.nodeid, data);
        };

        $scope.removePosition = (positionId) => {
            spGoalplanningModel.deletePosition($scope.selectedNodeData.nodeid, positionId);
        };

        $scope.addPositionEntity = (positionId) => {
            console.log("addPositiontEntity",positionId);
        };

        $scope.addPositionsEntity = (positions) => {
            if (!positions || positions.length <= 0) return;
            if ($scope.selectedNodeData) {
                $scope.AddEntityPositions = positions.slice();
            }
        };

        $scope.removePositionEntity = (positionId) => {
            $scope.RemoveEntityPositions = positionId;
        };

        $scope.addEntity = (entity) => {
            if ($scope.selectedNodeData) {
                $scope.AddEntity = $scope.selectedNodeData.entities.slice();
            }
        };

        $scope.removeEntity = (entity) => {
            $scope.RemoveEntity = entity;
        };

        $scope.createPosition = (position) => {
            console.log('top level: ', position);
        };

        $scope.isChild = function (nodeData){
            if (nodeData && nodeData.category === "child") return true;
            else return false;
        };

        $scope.isEntity = function (nodeData){
            if (nodeData && nodeData.category === "entity") return true;
            else return false;
        };

        $scope.isPrivate = function (nodeData){
            if (nodeData && nodeData.category === "private") return true;
            else return false;
        };

        $scope.gotoOnClick = function(nodeDataUrl){
            let win = window.open(nodeDataUrl, "_self", '');
        };

        $scope.onPermissionChanged = function (position){
            spGoalplanningModel.changePermission(position.nodeId, position.position.permission);
        }
    }

    export default CMStrategicalPlanningController;
