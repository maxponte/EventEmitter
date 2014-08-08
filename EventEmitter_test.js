//var EventEmitter = require('events').EventEmitter;
var EventEmitter = require('./EventEmitter.js');
var assert = require('assert');

(function () {
  'use strict';

  var e = new EventEmitter();

  function isPrime(n) {
    if (n % 2 === 0) {
      return false;
    }
    var i, sqrtn = ~~(Math.sqrt(n) + 1);
    for (i = 3; i < sqrtn; i += 2) {
      if (n % i === 0) {
        return false;
      }
    }
    return true;
  }

  var nErrors = 0;
  e.on('error', function (err) {
    nErrors++;
  });
  e.emit('error');
  e.emit('error');
  assert.equal(nErrors, 2);

  var primeProduct = 1;
  e.on('prime', function () {
    var i;
    for (i = 0; i < arguments.length; i++) {
      primeProduct *= arguments[i];
    }
  });
  e.emit('prime');
  e.emit('prime', 2);
  e.emit('prime', 3, 5);
  e.emit('prime', 7, 11, 13);
  assert.equal(primeProduct, 2 * 3 * 5 * 7 * 11 * 13);

  //Test if .listeners and EventEmitter.listenerCount work
  Object.keys(e._events).forEach(function (k) {
    assert.equal(e.listeners(k).length, EventEmitter.listenerCount(e, k));
  });

  var livesLived = 0;
  function liveLife() {
    livesLived++;
  }
  //add some junk listeners so we know once will remove our listener, not just any listener
  var i;
  for (i = 0; i < 10; i++) {
    e.on('live', function () {});
  }
  //Increase max listeners and add the real listener. This will crash if setMaxListeners fails
  e.setMaxListeners(11);
  e.once('live', liveLife);
  e.emit('live');
  e.emit('live');
  e.emit('live');
  //once should trigger a callback exactly one time and then delete the listener
  assert.equal(livesLived, 1);
  assert.equal(e.listeners('live').indexOf(liveLife), -1);

  var nListenersToRemove = Object.keys(e._events).map(function (k) {
    if (k === 'removeListener') {
      return 0;
    }
    var L = e.listeners(k);
    if (Array.isArray(L)) {
      return L.length;
    }
    return 1;
  }).reduce(function (x, y) {
    return x + y;
  });
  var nRemovedListeners = 0;
  e.on('removeListener', function () {
    nRemovedListeners++;
  });
  e.removeAllListeners();
  assert.equal(nRemovedListeners, nListenersToRemove);

  console.log('All Tests Passed.');
}());
