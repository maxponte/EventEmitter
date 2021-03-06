(function () {
  'use strict';

  function EventEmitter() {
    this._events = {};
    this._maxListeners = 10;
  }

  EventEmitter.listenerCount = function(emitter, event) {
    if (emitter._events.hasOwnProperty(event)) {
      return emitter._events[event].length;
    }
    return 0;
  };

  EventEmitter.prototype.on = function (event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }
    if (this._events.hasOwnProperty(event)) {
      this._events[event].push(listener);
    } else {
      this._events[event] = [listener];
    }
    if (this._events[event].length === this._maxListeners + 1) {
      console.error('EventEmitter: Possible memory leak. More than the maximum number of listeners (' + this._maxListeners + ') added for event \'' + event + '\'. Increase this limit using emitter.setMaxListeners(n).');
      console.trace();
    }
    this.emit('newListener');
    return this;
  };

  EventEmitter.prototype.addEventListener = EventEmitter.prototype.on;

  EventEmitter.prototype.once = function (event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }
    this.on(event, function oncewrap() {
      this.removeListener(event, oncewrap);
      listener.apply(this, arguments);
    });
  };

  EventEmitter.prototype.removeListener = function (event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }
    if (!this._events.hasOwnProperty(event)) {
      return this;
    }
    this.emit('removeListener');
    var i;
    if (this._events[event].length === 1) {
      return this.removeAllListeners(event);
    }
    if (this._events[event] && (i = this._events[event].indexOf(listener)) !== -1) {
      this._events[event].splice(i, 1);
    }
    return this;
  };

  EventEmitter.prototype.removeAllListeners = function (event) {
    var n, i, that = this;
    if (event === undefined) {
      var keys = Object.keys(this._events).forEach(function (event) {
        if (event !== 'removeListener') {
          that.removeAllListeners(event);
        }
      });
      if (this._events.hasOwnProperty('removeListener')) {
        delete this._events['removeListener'];
      }
      return this;
    }
    if (!this._events.hasOwnProperty(event)) {
      return this;
    }
    n = this._events[event].length;
    for (i = 0; i < n; i++) {
      this.emit('removeListener');
    }
    delete this._events[event];
    return this;
  };

  EventEmitter.prototype.setMaxListeners = function (n) {
    this._maxListeners = n;
  };

  EventEmitter.prototype.listeners = function (event) {
    if (this._events.hasOwnProperty(event)) {
      return this._events[event];
    } else {
      return [];
    }
  };

  EventEmitter.prototype.emit = function (event) {
    var that = this, additionalArguments = Array.prototype.slice.call(arguments, 1);
    if (!this._events.hasOwnProperty(event)) {
      if (event === 'error') {
        throw new Error(arguments[1] || 'Uncaught error event. Attach an \'error\' event listener to handle this case.');
      }
      return false;
    }
    this._events[event].forEach(function (f) {
      f.apply(that, additionalArguments);
    });
    return true;
  };

  module.exports = EventEmitter;
  if (window) {
    window.EventEmitter = EventEmitter;
  }
}());
