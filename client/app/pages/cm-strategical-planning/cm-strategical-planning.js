'use strict';

import Components from '../../components/components';
import Services from '../../services/services';
import CMStrategicalPlanningComponent from './cm-strategical-planning.component';

let CMStrategicalPlanningModule = angular.module('cmStrategicalPlanning', [
    Services,
    Components
])
    .config(function($mdIconProvider) {
        $mdIconProvider
            .icon("assign-search", "assets/strategical-planning-assets/icons/assign-search.svg", 24)
            .icon("more-vert", "assets/strategical-planning-assets/icons/more-vert.svg", 24)
            .icon("cancel", "assets/strategical-planning-assets/icons/cancel.svg", 24)
            .icon("zoom-out", "assets/strategical-planning-assets/icons/zoom-out.svg", 24)
            .icon("zoom-in", "assets/strategical-planning-assets/icons/zoom-in.svg", 24)
            .icon("center-adjust", "assets/strategical-planning-assets/icons/center-adjust.svg", 24)
            .icon("user-avatar", "assets/strategical-planning-assets/icons/avatar.svg", 24)
            .icon("warning", "assets/strategical-planning-assets/icons/warning-icon.svg", 24)
            .icon("close-small", "assets/strategical-planning-assets/icons/ic_clear_black_24px.svg", 24)
            .icon("restore", "assets/strategical-planning-assets/icons/ic_replay_black_24px.svg", 24)
            .icon("user-assign", "assets/strategical-planning-assets/icons/user-assign.svg", 32)
            .icon("cancel", "assets/strategical-planning-assets/icons/ic_cancel_black_24px.svg", 24)
            .icon("expand-more", "assets/strategical-planning-assets/icons/expand-more.svg", 24)
            .icon("expand-less", "assets/strategical-planning-assets/icons/expand-less.svg", 24)
            .icon("tags-cancel", "assets/strategical-planning-assets/icons/tags-cancel.svg", 24)
            .icon("delete-user", "assets/strategical-planning-assets/icons/delete-user.svg", 24)
            .icon("remove", "assets/strategical-planning-assets/icons/ic_delete_black_24px.svg", 24)
            .icon("close", "/assets/strategical-planning-assets/icons/close.svg", 24)
            .icon("selected", "/assets/strategical-planning-assets/icons/selected-user.svg", 24)
            .icon("delete-user-icon", "/assets/strategical-planning-assets/icons/delete-user-icon.svg", 24)
            .icon("add-entity", "/assets/strategical-planning-assets/icons/add-entity.svg", 24)
            .icon("project", "/assets/strategical-planning-assets/icons/project.svg", 24)
            .icon("BPM", "/assets/strategical-planning-assets/icons/BPM.svg", 24)
            .icon("add-sibling-department", "/assets/strategical-planning-assets/icons/add-sibling-department.svg", 24)
            .icon("add-sibling-position", "/assets/strategical-planning-assets/icons/add-sibling-position.svg", 24)
            .icon("add-department", "/assets/strategical-planning-assets/icons/add-department.svg", 24)
            .icon("add-position", "/assets/strategical-planning-assets/icons/add-position.svg", 24)
            .icon("ic_create_white_18px", "/assets/strategical-planning-assets/icons/ic_create_white_18px.svg", 24)
            .icon("remove-node", "/assets/strategical-planning-assets/icons/remove.svg", 24)
            .icon("person", "/assets/strategical-planning-assets/icons/person.svg", 24)
            .icon("add-group-of-users", "/assets/strategical-planning-assets/icons/add-group-of-users.svg", 24)
            .icon("zoom-in", "/assets/strategical-planning-assets/icons/v2-zoom-in.svg", 24)
            .icon("zoom-out", "/assets/strategical-planning-assets/icons/v2-zoom-out.svg", 24)
            .icon("zoom-default", "/assets/strategical-planning-assets/icons/v2-zoom-default.svg", 24)
            .icon("zoom-hand", "/assets/strategical-planning-assets/icons/v2-zoom-hand.svg", 24)
            .icon("zoom-pointer", "/assets/strategical-planning-assets/icons/v2-zoom-ponter.svg", 24)
            .icon("goal", "/assets/strategical-planning-assets/icons/goal.svg", 24)
            .icon("entity-bmp", "/assets/strategical-planning-assets/icons/entity-bpm.svg", 32)
            .icon("entity-close", "/assets/strategical-planning-assets/icons/ic-connection-default.svg", 32)
            .icon("entity-project", "/assets/strategical-planning-assets/icons/entity-project.svg", 32)
            .icon("entity-open", "/assets/strategical-planning-assets/icons/ic-connection-open.svg", 32)
            .icon("entity-close-hovered", "/assets/strategical-planning-assets/icons/ic-connections-hover.svg", 32)
            .icon("entity-risk", "/assets/strategical-planning-assets/icons/entity-risk.svg", 16)
            .icon("goto", "/assets/strategical-planning-assets/icons/goto-right-panel.svg", 16)
            .icon("comment", "/assets/strategical-planning-assets/icons/comment-icon.svg", 32)
            .icon("private", "/assets/strategical-planning-assets/icons/private.svg", 32)
            .icon("private-hover", "/assets/strategical-planning-assets/icons/private-hover.svg", 32)
            .icon("lock", "/assets/strategical-planning-assets/icons/lock.svg", 16)
            .icon("notifications", "/assets/strategical-planning-assets/icons/notifications-icon.svg", 32)
            .icon("sp-edit", "/assets/strategical-planning-assets/icons/edit.svg", 24)
            .icon("sp-delete", "/assets/strategical-planning-assets/icons/sp-comment-delete.svg", 24)
            .icon("sp-attention", "/assets/strategical-planning-assets/icons/attention-icon.svg", 32)
            .icon("sp-refresh", "/assets/strategical-planning-assets/icons/ic_refresh_24px.svg", 24);
    })
    .component('cmStrategicalPlanning', CMStrategicalPlanningComponent)

    .name;

export default CMStrategicalPlanningModule;
