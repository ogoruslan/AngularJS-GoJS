'use strict';

function spGoalplanningModel($http, $q, CONFIG, spAPIStack) {
    'ngInject';
    
    const API_URL = CONFIG.API_HOST + CONFIG.API_URL_GOAL;
    const API_E6_URL = CONFIG.API_E6_HOST;
    const API_PM_URL = CONFIG.API_HOST + CONFIG.API_URL_PROJECT_MANAGER;
    const BPM_EDITOR_URL = CONFIG.BP_EDITOR_URL;
    const PROJECT_MANAGER_URL = CONFIG.PROJECT_MANAGER_URL;
    let nodes = [];
    let node = {};
    let self;
    let allEntities = undefined;
    let allPositions = [];

    let transformEntity = (node) => {
        let newEntityData = {};
        if ( node.type === 'projectDto') {
            newEntityData.entityId = node.id;
            newEntityData.entityName = node.projectName;
            newEntityData.entityParentId = '';
            newEntityData.entityOwnerId = '';
            newEntityData.entityType = "Project";
            newEntityData.url = PROJECT_MANAGER_URL + "home/" + node.id;
            newEntityData.notificationFlag = false;
            newEntityData.removed = node.removed;

            //todo should add to rest api. In to goal -> entities array
            newEntityData.countSubObjects = node.projectCards.length;
        }
        if(node._cls === "BusinessProcess"){
            newEntityData.entityId = node.id;
            newEntityData.entityName = node.name;
            newEntityData.entityParentId = '';
            newEntityData.entityOwnerId = node.created_by;
            newEntityData.entityType = "BPM";
            newEntityData.url = BPM_EDITOR_URL + "?instanceId=" + node.instance_type_name_C[0] + "&modelId=" + node.id;
            newEntityData.notificationFlag = node.valid;
            newEntityData.removed = false;
            //todo should add to rest api. In to goal -> entities array
            newEntityData.countSubObjects = null;
        }
        newEntityData.type = "entityDto";
        newEntityData.visible = false;

        //todo should add to rest api. In to goal -> entities array.
        newEntityData.positions = (node.positions) ? node.positions : [];

        //todo For demo. Remove this.
        if (newEntityData.positions.length > 0){
            newEntityData.positions.forEach(function (nodePosition, index) {
                // if (index === 1) {
                //     nodePosition.position.permission = 'OWNER';
                // }else nodePosition.position.permission = 'VIEW';
                if (!nodePosition.position.permission)
                nodePosition.position.permission = 'EDIT';
            });
        }

        newEntityData.notifications = [
            {
                id:"1",
                user:"Alice Kingsley",
                notification:"requested for access to",
                object:"Manual Bay",
                icon:"",
                date: new Date()
            },
            {
                id:"2",
                user:"Joe Smith",
                notification:"published ",
                object:"Security rules",
                icon:"/assets/strategical-planning-assets/icons/notification_secure.svg",
                date: new Date()
            },
        ];
        newEntityData.comments = self.getCommentsAPI();//[] Todo test data

        return newEntityData;
    };

    let transformEntities = (nodes) => {
        let entities = [];
        nodes.forEach(function (node, index, array) {
            entities.push(transformEntity(node));
        });
        allEntities = entities;
        return entities;
    };

    let transformSaveNode = (node) => {
        let clonedNode = cleanNode(node);
        delete clonedNode['__gohashid'];
        delete clonedNode['key'];
        delete clonedNode['entityOpen'];
        delete clonedNode['_isTreeLeaf'];
        delete clonedNode['_isTreeExpanded'];
        return clonedNode;
    };

    let transformSaveNodes = function (nodes) {
        let transformedNodes = [];
        nodes.forEach(function (node, index, array) {
            transformedNodes.push(transformSaveNode(node));
        });
        return transformedNodes;
    };

    let transformNode = function (node) {
        let entityToDelete = [];

        node['key'] = node['nodeid'];

        if ( node['dueDate'] !== undefined ) {
            node['dueDate'] = new Date(node['dueDate']); //conver date to js Data object
        }

        if(node['category'] === 'root') {
            let tags = [];
            tags.push('root');
            node['tags'] = tags; //tags fix
            delete node['dir']; //root node do not have direction (have both)
        }

        delete node['loc']; //Todo remove this after fix back-end

        if(node['positions'].length > 0){//remove deleted position
            let posDeleted = [];
            if(allPositions.length > 0 ){
                node['positions'].forEach(function (nodePosition, index) {
                    // if (index === 1) {//TODO remove this is. It is for test.
                    //     nodePosition.position.permission = 'OWNER';
                    // }else nodePosition.position.permission = 'VIEW';
                    if (!nodePosition.position.permission)
                        nodePosition.position.permission = 'EDIT';


                    let is = false;
                    allPositions.forEach(function (position){
                        if(position.nodeId === nodePosition.nodeId){
                            is = true;
                        }
                    });

                    if(!is)posDeleted.push(index);
                });

                if (posDeleted.length >0){
                    posDeleted.forEach(function (positionIndex) {
                        node['positions'].splice(positionIndex,1);
                    });
                    self.updateNode(node['nodeid'], node);
                }
            }
        }

        if (node['entities'].length > 0 && allEntities !== undefined){ //update entity info to the current data or remove it Todo What we do if now not have connection to entities, we may show alert.
            node['entities'].forEach(function (nodeEntity, index, array) {
                let found = false;
                allEntities.forEach(function (entity, indexEntity, arrayEntity) {
                    if (nodeEntity.entityId === entity.entityId){
                        node['entities'][index] = entity;
                        found = true;
                    }
                });
                if (found === false){
                    entityToDelete.push(index);
                }
            });
            if (entityToDelete.length > 0){
                entityToDelete.forEach(function(entity, indexEntity, arrayEntity){
                    if(allEntities[entityToDelete])
                        console.log("Delete entity " + allEntities[entityToDelete].entityName + " from node '" + node.text + "'\n");
                    node['entities'].splice(entityToDelete,1);
                    self.updateNode(node['nodeid'], node);
                });
            }
        }

        if (node['entities'] === undefined ) {
            node['entities'] = [];
        }

        node['entityOpen'] = false;
        node['_isTreeLeaf'] = false;
        node['_isTreeExpanded'] = true;

        if (!node['permission']) node['permission'] = 'EDIT';//TODO this is for test. Remove it.
        node['comments'] = self.getCommentsAPI();//[];

        return node;
    };
    
    let transformNodes = function (nodes) {
        let transformedNodes = [];
        nodes.forEach(function (node, index, array) {
            if (node['text'] === undefined || node['text'] === 'new Node' || node.category !== "root" && !node['text'].trim()) {
                self.removeNode(node.nodeid); //todo remove this ?
            }else transformedNodes.push(transformNode(node));
        });
        transformedNodes = self.removeEntitiesFromGoalArray(transformedNodes);//remove lost entities
        transformedNodes = transformedNodes.concat(self.addEntitiesToGoalArray(transformedNodes)); //add active entities
        transformedNodes.push({"type":"goalDto","category":"private","nodeid":"01","key":"01","text":"Private","parent":"0","positions":[],"removed":false,"tags":[]});
        transformedNodes.push({"type":"goalDto","category":"child","nodeid":"02","key":"02","text":"View permission","parent":"0","positions":[{
            "category": "POSITION",
            "nodeId": "pos_155aae8b-4718-47ae-9d8f-4b373a3740ce",
            "parentNodeId": "dep_root",
            "position": {
                "assignments": [],
                "createdAt": "2017-09-21T19:54:58Z",
                "permission":"OWNER",
                "designation": "111",
                "notes": "",
                "updatedAt": "2017-10-16T17:56:57Z",
                "users": [
                    {
                        "avatarFileId": "",
                        "email": "rest@gmail.com",
                        "firstName": "irakli",
                        "inviteAccepted": true,
                        "lastName": "ibdurahmanovich",
                        "userId": "db064ab3-c977-4a3c-8748-cabcf0ca7d91"
                    }
                ]
            },
            "removed": false
        },],"entities":[],"removed":false,"tags":[],"permission":"VIEW"});
        return transformedNodes;
    };

    let cleanNode = function (node) {
        return Object.assign({}, node);
    };

    // spAuthentication.setHeader($http);
    // let e6auth = window.btoa(`rohorodnyk@riverainc.com:MgJ*Za2+33(^p27`);
    // let e6instance = null;
    // let setDefaultInstance = () => {
    //     return $http({
    //         method: 'GET',
    //         url: `${API_E6_URL}/instances/`,
    //         headers: {
    //             "Authorization": "Basic " + e6auth
    //         },
    //         data: {}
    //     }).then(
    //     (successResponse) => {
    //         for (let i in successResponse.data) {
    //             if (successResponse.data[i].master) {
    //                 e6instance = successResponse.data[i].id;
    //                 break;
    //             }
    //         }
    //         return e6instance;
    //     }, (errorResponse) => {
    //         $http({
    //             method: 'POST',
    //             url: `${API_E6_URL}/instances/`,
    //             headers: {
    //                 "Authorization": "Basic " + e6auth
    //             },
    //             data: {
    //                 "is_master": true,
    //                 "name": "BPE instance"
    //             }
    //         }).then(
    //         (successResponse) => {
    //             return setDefaultInstance();
    //         }, function (err) {
    //             // todo: handle error
    //             return [];
    //         });
    //     }
    //     );
    // };

    self = {

        getAllGoals: window.getAllGoals = function(){
            return $http.get(API_URL + '/goals')
                .then(function (response) {
                    return transformNodes(response.data);
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        // getAllGoals: window.getAllGoals = function(){
        //     return $q(function (resolve, reject) {
        //         setTimeout(()=>{
        //            // resolve([{"type":"goalDto","category":"root","__gohashid":0,"nodeid":"0","key":"0","text":"Rivera Group","positions":[],"tags":[],"parent":"0"}]);
        //             //resolve([{"type":"goalDto","category":"root","__gohashid":0,"nodeid":"0","key":"0","loc":"0 0","text":"Rivera Group","parent":"0","positions":[],"removed":false,"tags":[]}]);
        // //resolve([{"type":"goalDto","category":"root","__gohashid":0,"nodeid":"0","key":"0","text":"Rivera Group","parent":"0","positions":[],"removed":false,"tags":["root"]},{"type":"goalDto","category":"child","dir":"left","failureCriteria":"","__gohashid":886,"nodeid":"826563e1-a350-4f63-b84d-497f966f503a","key":"-3","text":"22","notes":"","parent":"-4","positions":[],"removed":false,"successCriteria":"","tags":[]},{"type":"goalDto","category":"child","dir":"left","failureCriteria":"","__gohashid":1224,"nodeid":"975dfd4a-d676-4ce3-b658-5e45d157eced","key":"-6","text":"3","notes":"","parent":"-3","positions":[],"removed":false,"successCriteria":"","tags":[]},{"type":"goalDto","category":"child","dir":"left","failureCriteria":"","__gohashid":2459,"nodeid":"ca0eb41e-79f6-4584-be33-4084787c2660","key":"-4","text":"1","notes":"","parent":"0","positions":[],"removed":false,"successCriteria":"","tags":[]},{"type":"goalDto","category":"child","dir":"left","failureCriteria":"","__gohashid":3371,"nodeid":"ece66eb5-1108-402a-98d2-0f699e81a136","key":"-5","text":"11","notes":"","parent":"-4","positions":[],"removed":false,"successCriteria":"","tags":[]}]);
        //         },500);
        //     });
        // },

        tranformOrgStructure: window.tranformOrgStructure = function(items){ //TOdo remove this. it is test data for owner
            let itemsArray = [];
            for (let obj in items) {
                if (items[obj].category === "POSITION") {
                    if (!items[obj].position.permission) items[obj].position.permission = "EDIT";
                }
            }
            itemsArray = items;
            return itemsArray;
        },

        getOrgStructure: window.getOrgStructure = function(){
            return $http.get(API_URL + '/orgchart')
            .then(function (response) {
                return self.tranformOrgStructure(response.data);
            })
            .catch(function (err) {
                // todo: handle error
                return nodes = [];
            });
        },
        getOrgStructureArray: window.getOrgStructureArray = function () {
            return $q(function (resolve, reject) {
                self.getOrgStructure().then(function (response) {
                    allPositions = response;
                    resolve(response);
                });
            });
        },

        // getVacantPosition: window.getVacantPosition = function ( queryString ) {
        //     // // todo: has base request
        //     return $http.get(API_URL + '/positions/vacant/' + queryString)
        //         .then(function (response) {
        //             return response.data;
        //         })
        //         .catch(function (err) {
        //             // todo: handle error
        //             return [];
        //         });
        // },

        getNode: window.getNode = function ( nodeId ) {
            // // todo: has base request
            return $http.get(API_URL + '/goals/' + nodeId)
                .then(function (response) {
                    return transformNode(response.data);
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        // getUserById: window.getUserById = function ( nodeId ) {
        //     return $http.get(API_URL + '/users/' + nodeId + '/detailed')
        //         .then(function (response) {
        //             return transformNode(response.data);
        //         })
        //         .catch(function (err) {
        //             // todo: handle error
        //             return [];
        //         });
        // },
        updateNode: window.updateNode = function ( nodeId, nodeData ) {
            let transformedNodeData = transformSaveNode(nodeData);
            if (transformedNodeData.category === "entity") {
                return $q(function (resolve, reject) {
                        setTimeout(()=>{
                            resolve([]);
                        },7);
                    });
            }
            if (nodeId.indexOf('unsaved') >= 0) {
                stack.addCallback(nodeId, 'updateNode', arguments);
                return $q(function (resolve, reject) {
                    resolve(null);
                });
            }
            return $http.put(API_URL + '/goals/' + nodeId, JSON.stringify(transformedNodeData))
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
            // console.log("updateNode", nodeId, transformedNodeData);
            // return $q(function (resolve, reject) {
            //     setTimeout(()=>{
            //         resolve([]);
            //     },500);
            // });
        },

        updateMultypleNodes: window.updateMultypleNodes = function ( nodes ) {
            let transformedNodes = transformSaveNodes(nodes);
            return $http.put(API_URL + '/goals/batch' , JSON.stringify(transformedNodes))
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
            // return $q(function (resolve, reject) {
            //     setTimeout(()=>{
            //         resolve([]);
            //     },500);
            // });
        },

        createNode: window.createNode = function ( nodeData ) {
            let transformedNodeData = transformSaveNode(nodeData);
            if (!transformedNodeData) return;
            if (transformedNodeData.parent.indexOf('unsaved') >= 0) {
                 stack.addCallback(transformedNodeData.nodeid, 'createNode', arguments);
                 return $q(function (resolve, reject) {
                     resolve(null);
                 });
            }
            return $http.post(API_URL + '/goals/', JSON.stringify(transformedNodeData))
                .then(function (response) {
                    stack.callCallbacks(transformedNodeData.nodeid, response.data.nodeid);
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
            // return $q(function (resolve, reject) {
            //     setTimeout(()=>{
            //         resolve([]);
            //     },500);
            // });
        },

        removeNode: window.removeNode = function ( nodeId) {
            if (nodeId.indexOf('unsaved') >= 0) {
                stack.addCallback(nodeId, 'removeNode', arguments);
                return $q(function (resolve, reject) {
                    resolve(null);
                });
            }
            return $http.delete(API_URL + '/goals/' + nodeId)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },


        removeNodes: window.removeNodes = function ( nodes) {
            return $http.post(API_URL + '/goals/remove-goals' , JSON.stringify(nodes))
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },

        restoreGoals: window.restoreGoals = function ( nodes) {
            return $http.post(API_URL + '/goals/restore-goals' , JSON.stringify(nodes))
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },

        getEntities: window.getEntities = function () {
            return $q(function (resolve, reject) {
                self.getAllEntities().then(function (response) {
                    resolve(transformEntities(response));
                });
            });

            // return $http.get(API_URL + '/entities')
            //     .then(function (response) {
            //         return transformEntities(response.data);
            //     })
            //     .catch(function (err) {
            //         // todo: handle error
            //         return [];
            //     });
        },

        changeEntityGoalsMatched: function (entityId, nodes){
            if(entityId){
                self.getProject(entityId).then(function(projectData){
                    if (nodes.length > 0){
                        nodes.forEach(function(node){
                                let present = false;
                            if (projectData.projectInfo.goalsMatched.length > 0) {
                                projectData.projectInfo.goalsMatched.forEach(function (entity, index, array) {
                                    if (entity === node.nodeId) {
                                        present = index;
                                    }
                                });
                                if (present === false && node.type === 'add') {
                                    projectData.projectInfo.goalsMatched.push(node.nodeId);
                                }
                                if (present !== false && node.type === 'delete') {
                                    projectData.projectInfo.goalsMatched.splice(present, 1);
                                }
                            }
                            }
                        );
                        self.updateProject(entityId,projectData);
                    }
                });
            }
        },

        updateEntityGoalMatched: window.updateEntityGoalMatched = function (entities, nodeId, type){
            let projects = [];
            if(entities){
                if (entities.length > 0){
                    entities.forEach(function(entity){
                        if (entity.entityType === 'Project'){
                            projects.push(entity);
                        }
                    });
                } else {
                    projects.push(entities);
                }
                projects.forEach(function(project){
                    self.getProject(project.entityId).then(function(response){
                        let projectData = response;
                        if (projectData.projectInfo.goalsMatched.length > 0){
                            let present = false;
                            projectData.projectInfo.goalsMatched.forEach(function (node,index,array){
                                if (node === nodeId){
                                    present = index;
                                }
                            });
                            if (present === false && type === "add"){
                                projectData.projectInfo.goalsMatched.push(nodeId);
                                self.updateProject(project.entityId,projectData);
                            }
                            if (present !== false && type === "delete"){

                                projectData.projectInfo.goalsMatched.splice(present, 1);
                                self.updateProject(project.entityId,projectData);
                            }
                        }else {
                            if (type === "add"){
                                projectData.projectInfo.goalsMatched.push(nodeId);
                                self.updateProject(project.entityId,projectData);
                            }
                        }
                    });
                });
            }
        },

        updateEntityPositions: window.updateEntityPositions = function (positions, entityId, type){
            if(positions && entityId && type){
                    self.getProject(entityId).then(function(response){
                        let projectData = response;
                        if (projectData.positions.length > 0){
                            positions.forEach(function (position,indexPos){
                                let present = false;
                                projectData.positions.forEach(function (node,index){
                                    if (node.nodeId === position.nodeId){
                                        present = index;
                                    }
                                });
                                if (present === false && type === "add"){
                                    projectData.positions.push(position);
                                    self.updateProject(entityId,projectData);
                                }
                                if (present !== false && type === "delete"){
                                    projectData.positions.splice(present, 1);
                                    self.updateProject(entityId,projectData);
                                }
                            });

                        }else {
                            if (type === "add"){
                                projectData.positions = positions;
                                self.updateProject(entityId,projectData);
                            }
                        }
                    });
            }
        },

        getProjects: window.getProjects = function () {
            return $http.get(API_PM_URL + '/projects')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },

        getProject: window.getProject = function ( nodeId ) {
            return $http.get(API_PM_URL + '/projects/' + nodeId)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },

        updateProject: window.updateProject = function(nodeId,nodeData){
            return $http.put(API_PM_URL + '/projects/' + nodeId, JSON.stringify(nodeData))
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },

        getAllEntities: window.getAllEntities = function () {
            let getEntities = () => {
                let bpList = [];
                return $http.get(API_PM_URL + '/projects')
                    .then(function (response) {
                        return bpList.concat(response.data).sort((a, b) => {
                            return (a.name || a.projectName) > (b.name || b.projectName)
                        });
                    })
                    .catch(function (err) {
                        // todo: handle error
                        return [];
                    });
            };
            return getEntities()
        },
        
        // getAllEntities: window.getAllEntities = function () {
        //     let getEntities = () => {
        //         return $http({
        //             method: 'GET',
        //             url: `${API_E6_URL}/instances/${e6instance}/business_processes/`,
        //             headers: {
        //                 "Authorization": "Basic " + e6auth,
        //                 'Content-Type': 'application/json'
        //             },
        //             data: {}
        //         }).then(function (response) {
        //             let bpList = response.data;
        //             return $http.get(API_PM_URL + '/projects')
        //                 .then(function (response) {
        //                     return bpList.concat(response.data).sort((a, b) => {
        //                         return (a.name || a.projectName) > (b.name || b.projectName)
        //                     });
        //                 })
        //                 .catch(function (err) {
        //                     // todo: handle error
        //                     return bpList.sort((a, b) => {
        //                         return (a.name || a.projectName) > (b.name || b.projectName)
        //                     });
        //                 });
        //         }).catch(function (err) {
        //             // todo: handle error
        //             return $http.get(API_PM_URL + '/projects')
        //                 .then(function (response) {
        //                     return response.data.sort((a, b) => {
        //                         return (a.name || a.projectName) > (b.name || b.projectName)
        //                     });
        //                 })
        //                 .catch(function (err) {
        //                     // todo: handle error
        //                     return [];
        //                 });
        //
        //         });
        //     };
        //
        //     if (e6instance) {
        //         return getEntities()
        //     } else {
        //         return setDefaultInstance().then(() => {
        //             return getEntities();
        //         })
        //     }
        //
        // },

        // getEntity: window.getEntity = function ( nodeId ) {
        //     // // todo: has base request
        //     return $http.get(API_URL + '/entities/' + nodeId)
        //         .then(function (response) {
        //             return response.data;
        //         })
        //         .catch(function (err) {
        //             // todo: handle error
        //             return [];
        //         });
        // },
        //
        // updateEntity: window.updateEntity = function ( nodeId, nodeData ) {
        //     return $http.put(API_URL + '/entities/' + nodeId, JSON.stringify(nodeData))
        //         .then(function (response) {
        //             return response.data;
        //         })
        //         .catch(function (err) {
        //             // todo: handle error
        //             return [];
        //         });
        //     // return $q(function (resolve, reject) {
        //     //     setTimeout(()=>{
        //     //         resolve([]);
        //     //     },500);
        //     // });
        // },
        //
        // createEntity: window.createEntity = function ( nodeData ) {
        //     if (!nodeData) return;
        //     // if (nodeData.parent.indexOf('unsaved') >= 0) {
        //     //     stack.addCallback(nodeData.nodeid, 'createNode', arguments);
        //     //     return $q(function (resolve, reject) {
        //     //         resolve(null);
        //     //     });
        //     // }
        //     return $http.post(API_URL + '/entities/', JSON.stringify(nodeData))
        //         .then(function (response) {
        //             //stack.callCallbacks(nodeData.nodeid, response.data.nodeid);
        //             return response.data;
        //         })
        //         .catch(function (err) {
        //             // todo: handle error
        //             return [];
        //         });
        //     // return $q(function (resolve, reject) {
        //     //     setTimeout(()=>{
        //     //         resolve([]);
        //     //     },500);
        //     // });
        // },

        addEntitiesToGoalArray: window.addEntitiesToGoalArray = function ( goalsArray, entityId ) {
            let entitiesNodes = [];
            if (!goalsArray) return;
            //add entities to the goal array
            goalsArray.forEach(function (node, index, array) {
                if (node['category'] !== "root" && node['category'] !== "entity" && node['entities'].length > 0) {
                    for(let i=0;i < node['entities'].length;i++) {
                        let entity = node['entities'][i];
                        let newNodeEntityData = {};
                        newNodeEntityData.nodeid = newNodeEntityData.key = entity.entityId + node['nodeid'];
                        newNodeEntityData.entityId = entity.entityId;
                        newNodeEntityData.text = newNodeEntityData.entityName = entity.entityName;
                        newNodeEntityData.dir = ((node.dir) ? node.dir : "right");
                        newNodeEntityData.parent = node["key"];
                        newNodeEntityData.category = 'entity';
                        newNodeEntityData.entityParentId = entity.entityParentId;
                        newNodeEntityData.entityOwnerId = entity.entityOwnerId;
                        newNodeEntityData.entityType = entity.entityType;
                        newNodeEntityData.url = entity.url;
                        newNodeEntityData.notificationFlag = entity.notificationFlag;
                        newNodeEntityData.removed = false;
                        newNodeEntityData.visible = false;
                        newNodeEntityData.positions = entity.positions;
                        newNodeEntityData.notifications = entity.notifications;
                        newNodeEntityData.comments = entity.comments;
                        newNodeEntityData.countSubObjects = entity.countSubObjects;
                        entitiesNodes.push(newNodeEntityData);
                    }
                }
            });
            return entitiesNodes;
        },

        removeEntitiesFromGoalArray: window.removeEntitiesFromGoalArray = function ( goalsArray, entityId) {
            let entitiesNodes = [];
            if (!goalsArray) return;
            //remove all entities from the goal array
            goalsArray.forEach(function (node, index, array) {
                if (node['category'] === "entity") {
                    entitiesNodes.push(index);
                }
            });
            entitiesNodes.forEach(function (nodeIndex, index, array) {
                goalsArray.splice(nodeIndex, 1);
            });
            return goalsArray;
        },

        assignPosition: window.assignPosition = function ( nodeId, positionId ) {
            return $http.post (API_URL + '/goals/' + nodeId + '/assign/' + positionId)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        assignPositions: window.assignPositions = function ( nodeId, data ) {
            return $http.post (API_URL + '/goals/' + nodeId + '/assign', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                // todo: handle error
                return [];
            });
        },
        addPosition: function (parentNodeId, node, tempNodeId, callback) { //from orgChart
            if (!parentNodeId) return;
            if (parentNodeId.indexOf('unsaved') >= 0) {
                stack.addCallback(parentNodeId, 'addPosition', arguments);
                return $q(function (resolve, reject) {
                    resolve(null);
                });
            }
            return $http.post(API_URL + '/' + parentNodeId + '/add-position', cleanNode(node))
                .then(function (response) {
                    stack.callCallbacks(tempNodeId, response.data.nodeId);
                    callback && callback(response.data);
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return {};
                });
        },
        deletePosition: window.deleteUser = function ( nodeId,positionId) {
            return $http.delete(API_URL + '/goals/' + nodeId + '/assign/' + positionId)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        changePermission : window.changePermission = function (posId,permission){
            console.log("Server:permission changed ",posId,permission);
            // return $http.post (API_URL + '/goals/' + nodeId + '/assign', data)
            //     .then(function (response) {
            //         return response.data;
            //     })
            //     .catch(function (err) {
            //         // todo: handle error
            //         return [];
            //     });
        },
        inviteUser: function ( positionId, user ) {
            return $http.post (API_URL + '/positions/' + positionId + '/add-user', user)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        getUsersSearchByNameEmail: function ( searchText ) {
            return $http.get(API_URL + '/users?queryString=' + searchText)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        getTagsLibrary: function(){
            return $http.get(API_URL + '/tags')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    // todo: handle error
                    return [];
                });
        },
        getCommentsAPI: function (key) {
            return [
                        {
                            id: '1',
                            text: 'Mhm wondering if this comment will hit the generator as well..',
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '5',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/women/63.jpg'
                            }
                        },
                        {
                            id: '2',
                            text: 'Test comment',
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '5',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/women/44.jpg'
                            }
                        },
                        {
                            id: '3',
                            text: 'Another test comment',
                            dtCreated: new Date(),
                            dtUpdated: new Date(),
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/women/68.jpg'
                            }
                        },
                        {
                            id: '4',
                            text: 'What a beautiful day!',
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/men/46.jpg'
                            }
                        },
                        {
                            id: '5',
                            text: 'Please lets get back to topic',
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/men/1.jpg'
                            }
                        },
                        {
                            id: '6',
                            text: 'Mhm wondering if this comment will hit the generator as well..',
                            isReply: false,
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/men/62.jpg'
                            }
                        },
                        {
                            id: '7',
                            text: 'Mhm wondering if this comment will hit the generator as well..',
                            isReply: false,
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/men/29.jpg'
                            }
                        },
                        {
                            id: '8',
                            text: 'Mhm wondering if this comment will hit the generator as well..',
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/lego/3.jpg'
                            }
                        },
                        {
                            id: '9',
                            text: 'Mhm wondering if this comment will hit the generator as well..',
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/lego/6.jpg'
                            }
                        },
                        {
                            id: '10',
                            text: 'Mhm wondering if this comment will hit the generator as well..',
                            dtCreated: new Date(),
                            dtUpdated: null,
                            createdBy: {
                                id: '1',
                                firstName: 'Jane',
                                lastName: 'Doe',
                                position: 'Product Manager',
                                avatarFileId: 'https://randomuser.me/api/portraits/women/22.jpg'
                            }
                        }
                    ];

        },
        resetRoot: window.resetRoot = function () {
            console.log("reset to Root start");
            window.getAllGoals().then(function (allGoals) {
                allGoals.forEach(function (element, i, arr) {
                    console.log("element.nodeid",element.nodeid);
                    //if (element.category !== 'root') window.removeNode(element.nodeid);
                    window.removeNode(element.nodeid);
                    if (element.entities && element.entities.length > 0){
                        element.entities.forEach(function (entity){
                            window.updateEntityGoalMatched(entity,element.nodeid,'delete');
                        });

                    }
                });
                let root = {"type":"goalDto","category":"root","__gohashid":0,"nodeid":"0","key":"0","loc":"0 0","text":"Rivera Group","parent":"0","positions":[],"removed":false,"tags":[]};
                window.updateNode(root.nodeid, root).then (function(result){

                });
                window.resetEntities();
                console.log("reset to Root Done.");
                // console.log("Page Reloading...");
                // function a (){location.reload()};
                // setTimeout(a, 3000);

            });
        },
        resetEntities: window.resetEntities = function () {
            console.log("remove All goalsMatched and positions into Projects");
            window.getProjects().then(function (entities) {
                entities.forEach(function (element, i, arr) {
                    element.projectInfo.goalsMatched = [];
                    element.positions = [];
                    window.updateProject(element.id,element);
                });

                console.log("remove All goalsMatched Done.");
                console.log("Page Reloading...");
                function a (){location.reload()};
                setTimeout(a, 3000);

            });
        }
    };
    let stack = spAPIStack.create(self);
    return self;
}

export default spGoalplanningModel;
