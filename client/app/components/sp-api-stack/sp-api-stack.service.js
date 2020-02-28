'use strict';

let CPAPIStackFactory = function () {
  'ngInject';
  return {
      create: function(context){
          let _context = context;
          return {
              callbacks: {},
              addCallback: function (id, eventName, params) {
                  if (!this.callbacks[id] || !this.callbacks[id].length) {
                      this.callbacks[id] = [];
                  }
                  this.callbacks[id].push({
                      eventName: eventName,
                      params: params
                  });
              },
              callCallbacks: function (id, nodeId) {
                  if (this.callbacks[id] && this.callbacks[id].length > 0) {
                      this.callbacks[id].forEach((callback) => {
                          callback.params = Array.prototype.slice.call(callback.params);
                          for (let i = 0; i < callback.params.length; i++) {
                              if (typeof callback.params[i] === 'string' && callback.params[i].indexOf('unsaved') >= 0) {
                                  callback.params[i] = nodeId;
                                  break;
                              }
                          }
                          _context[callback.eventName].apply(_context, callback.params);
                      });
                      delete this.callbacks[id];
                  }
              }
          };
       }
  };
};

export default CPAPIStackFactory;