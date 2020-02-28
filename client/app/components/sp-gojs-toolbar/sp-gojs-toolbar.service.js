'use strict';

let SPGojsToolbarFactory = function () {
  'ngInject';

  let $ = go.GraphObject.make;
  let toolbarIcons = {
      "addDepartment": {
          _tooltip: "Add child department",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 16, 12),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/add-department.svg"
      },
      "addPosition": {
          _tooltip: "Add child position",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 18, 10),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/add-position.svg"
      },
      "addSiblingDepartment": {
          _tooltip: "Add sibling department",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 20, 15),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/add-sibling-department.svg"
      },
      "addSiblingPosition": {
          _tooltip: "Add sibling position",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 20, 13),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/add-sibling-position.svg"
      },
      "addDepartmentV2": {
          _tooltip: "Add child department",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 18, 16),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/v2-add-department.svg"
      },
      "addPositionV2": {
          _tooltip: "Add child position",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 20, 16),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/v2-add-position.svg"
      },
      "addPositionToV2": {
          _tooltip: "Add child position",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 18, 10),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/v2-position-to-department.svg"
      },
      "addSiblingDepartmentV2": {
          _tooltip: "Add sibling department",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 18, 16),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/v2-add-sibling-department-2.svg"
      },
      "addSiblingPositionV2": {
          _tooltip: "Add sibling position",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 14, 16),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/v2-add-sibling-position.svg"
      },
      "edit": {
          _tooltip: "Edit name",
          width: 40,
          height: 48,
          sourceRect: new go.Rect(0, 0, 18, 18),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/ic_create_white_18px.svg"
      },
      "remove": {
          _tooltip: "Remove",
          width: 48,
          height: 48,
          sourceRect: new go.Rect(0, 0, 12, 17),
          scale: 1,
          source: "/assets/strategical-planning-assets/icons/remove.svg"
      }
  };

  go.Shape.defineFigureGenerator("ToolbarShape", function (shape, w, h) {
      let geo = new go.Geometry();
      let radius = 2;

      // a single figure consisting of straight lines and quarter-circle arcs
      geo.add(new go.PathFigure(0, radius)
      .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, radius, radius, radius, radius))
      .add(new go.PathSegment(go.PathSegment.Line, w - radius, 0))
      .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - radius, radius, radius, radius))
      .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - radius, h - radius, radius, radius))
      .add(new go.PathSegment(go.PathSegment.Line, radius, h))
      .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, radius, h - radius, radius, radius).close()));
      return geo;
  });
  
  return {
      makeToolbarAdornment: function (configuration) {
          let config = configuration;
          if (!config) config = {};

          let toolbar = $(go.Panel, "Horizontal");
          if (config.buttons && config.buttons.length > 0) {
              config.buttons.forEach(function (button) {
                  if (!toolbarIcons[button.id]) return;
                  toolbar.add($(go.Picture, Object.assign({}, toolbarIcons[button.id],
                      {
                          imageStretch: go.GraphObject.None,
                          imageAlignment: go.Spot.Center,
                          cursor: "pointer",
                          isActionable: true,
                          click: button.click,
                          toolTip: $(go.Adornment, "Auto",
                              $(go.Shape, {fill: "rgba(97, 97, 97, 0.9)", strokeWidth: 0}),
                              $(go.TextBlock,
                                  {
                                      text: button.tooltip || toolbarIcons[button.id]._tooltip || "",
                                      margin: new go.Margin(5, 8, 4, 8),
                                      font: "500 10px Roboto",
                                      stroke: "#FFF"
                                  }
                              )
                          )

                      }),
                      button.binding || {}
                  ));
              });
          }
          let toolbarMulty = $(go.Panel, "Horizontal");
          if (config.buttonsMulty && config.buttonsMulty.length > 0) {
              config.buttonsMulty.forEach(function (button) {
                  if (!toolbarIcons[button.id]) return;
                  toolbarMulty.add($(go.Picture, Object.assign({}, toolbarIcons[button.id],
                      {
                          imageStretch: go.GraphObject.None,
                          imageAlignment: go.Spot.Center,
                          cursor: "pointer",
                          isActionable: true,
                          click: button.click,
                          toolTip: $(go.Adornment, "Auto",
                              $(go.Shape, {fill: "rgba(97, 97, 97, 0.9)", strokeWidth: 0}),
                              $(go.TextBlock,
                                  {
                                      text: button.tooltip || toolbarIcons[button.id]._tooltip || "",
                                      margin: new go.Margin(5, 8, 4, 8),
                                      font: "500 10px Roboto",
                                      stroke: "#FFF"
                                  }
                              )
                          )

                      }),
                      button.binding || {}
                  ));
              });

          }
          
          return $(go.Adornment, "Vertical",
              $(go.Panel, "Auto",
                  {
                      name: "Toolbar",
                      isActionable: true,
                      margin: new go.Margin(0, 0, (typeof config.margin === 'number' ? config.margin : 0), 0)
                  },
                  new go.Binding('visible', 'isSelected', function (value, node) {
                      if (node.diagram.selection.count > 1) {
                              let first = node.diagram.selection.first();
                              let adornment = first && first.adornments.first();
                              let toolbar = adornment && adornment.findObject("Toolbar");
                              toolbar && (toolbar.visible = false);
                      }
                      return node.diagram.selection.count === 1;
                  }).ofObject(),
                  new go.Binding('visible', '_dragging', function (value) {
                      return !value;
                  }),
                  $(go.Shape, "ToolbarShape",
                      {
                          fill: "rgba(0, 0, 0, 0.87)",
                          strokeWidth: 0,
                          height: 48
                      }
                  ),
                  toolbar
              ),
              $(go.Panel, "Auto",
                  {
                      name: "ToolbarMulty",
                      isActionable: true,
                      margin: new go.Margin(0, 0, (typeof config.margin === 'number' ? config.margin : 0), 0)
                  },
                  new go.Binding('visible', 'isSelected', function (value, node) {
                      let adornment = null;
                      let toolbar = null;
                      let multy = false;
                      if (node.diagram.selection.count > 1) {
                          let count = node.diagram.selection.count - 1;
                          let i = 0;
                          node.diagram.selection.each(function(item){
                              adornment = item && item.adornments.first();
                              toolbar = adornment && adornment.findObject("ToolbarMulty");
                              toolbar && (toolbar.visible = false);
                              if (i === count) {
                                  if (item.data.nodeid === node.panel.data.nodeid) {
                                      multy = true;
                                  }
                              }
                              i++;
                          });

                          if(multy) {
                              return true;
                          }
                      }
                      return false;
                  }).ofObject(),
                  $(go.Shape, "ToolbarShape",
                      {
                          fill: "rgba(0, 0, 0, 0.87)",
                          strokeWidth: 0,
                          height: 48
                      }
                  ),
                  toolbarMulty
              ),
              $(go.Panel, "Auto",
                  $(go.Shape,
                      {
                          fill: null,
                          stroke: 'rgb(63,81,181)',
                          strokeWidth: config.strokeWidth || 0
                      }
                  ),
                  $(go.Placeholder)
              )
          )
      }
  };
};

export default SPGojsToolbarFactory;