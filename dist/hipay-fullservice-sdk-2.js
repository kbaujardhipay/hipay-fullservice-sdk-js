/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.1.1
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === GET_THEN_ERROR) {
      reject(promise, GET_THEN_ERROR.error);
      GET_THEN_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator$1(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate(input);
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

Enumerator$1.prototype._enumerate = function (input) {
  for (var i = 0; this._state === PENDING && i < input.length; i++) {
    this._eachEntry(input[i], i);
  }
};

Enumerator$1.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$1 = c.resolve;

  if (resolve$$1 === resolve$1) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise$3) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$1) {
        return resolve$$1(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$1(entry), i);
  }
};

Enumerator$1.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator$1.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all$1(entries) {
  return new Enumerator$1(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race$1(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise$3(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise$3 ? initializePromise(this, resolver) : needsNew();
  }
}

Promise$3.all = all$1;
Promise$3.race = race$1;
Promise$3.resolve = resolve$1;
Promise$3.reject = reject$1;
Promise$3._setScheduler = setScheduler;
Promise$3._setAsap = setAsap;
Promise$3._asap = asap;

Promise$3.prototype = {
  constructor: Promise$3,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

/*global self*/
function polyfill$1() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise$3;
}

// Strange compat..
Promise$3.polyfill = polyfill$1;
Promise$3.Promise = Promise$3;

Promise$3.polyfill();

return Promise$3;

})));

//# sourceMappingURL=es6-promise.auto.map

;
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

;
(function(self) {
  'use strict';

  // if __disableNativeFetch is set to true, the it will always polyfill fetch
  // with Ajax.
  if (!self.__disableNativeFetch && self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob, options) {
    var reader = new FileReader()
    var contentType = options.headers.map['content-type'] ? options.headers.map['content-type'].toString() : ''
    var regex = /charset\=[0-9a-zA-Z\-\_]*;?/
    var _charset = blob.type.match(regex) || contentType.match(regex)
    var args = [blob]

    if(_charset) {
      args.push(_charset[0].replace(/^charset\=/, '').replace(/;$/, ''))
    }

    reader.readAsText.apply(reader, args)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body, options) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
        this._options = options
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob, this._options)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body, options)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit, options)
    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      var __onLoadHandled = false;

      function onload() {
        if (xhr.readyState !== 4) {
          return
        }
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          if (__onLoadHandled) { return; } else { __onLoadHandled = true; }
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;

        if (__onLoadHandled) { return; } else { __onLoadHandled = true; }
        resolve(new Response(body, options))
      }
      xhr.onreadystatechange = onload;
      xhr.onload = onload;
      xhr.onerror = function() {
        if (__onLoadHandled) { return; } else { __onLoadHandled = true; }
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      // `withCredentials` should be setted after calling `.open` in IE10
      // http://stackoverflow.com/a/19667959/1219343
      try {
        if (request.credentials === 'include') {
          if ('withCredentials' in xhr) {
            xhr.withCredentials = true;
          } else {
            console && console.warn && console.warn('withCredentials is not supported, you can ignore this warning');
          }
        }
      } catch (e) {
        console && console.warn && console.warn('set withCredentials error:' + e);
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true

  // Support CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = self.fetch;
  }
})(typeof self !== 'undefined' ? self : this);

;
/*
 * ! https://github.com/davidchambers/Base64.js
 */
;(function () {

    var object = typeof exports != 'undefined' ? exports : this; // #8: web
    // workers
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
        this.message = message;
    }
    InvalidCharacterError.prototype = new Error;
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    // encoder
    // [https://gist.github.com/999166] by [https://github.com/nignag]
    object.btoa || (
        object.btoa = function (input) {
            for (
                // initialize result and counter
                var block, charCode, idx = 0, map = chars, output = '';
                // if the next input index does not exist:
                // change the mapping table to "="
                // check if d has no fractional digits
                input.charAt(idx | 0) || (map = '=', idx % 1);
                // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
                output += map.charAt(63 & block >> 8 - idx % 1 * 8)
            ) {
                charCode = input.charCodeAt(idx += 3/4);
                if (charCode > 0xFF) {
                    throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
                }
                block = block << 8 | charCode;
            }
            return output;
        });

    // decoder
    // [https://gist.github.com/1020396] by [https://github.com/atk]
    object.atob || (
        object.atob = function (input) {
            input = input.replace(/=+$/, '')
            if (input.length % 4 == 1) {
                throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
            }
            for (
                // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                buffer = input.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii
                // value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
            ) {
                // try to find character in table (0-63, not found => -1)
                buffer = chars.indexOf(buffer);
            }
            return output;
        });

}());
;
/**
 * HiPay Fullservice library
 *
 * # Introduction
 *
 * This module allows to create a token with credit or debit card through the HiPay API. The [source code](https://github.com/hipay/hipay-fullservice-sdk-js) is available on Github.
 *
 * <br/>
 * <br/>
 *
 * # Getting started and examples
 *
 * <br/>
 *
 * ## Setting environment type
 *
 * ```
 *  HiPay.setTarget('stage'); // default is production
 * ```
 *
 * <br/>
 *
 * ## Setting credentials to tokenize on HiPay API
 * ```
 * HiPay.setCredentials('API_CREDENTIAL_USERNAME', 'API_CREDENTIAL_PASSWORD');
 * ```
 *
 * <br/>
 *
 * ## Setting customer country to get available payment product of the selected ISO 3166-1 alpha-2 country code.
 * ```
 * HiPay.setAvailalblePaymentProductsCustomerCountry(COUNTRY_ISO3166-1_alpha-2);
 * example :
 * HiPay.setAvailalblePaymentProductsCustomerCountry('FR');
 * ```
 *
 * <br/>
 *
 * ## Setting currency to get available payment product of the selected ISO 4217 currency code
 * ```
 *  HiPay.setAvailalblePaymentProductsCurrency(CURRENCY_ISO_4217);
 *  example :
 *  HiPay.setAvailalblePaymentProductsCurrency('EUR);
 * ```
 * <br/>
 *
 * ## Payment products list enabled
 * ```
 *  HiPay.enabledPaymentProducts({Array payment product});
 *  example :
 *  HiPay.enabledPaymentProducts(['visa', 'maestro']);
 * ```
 * <br/>
 *
 * ## Set locale
 * ```
 *  HiPay.Form.setLocale({LOCALE_CODE});
 *  fr_FR or en_EN
 *  example :
 *  HiPay.enabledPaymentProducts('fr_FR');
 * ```
 * <br/>
 *
 * ## Helper to display information about the 3 or 4 digits security code that customer have to mention in the payment form.
 * The translation of this message is base on the language set with the method : HiPay.Form.setLocale();
 * ```
 *  HiPay.Form.CVVHelpText();
 *
 * ```
 * <br/>
 *
 *  ## Helper to display information about the 3 or 4 digits security code that customer have to mention in the payment form. It contains type and length of the card security code.
 *
 * ```
 *  HiPay.getCVVInformation();
 *
 * ```
 * <br/>
 *
 * ## Payment form is valid. Return true if payment form is valid or false if not.
 * ```
 *  HiPay.Form.paymentFormDataIsValid();
 *
 * ```
 * <br/>
 *
 * ## Payment form error. Return a list of error if the payment form is not valid.
 * ```
 *  HiPay.Form.paymentFormDataGetErrors();
 *
 * ```
 * <br/>
 *
 *
 * @class HiPay
 * @param {HiPay} HiPay itself.
 *
 */
var HiPay = (function (HiPay) {

    var HiPay = {};

    /**
     *
     * @class HiPay.Form
     *
     */
    HiPay.Form = {};

    /**
     * The user locale. You need to set this value in order to translate placeholder, error message, ... in the user language if supported. The fallbackLocale value is used otherwise.
     *
     * @property HiPay.Form.locale
     * @default "en_EN"
     * @type string (fr_FR or en_EN)
     * @example
     *     HiPay.Form.locale = "fr_FR";
     */
    HiPay.Form.locale = "en_EN";

    var _endPointTokenize = {
        stage: 'https://stage-secure2-vault.hipay-tpp.com/rest/v2/token/create.json',
        production: 'https://secure2-vault.hipay-tpp.com/rest/v2/token/create.json'
    };

    var _endPointAvailablePaymentProducts = {
        stage: 'https://stage-secure-gateway.hipay-tpp.com/rest/v2/available-payment-products',
        production: 'https://stage-secure-gateway.hipay-tpp.com/rest/v2/available-payment-products'
    };

    var _separatorMonthYear = ' / ';

    var _maxYearExpiry = 30;

    var _translationJSON = {
        "en_EN" : {
            "FORM_CVV_3_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). It's the 3-digits number on the back of your card for VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). The AMERICAN EXPRESS security code is the 4-digits number on the front of your card.",
            "FORM_ERROR_INVALID_CARD_HOLDER": "The name field must contain maximum %NUMBER% digits.",
            "FORM_ERROR_INVALID_CARD_NUMBER": "Invalid card number.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "The expiration date is already past.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "The month field must be between 1 and 12.",
            "FORM_ERROR_INVALID_CVV": "The CVV field must contain %NUMBER% digits.",
            "FORM_ERROR_DEFAULT": "An error occured.",
            "FORM_PLACEHOLDER_CARD_NUMBER": "Ex : 5136 0000 0000 0000",
            "FORM_PLACEHOLDER_CARD_HOLDER": "FirstName LastName",
            "FORM_PLACEHOLDER_CARD_EXPIRY_DATE": "MM"+_separatorMonthYear+"YY",
            "FORM_PLACEHOLDER_CARD_CVV": "123",
            "FORM_PLACEHOLDER_CARD_CVV_AMEX": "1234"
        },
        "fr_FR" : {
            "FORM_CVV_3_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Ce code correspond aux 3 chiffres visibles au verso de votre carte VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Le code de securité AMERICAN EXPRESS est un nombre à 4 chiffres au recto de votre carte.",
            "FORM_ERROR_INVALID_CARD_HOLDER": "Le champ nom doit contenir au maximum %NUMBER% caractères.",
            "FORM_ERROR_INVALID_CARD_NUMBER": "Numéro de carte invalide.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "La date est inférieure à la date actuelle.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "Le mois doit être compris entre 1 et 12.",
            "FORM_ERROR_INVALID_CVV": "Le champ CVV doit contenir %NUMBER% caractères.",
            "FORM_ERROR_DEFAULT": "Une erreur est survenue.",
            "FORM_PLACEHOLDER_CARD_NUMBER": "Ex : 5136 0000 0000 0000",
            "FORM_PLACEHOLDER_CARD_HOLDER": "Prénom Nom",
            "FORM_PLACEHOLDER_CARD_EXPIRY_DATE": "MM"+_separatorMonthYear+"AA",
            "FORM_PLACEHOLDER_CARD_CVV": "123",
            "FORM_PLACEHOLDER_CARD_CVV_AMEX": "1234"
        }
    };

    var _loadPaymentProduct;

    var _getLocaleTranslationWithId = function(id) {
        return _translationJSON[HiPay.Form.locale][id];
    };

    var _cvvContainerId = "container-cvv-help-message";

    var _idInputMapper = {
        cardNumber: 'card-number',
        cardType: 'card-type',
        cardHolder: 'card-holder',
        cardExpiryDate: 'card-expiry-date',
        cardExpiryMonth: 'card-expiry-month',
        cardExpiryYear: 'card-expiry-year',
        cardCVV: 'card-cvv',
        payButton: 'pay-button'
    };


    var _idProductAPIMapper = {
        'visa': 'card_visa_info',
        'mastercard': 'card_mastercard_info',
        'diners': 'card_diners_info',
        'american-express': 'card_american_express_info',
        'maestro': 'card_maestro_info',
        'bcmc': 'card_bcmc_info'
    };

    var _idCVVMapper = {
        card_visa_info: "CVV",
        card_mastercard_info: "CVC",
        card_american_express_info: "CID"

    };
    var _cardImg = {
        card_visa_info: "ic_credit_card_visa.png",
        card_mastercard_info: "ic_credit_card_mastercard.png",
        card_diners_info: "ic_credit_card_diners.png",
        card_american_express_info: "ic_credit_card_amex.png",
        card_maestro_info: "ic_credit_card_maestro.png",
        card_bcmc_info: "ic_credit_card_bcmc.png"
    }

    var _creditCardCVVMaxLength = 3;

    var _cardFormatDefinition = {
        card_visa_info:
        {
            "ranges":[
                {
                    "first": 4,
                    "variable": null
                }
            ],

            "lengths": {
                "length": 16,
                "variable": null
            },

            "format":[4,4,4]
        },
        card_mastercard_info:
        {
            "ranges":[

                {
                    "first": 51,
                    "variable": 4
                }
            ],

            "lengths": {
                "length": 16,
                "variable": null
            },

            "format":[4,4,4]
        },
        card_diners_info:
        {
            "ranges":[

                {
                    "first": 300,
                    "variable": 5
                },

                {
                    "first": 38,
                    "variable": 1
                },

                {
                    "first": 2014,
                    "variable": null
                },

                {
                    "first": 2149,
                    "variable": null
                },

                {
                    "first": 309,
                    "variable": null
                },

                {
                    "first": 36,
                    "variable": null
                }
            ],
            "lengths": {
                "length": 14,
                "variable": 1
            },

            "format":[4,6]
        },
        card_american_express_info:
        {
            "ranges":[

                {
                    "first": 34,
                    "variable": null
                },

                {
                    "first": 37,
                    "variable": null
                }

            ],

            "lengths": {
                "length": 15,
                "variable": null
            },

            "format":[4,6]
        },
        card_maestro_info:
        {
            "ranges":[

                {
                    "first": 50,
                    "variable": null
                },

                {
                    "first": 56,
                    "variable": 13
                }

            ],

            "lengths": {
                "length": 12,
                "variable": 7
            },

            "format":[4,4,4,4]
        },
        card_bcmc_info:
        {
            "ranges": [
                {
                    "first": 670300,
                    "variable": 100
                }
            ],
            "lengths": {
                "length": 17
            },
            "format": [4, 4, 4, 4, 1]
        }
    };



    function _testSelector(selector){
        try {
            return document.querySelector(selector) !== null;
        } catch(e) { return false; }
    }

    function _focusNextElement() {

        var focussableElements = "button:not([disabled]), input:not([disabled]):not([tabindex='-1'])";
        var focussableElementsOldBrowser = "button, input[data-hipay-tabable='true']";
        if (document.activeElement) {

            if (_testSelector(focussableElements)) {
                var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
                    function (element) {
                        return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                    });
            } else {
                var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElementsOldBrowser),
                    function (element) {
                        return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                    });
            }

            var index = focussable.indexOf(document.activeElement);

            focussable[index + 1].focus();
        } else {
            element.nextElementSibling.focus();
        }
    };

    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };
    /**
     * dump
     */
    function dump(obj) {
        var out = '';
        for (var i in obj) {
            out += i + ": " + obj[i] + " - ";
        }

        alert(out);
        // or, if you wanted to avoid alerts...
        // var pre = document.createElement('pre');
        // pre.innerHTML = out;
        // document.body.appendChild(pre)
    };

    var _isBrowser=new Function("try {return this===window;}catch(e){ return false;}");


    var _extend = function () {

        // Variables btoa
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };
        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;
    };

    var _Error = function (code, message) {
        _processObjectPayload(this, {
            code: code,
            message: message
        });
    };

    // Properties: browser compatibility
    var _canDefineProperty = (typeof Object.defineProperty === 'function');

    if (_canDefineProperty) {
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            _canDefineProperty = false;
        }
    }

    if (_canDefineProperty) {
        Object.defineProperties(HiPay, {

            allowedParameters: {
                enumerable: true, writable: true, value:{
                    'card_number':true,
                    'card_holder':true,
                    'card_expiry_month':true,
                    'card_expiry_year':true,
                    'cvc':true,
                    'multi_use':true,
                    'generate_request_id':true
                }
            },

            /*
             * The target type stage or production to make HiPay API calls in stage or production environment.
             *
             * @property target
             * @default "production"
             * @type string (stage or production)
             * @example
             *      HiPay.target = "stage";
             */

            target: {enumerable: true, writable: true, value:'production'},

            /*
             * The username. You must provide this value in order to be able to make API calls.
             *
             * @property username
             * @type string
             */

            username: {enumerable: false, writable: true},

            /*
             * The user public key. You must provide this value in order to be able to make API calls.
             *
             * @property password
             * @type string
             */

            password: {enumerable: false, writable: true}
        });
    }

    else {
        allowedParameters = {
            enumerable: true, writable: true, value:{
                'card_number':true,
                'card_holder':true,
                'card_expiry_month':true,
                'card_expiry_year':true,
                'cvc':true,
                'multi_use':true,
                'generate_request_id':true
            }
        }
        // HiPayPrivate.target = 'production';
    }

    // Define property helper
    var _defineProperties = function(object, properties) {
        for (var key in properties) {
            // properties[key].propertyDescriptors = Object.assign({}, {enumerable: true, writable: false, configurable: false}, properties[key].propertyDescriptors || {});
            properties[key].propertyDescriptors = _extend({}, {enumerable: true, writable: false, configurable: false}, properties[key].propertyDescriptors || {});

        }
        // var mapping = Object.assign({}, object.prototype._mapping || {}, properties);
        var mapping = _extend({}, object.prototype._mapping || {}, properties);


        if (_canDefineProperty) {
            Object.defineProperties(object.prototype, {
                "_mapping": {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: mapping
                }
            });

        } else {
            object.prototype._mapping = mapping;
        }

        if (_canDefineProperty) {
            var propConfig = {};
            for (var key in properties) {
                var valueProp = properties[key];
                propConfig[valueProp.name] = valueProp.propertyDescriptors;
            }

            Object.defineProperties(object.prototype, propConfig);
        }
    };

    var _bootstrapInstanceProperties = function (instance) {
        if (_canDefineProperty) {
            var propertyConfig = [];
            for (var key in instance._mapping) {
                var val =  instance._mapping[key];
                propertyConfig[val.name] = _extend({}, true, val.propertyDescriptors.clone, {
                    writable: true,
                    configurable: true
                });
            }
            Object.defineProperties(instance, propertyConfig);
        }
    };

    var _doGetCaretPosition = function (ctrl)
    {
        var CaretPos = 0;

        if (ctrl.selectionStart || ctrl.selectionStart == 0)
        {// Standard.
            CaretPos = ctrl.selectionStart;
        }
        else if (document.selection)
        {// Legacy IE
            ctrl.focus ();
            var Sel = document.selection.createRange ();
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }

        return (CaretPos);
    }

    var _setCaretPosition = function(ctrl,pos)
    {
        if (ctrl.setSelectionRange)
        {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange)
        {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    var _getSelection = function (target) {
        var s = {start: 0, end:0};
        if (typeof target.selectionStart == "number"
            && typeof target.selectionEnd == "number") {
            // Firefox (and others)
            s.start = target.selectionStart;
            s.end = target.selectionEnd;
        } else if (document.selection) {
            // IE
            var bookmark = document.selection.createRange().getBookmark();
            var sel = target.createTextRange();
            var bfr = sel.duplicate();
            sel.moveToBookmark(bookmark);
            bfr.setEndPoint("EndToStart", sel);
            s.start = bfr.text.length;
            s.end = s.start + sel.text.length;
        }
        return s;
    }


    var _instanceServiceCreditCard = null;

    var _serviceCreditCard = function(charCode) {

        var serviceCreditCard = {};

        serviceCreditCard.creditCardHolderLengthMax = 60;
        serviceCreditCard.creditCardCVVLengthMax = _creditCardCVVMaxLength;
        serviceCreditCard.cardFormatArray = [];

        serviceCreditCard.getCreditCardHolderInput = function() {
            return _selectElementWithHipayId(_idInputMapper.cardHolder);
        };

        serviceCreditCard.getCreditCardNumberInput = function() {
            return _selectElementWithHipayId(_idInputMapper.cardNumber);
        };

        serviceCreditCard.getCreditCardNumberValue = function() {
            return _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
        };



        serviceCreditCard.getCardFormatArray = function() {

        };

        serviceCreditCard.getCreditCardCVVLengthMax = function(forceReload) {
            if (typeof serviceCreditCard.creditCardCVVLengthMax == "undefined" || typeof forceReload == "undefined" || forceReload == true) {

                var arrayFormatCVV = ['34', '35', '36', '37'];
                var creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
                for (var indexFormatCVV = 0; indexFormatCVV < arrayFormatCVV.length; indexFormatCVV++) {

                    if (creditCardNumber != "" && typeof arrayFormatCVV[indexFormatCVV]  != "undefined" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }
            }
            return serviceCreditCard.creditCardCVVLengthMax;
        };

        serviceCreditCard.setCreditCardCVVMaxLength = function(cardCVVMaxLength) {
            _creditCardCVVMaxLength = cardCVVMaxLength;
        }

        serviceCreditCard.getCardTypeId = function() {
            serviceCreditCard.initInfoCardWithCardNumber();
            return serviceCreditCard.idType;
        }


        serviceCreditCard.getTypeWithCardNumber = function(creditCardNumber) {

            var creditCardNumberUnformatted;

            if (typeof creditCardNumber != "undefined") {
                creditCardNumberUnformatted = creditCardNumber.split(' ').join('');
            }
            var cardType;

            var countMatchType = 0;

            for (var propt in _cardFormatDefinition) {
                /* range */
                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {
                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumberUnformatted.indexOf(startNumber) === 0) {
                                serviceCreditCard.idType = propt;
                                cardType = propt;
                                countMatchType++;
                                // break;
                            } else {

                            }
                        }
                    } else {
                        if (creditCardNumberUnformatted.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            serviceCreditCard.idType = propt;
                            cardType = propt;
                            countMatchType++;
                            // break;
                        }
                    }
                }
                /* ./ range */
            }
            // if (countMatchType > 1) {
            //     cardType = "";
            // }

            return cardType;
        };

        serviceCreditCard.initInfoCardWithCardNumber = function(creditCardNumber) {

            var creditCardNumberUnformatted;

            var countMatchType = 0;

            var idType;
            var cardFormatArray;

            if (typeof creditCardNumber  == "undefined") {
                creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
            }

            if (typeof creditCardNumber != "undefined") {
                creditCardNumberUnformatted = creditCardNumber.split(' ').join('');
            }

            if (_selectElementWithHipayId(_idInputMapper['cardType'])) {
                _selectElementWithHipayId(_idInputMapper['cardType']).src = "";
                _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'display:none;');
                _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'visibility:hidden;');
            }
            for (var propt in _cardFormatDefinition) {

                /* range */
                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumberUnformatted.indexOf(startNumber) === 0) {
                                idType = propt;
                                countMatchType++;
                                // break;
                            } else {

                            }
                        }
                    } else {
                        if (creditCardNumberUnformatted.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            idType = propt;
                            countMatchType++;
                            // break;
                        }
                    }
                }
                /* ./ range */
            }


            if (idType) {
                serviceCreditCard.idType = idType;
                if (_selectElementWithHipayId(_idInputMapper['cardType'])) {

                    _selectElementWithHipayId(_idInputMapper['cardType']).src = "./img/type/" + _cardImg[idType];
                    _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'display:block;');
                    _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'visibility:visible;');
                    _updatePlaceholderCVV(serviceCreditCard.idType);
                }

                serviceCreditCard.cardFormatArray = _cardFormatDefinition[idType]["format"];
                /* length */
                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[idType]["lengths"]["length"];
                if (_cardFormatDefinition[idType]["lengths"]["variable"] != null) {
                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[idType]["lengths"]["variable"];
                }
                /* ./ length */
            }

        };

        serviceCreditCard.unformatCreditCardNumber = function(cardNumberStringFormatted) {
            if (typeof cardNumberStringFormatted != "undefined") {
                return cardNumberStringFormatted.split(' ').join('');
            }
            return cardNumberStringFormatted;
        }
        var _inputCCNumberFinish = function(element) {

            var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber([]);

            if ( _selectElementWithHipayId(_idInputMapper['cardCVV'])) {
                _selectElementWithHipayId(_idInputMapper['cardCVV']).disabled = false;
            }
            if ( serviceCreditCard.cardNumberStringFormatAfter != '') {

                // if maestro cvc disabled
                if (serviceCreditCard.idType == 'card_bcmc_info') {

                    var cvvElement =  _selectElementWithHipayId(_idInputMapper.cardCVV);
                    if (null !== cvvElement) {
                        cvvElement.value = "";

                        if (!cvvElement.classList.contains('inputdisabled')) {
                            // The box that we clicked has a class of bad so let's remove it and add the good class
                            // this.classList.remove('bad');
                            cvvElement.classList.add('inputdisabled');
                        } else {
                            cvvElement.classList.remove('inputdisabled');
                            // The user obviously can't follow instructions so let's alert them of what is supposed to happen next
                        }

                        // inputdisable
                        cvvElement.disabled = true;
                    }
                }

            }
            if(serviceCreditCard.cardNumberStringFormatAfter != '' && validatorCreditCardNumber.isValid( _selectElementValueWithHipayId(_idInputMapper['cardNumber']))) {
                _focusNextElement();
            }
            else {
                if (serviceCreditCard.cardLengthMax == serviceCreditCard.cardNumberStringAfter.length && !validatorCreditCardNumber.isValid(_selectElementValueWithHipayId(_idInputMapper['cardNumber']))) {
                    // validatorCreditCardNumber.displayErrorMessage()

                    //  _selectElementWithHipayId("creditCardNumberMessageContainer").innerHTML="Le format de la carte n'est pas valide";

                }
            }
        };

        var _inputCardExpiryDateFinish = function(element) {

            var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate([]);

            var lengthCardExpiry = 4 + _separatorMonthYear.length;

            if (_selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']) && lengthCardExpiry == _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']).length && validatorCreditCardExpiryDate.isValid( _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate'])) === true ) {
                _focusNextElement();
            } else {
                if ( _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']) && 7 == _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']).length && validatorCreditCardExpiryDate.isValid(_selectElementValueWithHipayId(_idInputMapper['cardExpiryDate'])) === false) {


                }
            }
        };


        serviceCreditCard.validatorCreditCardNumber = function(errorArray) {
            var validatorCreditCardNumber = {};


            validatorCreditCardNumber.errorCollection = errorArray || [];

            validatorCreditCardNumber.isPotentiallyValid = function(creditCardNumber) {

                var creditCardNumberUnformatted;

                if (typeof creditCardNumber != "undefined") {
                    creditCardNumberUnformatted = creditCardNumber.split(' ').join('');
                }

                var isPotentiallyValid = false;
                var startNumberArray = [];
                for (var propt in _cardFormatDefinition) {
                    /* range */
                    for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                        if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {
                            for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                                startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"] + j, propt]);
                            }
                        } else {
                            startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"], propt]);

                        }
                    }
                    /* ./ range */
                }

                var startNumber;
                var startNumberToCompare;

                var cardNumberMaxLength = 23;

                var propt;
                for (var indexNumber = 0; indexNumber < startNumberArray.length; indexNumber++) {
                    startNumber = startNumberArray[indexNumber][0].toString();
                    propt = startNumberArray[indexNumber][1].toString();
                    if (startNumber) {
                        startNumberToCompare = startNumber.substr(0, Math.min(startNumber.length, creditCardNumber.length));
                        if (startNumberToCompare && creditCardNumber.indexOf(startNumberToCompare) === 0) {
                            cardNumberMaxLength = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                cardNumberMaxLength = cardNumberMaxLength + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }

                            if (creditCardNumberUnformatted.length < cardNumberMaxLength) {
                                isPotentiallyValid = true;
                                break;
                            } else if (creditCardNumberUnformatted.length == cardNumberMaxLength) {
                                if (_isLuhnValid(creditCardNumberUnformatted) === true) {
                                    isPotentiallyValid = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (typeof serviceCreditCard.getCardTypeId() != "undefined" && _isEnabled(serviceCreditCard.getCardTypeId()) === false) {
                    isPotentiallyValid = false;
                }

                if (isPotentiallyValid == false) {
                    validatorCreditCardNumber.isValid(creditCardNumber);
                }
                return isPotentiallyValid;
            }

            validatorCreditCardNumber.isValid = function (creditCardNumberUnformatted) {

                if (typeof creditCardNumberUnformatted != "undefined") {
                    creditCardNumberUnformatted = creditCardNumberUnformatted.split(' ').join('');
                }

                if (_isEnabled(serviceCreditCard.getCardTypeId()) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    _selectElementWithHipayId(_idInputMapper.cardType).setAttribute('style','display:none;');
                    return false;
                }

                if (_isTypeValid(serviceCreditCard.getCardTypeId()) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }

                if (/[^0-9-\s]+/.test(creditCardNumberUnformatted)) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }

                if (_isLengthValid(creditCardNumberUnformatted) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }

                if (_isLuhnValid(creditCardNumberUnformatted) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }
                return true;
            };

            var _isEnabled = function(cardTypeId) {

                if (_availableAndEnabledPaymentProductsCollection.length == 0) {
                    _initAvailableAndEnabledPaymentProductsCollection();
                }

                if (_availableAndEnabledPaymentProductsCollection.length == 0) {
                    return true;
                } else {
                    for (indexEnableProduct in _availableAndEnabledPaymentProductsCollection) {
                        if (_idProductAPIMapper[_availableAndEnabledPaymentProductsCollection[indexEnableProduct]] == cardTypeId) {
                            return true;
                        }
                    }
                }
                return false;

            }

            var _isTypeValid =function(cardTypeId) {
                if (_cardFormatDefinition.hasOwnProperty(cardTypeId) === false) {
                    return false;
                }
            }

            var _isLengthValid = function (value) {
                if (value.length < serviceCreditCard.cardLengthMin || (serviceCreditCard.cardLengthMax != null && value.length > serviceCreditCard.cardLengthMax) ) {
                    return false;
                }
                return true;
            }

            var _isLuhnValid = function (value) {
                // The Luhn Algorithm. It's so pretty.
                var nCheck = 0, nDigit = 0, bEven = false;
                value = value.replace(/\D/g, "");

                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n),
                        nDigit = parseInt(cDigit, 10);

                    if (bEven) {
                        if ((nDigit *= 2) > 9) nDigit -= 9;
                    }

                    nCheck += nDigit;
                    bEven = !bEven;
                }
                return (nCheck % 10) == 0;

            };
            return validatorCreditCardNumber;
        };

        serviceCreditCard.validatorCreditCardHolder = function(errorArray) {
            var validatorCreditCardHolder = {};
            validatorCreditCardHolder.errorCollection = errorArray || [];
            validatorCreditCardHolder.isValid = function (creditCardHolderString) {

                if (creditCardHolderString == "" || typeof creditCardHolderString == "undefined" || creditCardHolderString == null) {
                    return false;
                }

                if (creditCardHolderString && creditCardHolderString.length > serviceCreditCard.creditCardHolderLengthMax ) {
                    validatorCreditCardHolder.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CARD_HOLDER").replace("%NUMBER%", serviceCreditCard.creditCardHolderLengthMax)))

                    return false;
                }

                return true;
            }

            validatorCreditCardHolder.isPotentiallyValid = function(creditCardHolderString) {

                var isPotentiallyValid = false;

                if (creditCardHolderString && creditCardHolderString.length <= serviceCreditCard.creditCardHolderLengthMax ) {
                    isPotentiallyValid = true;
                }

                if (isPotentiallyValid == false) {
                    validatorCreditCardHolder.isValid(creditCardHolderString);
                }

                return isPotentiallyValid;
            }
            return validatorCreditCardHolder;

        };


        serviceCreditCard.validatorCreditCardExpiryDate = function (errorCollection) {

            var validatorExpiryDate = {};
            validatorExpiryDate.errorCollection = errorCollection || [];

            validatorExpiryDate.isPotentiallyValid = function(creditCardExpiryDate) {
                var isPotentiallyValid = false;

                if (!creditCardExpiryDate) {
                    return;
                }
                var splitExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);

                if (splitExpiryDate.length < 2) {
                    if (splitExpiryDate <= 12) {
                        isPotentiallyValid = true;
                    }
                } else {
                    if (splitExpiryDate.length == 2) {
                        var month = splitExpiryDate[0];
                        var year = splitExpiryDate[1];
                        if (year.length < 2) {

                            if (month <= 12 && year >= 1) {
                                isPotentiallyValid = true;
                            }
                        } else {
                            // Return today's date and time
                            var currentTime = new Date();

                            // returns the month (from 0 to 11)
                            var currentMonth = currentTime.getMonth() + 1;

                            // returns the year (four digits)
                            var currentYear = currentTime.getFullYear();

                            var yearYYYY = "20" + year;
                            if(yearYYYY > currentYear && yearYYYY <= (currentYear + _maxYearExpiry)) {
                                isPotentiallyValid = true;
                            } else if(yearYYYY == currentYear && month >= currentMonth) {
                                isPotentiallyValid = true;
                            }
                        }
                    }
                }

                if (isPotentiallyValid == false) {
                    validatorExpiryDate.isValid(creditCardExpiryDate);
                }

                return isPotentiallyValid;

            };

            validatorExpiryDate.isValid = function(creditCardExpiryDate) {

                if (typeof creditCardExpiryDate == "undefined") {
                    creditCardExpiryDate = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);
                }

                if(!creditCardExpiryDate) {
                    return false;
                }

                var splitExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);
                if (splitExpiryDate.length != 2) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'format de date non valide'));
                    return false;
                }

                var month = splitExpiryDate[0];
                var year = splitExpiryDate[1];

                // Return today's date and time
                var currentTime = new Date();

                // returns the month (from 0 to 11)
                var currentMonth = currentTime.getMonth() + 1;

                // returns the year (four digits)
                var currentYear = currentTime.getFullYear();

                year = "20" + year;

                if(month > 12) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_MONTH_EXPIRY_DATE")));
                    return false;
                } else if(year < currentYear || year > (currentYear + _maxYearExpiry)) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_EXPIRY_DATE_PAST")));
                    return false;
                }
                else if(year == currentYear && month < currentMonth || year < currentYear) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_EXPIRY_DATE_PAST")));
                    return false;
                }
                return true;
            };
            return validatorExpiryDate;
        };

        serviceCreditCard.validatorCreditCardCVV = function(errorArray,validateAll) {
            var validatorCreditCardCVV = {};
            validatorCreditCardCVV.errorCollection = errorArray || [];
            validatorCreditCardCVV.isPotentiallyValid = function (creditCardCVVString,creditCardNumber) {
                var isPotentiallyValid = false;

                var arrayFormatCVV = ['34', '35', '36', '37'];
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {
                    if (_selectElementValueWithHipayId(_idInputMapper['cardNumber']) != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }

                if (typeof creditCardCVVString != "undefined" && creditCardCVVString != "" && creditCardCVVString.length <= serviceCreditCard.creditCardCVVLengthMax ) {
                    isPotentiallyValid = true;
                }

                if (serviceCreditCard.idType == 'card_maestro_info' && creditCardCVVString == "") {
                    isPotentiallyValid = true;
                }

                if (isPotentiallyValid == false) {
                    validatorCreditCardCVV.isValid(creditCardCVVString);
                }
                return isPotentiallyValid;
            };

            validatorCreditCardCVV.isValid = function (creditCardCVVString) {
                if (serviceCreditCard.idType == 'card_maestro_info') {
                    return true;
                }

                if (creditCardCVVString == "" || typeof creditCardCVVString == "undefined" || creditCardCVVString == null) {
                    return false;
                }

                // cvv amex
                var creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
                var arrayFormatCVV = ['34','35','36','37'];
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {
                    if (creditCardNumber != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }

                if (typeof creditCardCVVString != "undefined" && creditCardCVVString.length > serviceCreditCard.creditCardCVVLengthMax ) {
                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));
                    return false;
                }

                if ((typeof validateAll == "undefined" || validateAll == true) && creditCardCVVString != undefined && creditCardCVVString.length < serviceCreditCard.creditCardCVVLengthMax ) {
                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));
                    return false;
                }
                return true;
            };
            return validatorCreditCardCVV;
        };

        serviceCreditCard.validatorCreditCard = function(errorCollection) {

            var validatorCreditCard = {};
            // validatorCreditCard.errorCollection = errorCollection;
            validatorCreditCard.errorCollection = [];

            validatorCreditCard.isValid = function(params) {

                var hasError = false;
                var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber();
                if (!validatorCreditCardNumber.isValid(serviceCreditCard.unformatCreditCardNumber(params['card_number']))) {
                    validatorCreditCard.errorCollection['creditCardNumber'] = validatorCreditCardNumber.errorCollection;
                    hasError = true;
                    // return false;
                }

                var validatorCreditCardHolder = serviceCreditCard.validatorCreditCardHolder(validatorCreditCard.errorCollection);
                if (!validatorCreditCardHolder.isValid(params['card_holder'])) {
                    hasError = true;
                    // return false;
                }

                var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate(validatorCreditCard.errorCollection);
                if (!validatorCreditCardExpiryDate.isValid(params['card_expiry_date'])) {
                    hasError = true;
                    // return false;
                }

                var validatorCreditCardCVV = serviceCreditCard.validatorCreditCardCVV(validatorCreditCard.errorCollection);
                if (!validatorCreditCardCVV.isValid(params['cvc'])) {
                    hasError = true;
                    // return false;
                }

                if (hasError) {
                    return false;
                }

                return true;
            };
            return validatorCreditCard;
        };

        serviceCreditCard.initCreditCardNumber = function(charCode, stringPaste){
            serviceCreditCard.lastCharCode = charCode;

            // if (typeof charCode == "undefined" || charCode == '') {
            //     setTimeout(function(){
            //         HiPay.Form.paymentFormDataGetErrors();
            //         // alert(_selectElementValueWithHipayId(_idInputMapper['cardNumber']));
            //     }, 0);
            // }
            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharString = '';
            }
            else {
                serviceCreditCard.lastCharString = String.fromCharCode(charCode);
            }

            if (serviceCreditCard.lastCharString === '') {

            }

            serviceCreditCard.cardNumberStringFormatBefore = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
            serviceCreditCard.cardNumberStringFormatedBefore = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);

            //realposition cursor in number
            var splitFormatBeforetemp = serviceCreditCard.cardNumberStringFormatBefore;
            serviceCreditCard.cardNumberStringUnformatedBefore = splitFormatBeforetemp.split(' ').join('');

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper.cardNumber));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardNumberStringFormatedBefore.substr(0, startBFormat);
            var splitSubStringStart = subStringStart.split(' ');
            var nbSpaceStart = splitSubStringStart.length - 1;

            var subStringEnd =  serviceCreditCard.cardNumberStringFormatedBefore.substr(0, endBFormat);
            var splitSubStringEnd = subStringEnd.split(' ');
            var nbSpaceEnd = splitSubStringEnd.length - 1;

            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);

            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;

            if (stringPaste) {
                // delete all chars but number
                var stringPaste = stringPaste.replace(/[^0-9]/g, '');

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = stringPaste.length;
                } else if (startB >= 0) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }

                if (newTempStringAfter.length >= 25) {
                    newTempStringAfter =newTempStringAfter.substring(0,25);
                }

            } else {
                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                    // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore;

                }
                else if (startB > 0) {
                    if (charCode == 8) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);

                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                        startA = startA - 1;

                    } else if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                } else if (startB == 0) {
                    if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                }
            }

            var tempStringAfter = "";

            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {

                    } else {
                        if (stringPaste) {
                            startAtemp = startAtemp + stringPaste.length;
                        } else {
                            tempStringAfter += serviceCreditCard.lastCharString;
                            startAtemp = startAtemp + 1;
                        }
                    }
                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;

            // number format
            serviceCreditCard.cardLengthMin = 0;
            serviceCreditCard.cardLengthMax = 25;

            serviceCreditCard.idType = null;

            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (tempStringAfter.indexOf(startNumber) === 0) {
                                serviceCreditCard.idType = propt;
                                var my_elem = _selectElementWithHipayId(_idInputMapper.cardNumber);

                                serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                                /* length */
                                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                                if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                                }
                                /* ./ length */
                                break;
                            } else {

                            }
                        }
                    } else {
                        if (tempStringAfter.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            serviceCreditCard.idType = propt;
                            serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                            /* length */
                            serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }
                            /* ./ length */
                            break;
                        }
                    }
                }
                /* ./ range */
            }

            if (serviceCreditCard.cardLengthMax == null || tempStringAfter.length <= serviceCreditCard.cardLengthMax) {
                serviceCreditCard.cardNumberStringAfter = tempStringAfter;
            }
            else {

                if (stringPaste) {
                    serviceCreditCard.cardNumberStringAfter = tempStringAfter.substr(0,serviceCreditCard.cardLengthMax);
                } else {
                    serviceCreditCard.cardNumberStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;
                    startA = startB;
                }
            }

            var numberFormatTotal = 0;

            var tempForStringAfter = "";
            if ( serviceCreditCard.cardFormatArray.length > 0) {
                var positionSpaceArray = [];
                var startFormat = 0;
                for (var i = 0; i < serviceCreditCard.cardFormatArray.length; i++) {
                    positionSpaceArray[(startFormat + serviceCreditCard.cardFormatArray[i])] = 1;
                    startFormat += serviceCreditCard.cardFormatArray[i];
                }
            }

            var numberSpaceBeforeStartFormated= 0;
            for (var nb=0; nb< serviceCreditCard.cardNumberStringAfter.length;nb++) {
                if (typeof positionSpaceArray != "undefined" && positionSpaceArray[nb]===1) {
                    if (nb < startA) {
                        numberSpaceBeforeStartFormated +=1;
                    }
                    tempForStringAfter += ' ';
                }
                tempForStringAfter += serviceCreditCard.cardNumberStringAfter.charAt(nb);
            }

            serviceCreditCard.cardNumberStringFormatAfter = tempForStringAfter;

            var startAFormat = startA + numberSpaceBeforeStartFormated;

            _setElementValueWithHipayId(_idInputMapper.cardNumber, serviceCreditCard.cardNumberStringFormatAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper.cardNumber), startAFormat);

            // focus next input + change color input on error
            _inputCCNumberFinish( _selectElementWithHipayId(_idInputMapper.cardHolder), serviceCreditCard);

            // })(charCode);
        };

        serviceCreditCard.initCreditCardHolder = function(charCode,stringPaste){
            serviceCreditCard.lastCharCodeCreditCardHolder = charCode;
            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardHolder = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardHolder = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardHolderStringFormatedBefore = _selectElementValueWithHipayId(_idInputMapper['cardHolder']);

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper.cardHolder));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, startBFormat);


            var subStringEnd =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, endBFormat);


            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);


            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;

            if (stringPaste) {

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = stringPaste.length;
                } else if (startB >= 0) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }

                // if (newTempStringAfter.length >= 25) {
                //     newTempStringAfter =newTempStringAfter.substring(0,25);
                // }

            } else {


                if (startB >= 0 && endB > 0 && startB < endB) {

                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                    // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore;
                }
                else if (startB > 0) {
                    if (charCode == 8) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                        startA = startA - 1;

                    } else if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                } else if (startB == 0) {
                    if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                }
            }

            //var startA = startBFormat;

            var tempStringAfter = "";

            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                // if (nbBefore == realCursorPositionInNumberBefore) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {


                    } else {
                        if (stringPaste) {
                            startAtemp = startAtemp + stringPaste.length;
                        } else {
                            tempStringAfter += serviceCreditCard.lastCharStringCreditCardHolder;
                            // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                            startAtemp = startAtemp + 1;
                        }
                    }

                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;

            if (serviceCreditCard.creditCardHolderLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardHolderLengthMax) {


                serviceCreditCard.cardHolderStringAfter = tempStringAfter;

            }
            else {
                if (charCode == 8 || charCode == 46) {
                    serviceCreditCard.cardHolderStringAfter = tempStringAfter;
                } else {

                    if (stringPaste) {
                        // serviceCreditCard.cardHolderStringAfter = tempStringAfter.substr(0,serviceCreditCard.cardLengthMax);
                        serviceCreditCard.cardHolderStringAfter = tempStringAfter;
                    } else {

                        serviceCreditCard.cardHolderStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;
                        startA = startBFormat;
                    }
                }
            }

            _setElementValueWithHipayId(_idInputMapper.cardHolder, serviceCreditCard.cardHolderStringAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper.cardHolder), startA);
        };

        serviceCreditCard.initCreditCardExpiryDate = function(charCode, stringPaste){

            serviceCreditCard.lastCharCodeCreditCardExpiryDate = charCode;
            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = String.fromCharCode(charCode);
            }

            serviceCreditCard.creditCardExpiryDateFormattedBefore = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);

            //realposition cursor in number
            var splitFormatBeforetemp = serviceCreditCard.creditCardExpiryDateFormattedBefore;
            serviceCreditCard.creditCardExpiryDateUnformattedBefore = splitFormatBeforetemp.split(_separatorMonthYear).join('');

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper['cardExpiryDate']));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, startBFormat);

            var splitSubStringStart = subStringStart.split(_separatorMonthYear);
            var nbSpaceStart = (splitSubStringStart.length - 1)*_separatorMonthYear.length;

            var subStringEnd =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, endBFormat);

            var splitSubStringEnd = subStringEnd.split(_separatorMonthYear);
            var nbSpaceEnd = (splitSubStringEnd.length - 1)*_separatorMonthYear.length;


            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);
            if (startBFormat > 2 && startBFormat <= (2 + _separatorMonthYear.length)) {
                startB = 2;
            }

            if (endBFormat > 2 && endBFormat <= (2 + _separatorMonthYear.length)) {
                endB = 2;
            }

            var startA = startB;
            var endA = endB;

            var newTempStringAfter = serviceCreditCard.creditCardExpiryDateUnformattedBefore;

            if (stringPaste) {
                // delete all chars but number
                var stringPaste = stringPaste.replace(/[^0-9]/g, '');

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = stringPaste.length;
                } else if (startB >= 0) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }

                if (newTempStringAfter.length >= 4) {
                    newTempStringAfter =newTempStringAfter.substring(0,4);
                }
            } else {
                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                }
                else if (startB > 0) {
                    if (charCode == 8) {

                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                        startA = startA - 1;
                    } else if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                } else if (startB == 0) {
                    if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                }
            }

            var tempStringAfter = "";
            var startAtemp = startA;

            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {
                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardExpiryDate;
                        startAtemp = startAtemp + 1;
                    }
                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            if (tempStringAfter.length <= 4) {
                serviceCreditCard.cardExpiryDateStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardExpiryDateStringAfter = serviceCreditCard.creditCardExpiryDateUnformattedBefore;
                startA = startBFormat;
            }

            if ( serviceCreditCard.cardExpiryDateStringAfter.length === 1) {
                if (charCode != 8 && charCode != 46 ) {
                    if (serviceCreditCard.cardExpiryDateStringAfter.charAt(0) > 1) {
                        serviceCreditCard.cardExpiryDateStringAfter = "0" + serviceCreditCard.cardExpiryDateStringAfter;
                        startA = startA + 1;
                    }
                }
            }
            serviceCreditCard.cardExpiryDateStringFormattedAfter = serviceCreditCard.cardExpiryDateStringAfter;

            if ( serviceCreditCard.cardExpiryDateStringAfter.length >= 2) {
                serviceCreditCard.cardExpiryDateStringFormattedAfter = serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(0, 2) + _separatorMonthYear + serviceCreditCard.cardExpiryDateStringAfter.substring(2, serviceCreditCard.cardExpiryDateStringFormattedAfter.length);
                if (charCode != 8) {
                    startA = startA + _separatorMonthYear.length;
                } else {
                    if (startA >= 2) {
                        startA = startA + _separatorMonthYear.length;
                    }
                }
            }

            _setElementValueWithHipayId(_idInputMapper['cardExpiryDate'], serviceCreditCard.cardExpiryDateStringFormattedAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper['cardExpiryDate']), startA);
            _inputCardExpiryDateFinish( _selectElementWithHipayId(_idInputMapper.cardCVV), serviceCreditCard);

        };

        serviceCreditCard.initCreditCardCVV = function(charCode, stringPaste){

            serviceCreditCard.lastCharCodeCreditCardCVV = charCode;
            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardCVV = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardCVV = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardCVVStringFormatedBefore = _selectElementValueWithHipayId(_idInputMapper['cardCVV']);

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper.cardCVV));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, startBFormat);

            var subStringEnd =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, endBFormat);

            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);

            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;

            if (stringPaste) {
                // delete all chars but number
                stringPaste = stringPaste.replace(/[^0-9]/g, '');

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                } else if (startB >= 0) {

                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }
                var startBFormat = startB + stringPaste.length;


                if (newTempStringAfter.length >= 4) {
                    newTempStringAfter =newTempStringAfter.substring(0,4);
                }
            } else {
                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                }
                else if (startB > 0) {
                    if (charCode == 8) {

                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);

                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                        startA = startA - 1;

                    } else if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    }
                    endA = startA;
                } else if (startB == 0) {
                    if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                }
            }

            var startA = startBFormat;
            var tempStringAfter = "";
            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {
                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardCVV;
                        // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                        startAtemp = startAtemp + 1;
                    }
                }
                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            var arrayFormatCVV = ['34','35','36','37'];
            var creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
            for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {
                if (creditCardNumber != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                    serviceCreditCard.creditCardCVVLengthMax = 4;
                }
            }

            if (serviceCreditCard.creditCardCVVLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardCVVLengthMax) {
                serviceCreditCard.cardCVVStringAfter = tempStringAfter;
            }
            else {
                if (stringPaste) {
                    serviceCreditCard.cardCVVStringAfter = tempStringAfter.substr(0,serviceCreditCard.creditCardCVVLengthMax);
                    // startA = stringPaste.length;
                } else {
                    serviceCreditCard.cardCVVStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;
                    startA = startBFormat;
                }
            }

            _setElementValueWithHipayId(_idInputMapper.cardCVV, serviceCreditCard.cardCVVStringAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper.cardCVV), startA);

        };
        return serviceCreditCard;
    }


    var _addClassOnElement = function(elements, myClass) {

        // if there are no elements, we're done
        if (!elements) { return; }

        // if we have a selector, get the chosen elements
        if (typeof(elements) === 'string') {
            elements = document.querySelectorAll(elements);
        }

        // if we have a single DOM element, make it an array to simplify behavior
        else if (elements.tagName) { elements=[elements]; }

        // add class to all chosen elements
        for (var i=0; i<elements.length; i++) {

            // if class is not already found
            if ( (' '+elements[i].className+' ').indexOf(' '+myClass+' ') < 0 ) {

                // add class
                elements[i].className += ' ' + myClass;
            }
        }
    };


    var _removeClassOnElement = function(elements, myClass) {

        // if there are no elements, we're done
        if (!elements) { return; }

        // if we have a selector, get the chosen elements
        if (typeof(elements) === 'string') {
            elements = document.querySelectorAll(elements);
        }

        // if we have a single DOM element, make it an array to simplify behavior
        else if (elements.tagName) { elements=[elements]; }

        // create pattern to find class name
        var reg = new RegExp('(^| )'+myClass+'($| )','g');

        // remove class from all chosen elements
        for (var i=0; i<elements.length; i++) {
            elements[i].className = elements[i].className.replace(reg,' ');
        }
    };

    var _containsClassOnElement = function(elements, myClass) {

        // if there are no elements, we're done
        if (!elements) { return; }

        // if we have a selector, get the chosen elements
        if (typeof(elements) === 'string') {
            elements = document.querySelectorAll(elements);
        }

        // if we have a single DOM element, make it an array to simplify behavior
        else if (elements.tagName) { elements=[elements]; }

        // add class to all chosen elements
        var containsClass = false;
        for (var i=0; i<elements.length; i++) {

            // if class is not already found
            if ( (' '+elements[i].className+' ').indexOf(' '+myClass+' ') > 0 ) {

                // add class
                containsClass = true;
            }
        }
        return containsClass;
    }

    /**
     *
     */
    var _callbackEventFormChange = new Function();

    /**
     *
     * @private
     */
    var _initErrorHandler = function(e){
        for (var indexInput in _idInputMapper) {
            if (indexInput != "cardType" && _selectElementWithHipayId(_idInputMapper[indexInput]) != null) {
                if (_selectElementWithHipayId(_idInputMapper[indexInput]).classList.contains == "function") {
                    if (_selectElementWithHipayId(_idInputMapper[indexInput]).classList.contains('error-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexInput]).classList.remove('error-card-form');
                    }
                    if (!_selectElementWithHipayId(_idInputMapper[indexInput]).classList.contains('default-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexInput]).classList.add('default-card-form');
                    }
                } else {
                    if (_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'error-card-form')) {
                        _removeClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'error-card-form');
                    }
                    if (!_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'default-card-form')) {
                        _addClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'default-card-form');
                    }

                }
            }
        }


        var errors = HiPay.Form.paymentFormDataGetErrors();

        for (var indexError in errors) {
            if (_selectElementWithHipayId(_idInputMapper[indexInput]) != null) {
                if (_selectElementWithHipayId(_idInputMapper[indexError]).classList.contains == "function") {
                    if (!_selectElementWithHipayId(_idInputMapper[indexError]).classList.contains('error-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexError]).classList.add('error-card-form');
                    }
                    if (_selectElementWithHipayId(_idInputMapper[indexError]).classList.contains('default-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexError]).classList.remove('default-card-form');
                    }
                } else {
                    if (!_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'error-card-form')) {
                        _addClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'error-card-form');
                    }
                    if (_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'default-card-form')) {
                        _removeClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'default-card-form');
                    }

                }

            }
        }

    };

    /**
     *
     * @param idElement
     * @param s
     * @param fn
     * @private
     */
    var _addListenerMulti = function (idElement, s, fn) {
        var eventList = s.split(' ');
        for(var eventIndex = 0; eventIndex < eventList.length; eventIndex++) {
            if (_selectElementWithHipayId(idElement) != null) {
                _addFieldListener(_selectElementWithHipayId(idElement), eventList[eventIndex], function (e) {
                    fn();
                }, false);
                // _selectElementWithHipayId(idElement).addEventListener(eventList[eventIndex], function (e) {
                //     fn();
                // }, false);
            }
        }
    };

    var _selectElementWithHipayId = function(idHiPay) {
        if (idHiPay == null || typeof idHiPay == "undefined") {
            return;
        }

        var selectorString = "*[data-hipay-id='"+idHiPay+"']";

        if (_testSelector(selectorString)) {
            return document.querySelector(selectorString);
        }
        else {

            var selectorInput = "input";
            if (!document.querySelector) {
                alert("no selector");
            }
            if (_testSelector(selectorInput)) {

                if (document.querySelector(selectorInput)) {
                    return document.querySelector( "input[data-hipay-id='"+idHiPay+"']");
                } else if(document.querySelector( "img[data-hipay-id='"+idHiPay+"']")) {
                    document.querySelector( "img[data-hipay-id='"+idHiPay+"']");
                }
            }

        }

    };

    var _selectElementValueWithHipayId = function(idHiPay) {
        if (_selectElementWithHipayId(idHiPay)) {
            return _selectElementWithHipayId(idHiPay).value;
        }

    };

    var _setElementValueWithHipayId = function(idHiPay, value) {
        if (_selectElementWithHipayId(idHiPay)) {
            _selectElementWithHipayId(idHiPay).value = value;
            if (  _selectElementWithHipayId(idHiPay).blur) {
                _selectElementWithHipayId(idHiPay).blur();
            }
            if (  _selectElementWithHipayId(idHiPay).focus) {
                _selectElementWithHipayId(idHiPay).focus();
            }

        }

    };

    /**
     *
     * @param idElement
     * @private
     */
    var _initListenEvent = function(idElement){

        _addListenerMulti(idElement, 'keydown keypress paste blur focus', _initErrorHandler);
    };

    var _initPlaceholder = function() {
        for (var propt in _idInputMapper) {

            if (_selectElementWithHipayId(_idInputMapper[propt]) != null && _selectElementWithHipayId(_idInputMapper[propt]).placeholder == "") {
                switch (propt) {
                    case 'cardNumber':
                        // _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER");
                        _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER");
                        break;
                    case 'cardHolder':
                        _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_HOLDER");
                        break;
                    case 'cardExpiryDate':
                        _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_EXPIRY_DATE");
                        break;
                    case 'cardCVV':

                        if (_selectElementValueWithHipayId(_idInputMapper["cardType"]) === _idProductAPIMapper['american-express']) {
                            _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV_AMEX");
                        } else {
                            _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV");
                        }

                        break;
                }
            }
        }
    };

    var _updatePlaceholderCVV = function(cardTypeId) {

        if (cardTypeId && cardTypeId === _idProductAPIMapper['american-express']) {
            _selectElementWithHipayId(_idInputMapper["cardCVV"]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV_AMEX");
        } else {
            _selectElementWithHipayId(_idInputMapper["cardCVV"]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV");
        }
    }

    var _eventHandlersFields = {};

    var _addFieldListener = function (node, event, handler, capture) {
        if (typeof node == "undefined") {
            return;
        }

        if (node.attachEvent) {
            node.attachEvent("on" + event, handler);
        } else {
            node.addEventListener(event, handler, capture);  // all browsers and IE9+
        }

    };



    var _initAllFieldsEventListener = function() {
        _initCardNumberFieldEventListener();
        _initCardHolderFieldEventListener();
        _initCardExpiryDateFieldEventListener();
        _initCVVFieldEventListener();
        _initCardExpiryMonthFieldEventListener();
        _initCardExpiryYearFieldEventListener();
    }

    var _initCardNumberFieldEventListener = function() {
        var propt = 'cardNumber';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        // cardNumber keydown
        var cardNumberHandlerKeydown = function (e) {

            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardNumber(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;

            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardNumberHandlerKeydown, false);
        // ./ cardNumber keydown

        // cardNumber paste
        var cardNumberHandlerPaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";
            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');

            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardNumber("", pastedText);
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardNumberHandlerPaste, false);
        // ./ cardNumber paste

        // cardNumber cut
        var cardNumberHandlerCut = function (e) {
            setTimeout(function(){
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardNumber("");
                _callbackEventFormChange();
            }, 0);
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'cut', cardNumberHandlerCut, false);
        // ./ cardNumber cut


        // cardNumber keypress not handle in FF
        var cardNumberHandlerKeypress = function (e) {

            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (charCode == 8 || charCode == 46) {

            } else {
                if (typeof evt.key != "undefined" && evt.key.length === 1) {
                    evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                    if (charCode >= 48 && charCode <= 57) {
                        /* is valid add char */
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardNumber(charCode);

                    }
                }
                _callbackEventFormChange();
            }
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keypress', cardNumberHandlerKeypress, false);
        // ./ cardNumber keypress

        // cardNumber change
        var cardNumberHandlerChange = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _selectElementWithHipayId(_idInputMapper['cardNumber']).focus();
            // _instanceServiceCreditCard.initCreditCardNumber("", _selectElementValueWithHipayId(_idInputMapper['cardNumber']));
            _instanceServiceCreditCard.initCreditCardNumber("");
            _callbackEventFormChange();

        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardNumberHandlerChange, false);
        // ./ cardNumber change
        _initListenEvent(_idInputMapper[propt]);


    }

    var _initCardHolderFieldEventListener = function() {
        var propt = 'cardHolder';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        // cardHolder keydown
        var cardHolderHandlerKeydown = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardHolder(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }
            _callbackEventFormChange();
        };

        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardHolderHandlerKeydown, false);
        // ./ cardHolder keydown

        // cardHolder paste
        var cardHolderHandlerPaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";
            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');

            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardHolder("", pastedText);
            _callbackEventFormChange();
        };

        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardHolderHandlerPaste, false);
        // ./ cardHolder paste

        // cardHolder cut
        var cardHolderHandlerCut = function (e) {
            setTimeout(function(){
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardHolder("");
                _callbackEventFormChange();
            }, 0);
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'cut', cardHolderHandlerCut, false);
        // ./ cardHolder cut

        // ./ cardHolder cut

        // cardHolder keypress
        var cardHolderHandlerKeypress = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (charCode == 8 || charCode == 46) {

            } else {
                if (typeof evt.key != "undefined" && evt.key.length === 1) {
                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardHolder(charCode);
                    evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                }
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keypress', cardHolderHandlerKeypress, false);
        // ./ cardHolder keypress

        // cardHolder change
        var cardNumberHandlerChange = function (e) {
            var evt = e || window.event;
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _selectElementWithHipayId(_idInputMapper['cardHolder']).focus();

            // _instanceServiceCreditCard.initCreditCardHolder("", _selectElementValueWithHipayId(_idInputMapper['cardHolder']));
            _instanceServiceCreditCard.initCreditCardHolder("");

            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardNumberHandlerChange, false);
        // ./ cardHolder change

        _initListenEvent(_idInputMapper[propt]);
    }

    var _initCardExpiryDateFieldEventListener = function() {
        var propt = 'cardExpiryDate';
        if(!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        // cardExpiryDate keydown
        var cardExpiryDateHandlerKeydown = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardExpiryDateHandlerKeydown, false);
        // ./ cardExpiryDate keydown

        // cardExpiryDate keypress
        var cardExpiryDateHandlerKeypress = function (e) {

            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (charCode == 8 || charCode == 46) {

            } else {
                if (typeof evt.key != "undefined" && evt.key.length === 1) {
                    evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                    if (charCode >= 48 && charCode <= 57) {
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);
                    }
                }
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper['cardExpiryDate']), 'keypress', cardExpiryDateHandlerKeypress, false);
        // ./ cardExpiryDate keypress

        // cardExpiryDate paste
        var cardExpiryDateHandlerPaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";
            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');
            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardExpiryDate("", pastedText);
            _callbackEventFormChange();

        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardExpiryDateHandlerPaste, false);
        // ./ cardExpiryDate paste

        _initListenEvent(_idInputMapper[propt]);
    }

    var _initCVVFieldEventListener = function() {
        var propt = 'cardCVV';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }
        // cardCVV keydown
        var cardCVVHandlerKeydown = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardCVV(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardCVVHandlerKeydown, false);
        // ./ cardCVV keydown

        // cardCVV keypress
        var cardCVVHandlerKeypress = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (typeof evt.key != "undefined" && evt.key.length === 1) {
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                if (charCode >= 48 && charCode <= 57) {
                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardCVV(charCode);
                }
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keypress', cardCVVHandlerKeypress, false);
        // ./ cardCVV keypress

        // cardCVV paste
        var cardCVVHandlerExpiryDatePaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";
            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');
            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }
            evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardCVV("", pastedText);
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardCVVHandlerExpiryDatePaste, false);
        // ./ cardCVV paste
        _initListenEvent(_idInputMapper[propt]);
    }

    var _initCardExpiryMonthFieldEventListener = function() {
        var propt = 'cardExpiryMonth';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }
        // cardExpiryMonth scan IOS
        var cardExpiryMonthHandlerScanExpiry = function (e) {
            var evt = e || window.event;
            if (_selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) != "" && _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']) != "") {
                var expDateFormat = _selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) + ' / ' + _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']).substr(2, 4);
                _instanceServiceCreditCard = new _serviceCreditCard();
                _selectElementWithHipayId(_idInputMapper['cardExpiryDate']).focus();
                _setElementValueWithHipayId(_idInputMapper['cardExpiryDate'], "");
                _instanceServiceCreditCard.initCreditCardExpiryDate("", expDateFormat);
                _setElementValueWithHipayId(_idInputMapper['cardExpiryMonth'], "");
                _setElementValueWithHipayId(_idInputMapper['cardExpiryYear'], "");
                _callbackEventFormChange();
            }
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardExpiryMonthHandlerScanExpiry, false);
        // ./ cardExpiryMonth scan IOS
        _initListenEvent(_idInputMapper[propt]);
    }

    var _initCardExpiryYearFieldEventListener = function() {
        var propt = 'cardExpiryYear';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }
        // cardExpiryYear scan IOS
        var cardExpiryYearHandlerScanExpiry = function (e) {
            var evt = e || window.event;
            if (_selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) != "" && _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']) != "") {
                var expDateFormat = _selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) + ' / ' + _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']).substr(2, 4);
                _instanceServiceCreditCard = new _serviceCreditCard();
                _selectElementWithHipayId(_idInputMapper['cardExpiryDate']).focus();
                _setElementValueWithHipayId(_idInputMapper['cardExpiryDate'], "");
                _instanceServiceCreditCard.initCreditCardExpiryDate("", expDateFormat);
                _setElementValueWithHipayId(_idInputMapper['cardExpiryMonth'], "");
                _setElementValueWithHipayId(_idInputMapper['cardExpiryYear'], "");
                _callbackEventFormChange();
            }
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardExpiryYearHandlerScanExpiry, false);
        // ./ cardExpiryYear scan IOS
        _initListenEvent(_idInputMapper[propt]);
    }

    var _elementIsDefined = function(element) {
        return _selectElementWithHipayId(element) !== null && typeof _selectElementWithHipayId(element) !== "undefined";
    };

    _initApp = function() {
// HiPay.Form.setLocale("en_EN");

        // create ico card type
        // card type
        var my_elem = _selectElementWithHipayId(_idInputMapper.cardNumber);

        if (null != my_elem) {
            var imgType = document.createElement('img');
            imgType.className = 'card-type-custom';
            imgType.setAttribute('data-hipay-id', _idInputMapper['cardType']);
            imgType.src = "";
            imgType.setAttribute('style','display:none;');
            imgType.setAttribute('style','visibility:hidden;');

            my_elem.parentNode.insertBefore(imgType, my_elem.nextSibling);
        }

        var elementPayButton = _selectElementWithHipayId(_idInputMapper.payButton);

        if (null != elementPayButton) {
            var inputCardExpiryMonth = document.createElement('input');
            inputCardExpiryMonth.setAttribute('tabindex', "-1");
            inputCardExpiryMonth.setAttribute('type', "tel");
            inputCardExpiryMonth.setAttribute('style', "position: absolute; left: -999em; width:1px");
            inputCardExpiryMonth.setAttribute('id', "expiration-month");
            inputCardExpiryMonth.setAttribute('data-hipay-id', "card-expiry-month");

            elementPayButton.parentNode.appendChild(inputCardExpiryMonth);

            var inputCardExpiryYear = document.createElement('input');
            inputCardExpiryYear.setAttribute('tabindex', "-1");
            inputCardExpiryYear.setAttribute('type', "tel");
            inputCardExpiryYear.setAttribute('style', "position: absolute; left: -999em; width:1px");
            inputCardExpiryYear.setAttribute('id', "expiration-year");
            inputCardExpiryYear.setAttribute('data-hipay-id', "card-expiry-year");

            elementPayButton.parentNode.appendChild(inputCardExpiryYear);
        }

        // add placeholder
        _initPlaceholder();
        _initAllFieldsEventListener();

    }

    /* add listener on all input form */
    window.onload = function() {


        if (!Array.prototype.filter)
        {
            Array.prototype.filter = function(fun /*, thisp */)
            {
                "use strict";

                if (this === void 0 || this === null)
                    throw new TypeError();

                var t = Object(this);
                var len = t.length >>> 0;
                if (typeof fun !== "function")
                    throw new TypeError();

                var res = [];
                var thisp = arguments[1];
                for (var i = 0; i < len; i++)
                {
                    if (i in t)
                    {
                        var val = t[i]; // in case fun mutates this
                        if (fun.call(thisp, val, i, t))
                            res.push(val);
                    }
                }

                return res;
            };
        }


        if (!Array.prototype.indexOf)
        {
            Array.prototype.indexOf = function(elt /*, from*/)
            {
                var len = this.length >>> 0;

                var from = Number(arguments[1]) || 0;
                from = (from < 0)
                    ? Math.ceil(from)
                    : Math.floor(from);
                if (from < 0)
                    from += len;

                for (; from < len; from++)
                {
                    if (from in this &&
                        this[from] === elt)
                        return from;
                }
                return -1;
            };
        }

        if (!document.querySelectorAll) {
            document.querySelectorAll = function (selectors) {
                var style = document.createElement('style'), elements = [], element;
                document.documentElement.firstChild.appendChild(style);
                document._qsa = [];

                style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
                window.scrollBy(0, 0);
                style.parentNode.removeChild(style);

                while (document._qsa.length) {
                    element = document._qsa.shift();
                    element.style.removeAttribute('x-qsa');
                    elements.push(element);
                }
                document._qsa = null;
                return elements;
            };
        }

        if (!document.querySelector) {
            document.querySelector = function (selectors) {
                var elements = document.querySelectorAll(selectors);
                return (elements.length) ? elements[0] : null;
            };
        }

        _initApp();

    };

    /**
     *
     * @return {{card_number, card_expiry_month: string, card_expiry_year: string, card_holder, cvv, multi_use: string, generate_request_id: string}}
     * @private
     */
    var _getParamsFromForm = function() {
        var creditCardExpiryDate = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);

        var month = "";
        var year = "";
        if (creditCardExpiryDate) {
            var explodeExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);


            if (explodeExpiryDate.length == 2) {
                month = explodeExpiryDate[0];
                year = explodeExpiryDate[1];
            } else {
                month = explodeExpiryDate[0];
            }
        }
        return  {
            card_number: _selectElementValueWithHipayId(_idInputMapper.cardNumber),
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: _selectElementValueWithHipayId(_idInputMapper.cardHolder),
            cvv: _selectElementValueWithHipayId(_idInputMapper.cardCVV),
            multi_use: "0",
            generate_request_id: "0"
        };
    };


    /**
     * @property {Object} HiPay.CVVInformation
     @property {String} HiPay.CVVInformation.type
     @property {Number} HiPay.CVVInformation.length
     */
    HiPay.CVVInformation;

    /**
     * Get CVV information by card (name and length of CVV)
     * @method HiPay.getCVVInformation
     * @return {HiPay.CVVInformation}
     */

    HiPay.getCVVInformation = function() {
        _instanceServiceCreditCard = new _serviceCreditCard();

        var CVVLength = _instanceServiceCreditCard.getCreditCardCVVLengthMax();
        if (typeof CVVLength  == "undefined") {
            CVVLength = 3;
        }

        var idType = _instanceServiceCreditCard.getTypeWithCardNumber(_instanceServiceCreditCard.getCreditCardNumberValue());
        HiPay.CVVInformation = {type:_idCVVMapper[idType],
            length: CVVLength};
        return  HiPay.CVVInformation;
    }

    /**
     * Get errors in form
     * @method HiPay.Form.paymentFormDataGetErrors
     * @return errorCollection {Array} a collection with entries of type {{#crossLink "_InvalidParametersError"}}{{/crossLink}}.
     */
    HiPay.Form.paymentFormDataGetErrors = function() {

        _instanceServiceCreditCard = new _serviceCreditCard();
        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();
        var params = _getParamsFromForm();
        var errorCollection = {};
        var hasError = false;
        // Credit card number
        var validatorCreditCardNumber = _instanceServiceCreditCard.validatorCreditCardNumber();
        var creditCardNumberUnformatted = _instanceServiceCreditCard.unformatCreditCardNumber(params['card_number']);

        if (creditCardNumberUnformatted != "") {

            if (!validatorCreditCardNumber.isPotentiallyValid(creditCardNumberUnformatted) ||
                (!validatorCreditCardNumber.isValid(creditCardNumberUnformatted) && _selectElementWithHipayId(_idInputMapper.cardNumber) !== document.activeElement )
            ) {
                errorCollection['cardNumber'] = validatorCreditCardNumber.errorCollection[0]['message'];
            }
        }

        // Credit card holder
        var validatorCreditCardHolder = _instanceServiceCreditCard.validatorCreditCardHolder();
        var creditCardHolderString = params['card_holder'];

        if (typeof creditCardHolderString != 'undefined' && creditCardHolderString != "") {

            if (( validatorCreditCardHolder.isPotentiallyValid(creditCardHolderString) == false) ||
                ( (validatorCreditCardHolder.isValid(creditCardHolderString) == false) && _selectElementWithHipayId(_idInputMapper.cardHolder) && _selectElementWithHipayId(_idInputMapper.cardHolder) !== document.activeElement )
            ) {
                errorCollection['cardHolder'] = validatorCreditCardHolder.errorCollection[0]['message'];
            }
        }





        // Credit card expiry date
        var validatorCreditCardExpiryDate = _instanceServiceCreditCard.validatorCreditCardExpiryDate();
        var creditCardExpiryDateString = params['card_expiry_month'];
        if (params['card_expiry_year'] != "") {
            creditCardExpiryDateString +=  _separatorMonthYear + params['card_expiry_year'];
        }

        if (creditCardExpiryDateString != "") {
            if (!validatorCreditCardExpiryDate.isPotentiallyValid(creditCardExpiryDateString) ||
                (!validatorCreditCardExpiryDate.isValid(creditCardExpiryDateString) && _selectElementWithHipayId(_idInputMapper['cardExpiryDate']) !== document.activeElement )
            ) {
                errorCollection['cardExpiryDate'] = validatorCreditCardExpiryDate.errorCollection[0]['message'];
            }
        }

        // Credit card security code
        var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
        var creditCardCVVString = params['cvv'];
        if (creditCardCVVString != "") {
            if (!validatorCreditCardCVV.isPotentiallyValid(creditCardCVVString,creditCardNumberUnformatted) ||
                (!validatorCreditCardCVV.isValid(creditCardCVVString) && _selectElementWithHipayId(_idInputMapper['cardCVV']) !== document.activeElement )
            ) {
                if (_selectElementWithHipayId(_idInputMapper['cardCVV'])) {
                    errorCollection['cardCVV'] = validatorCreditCardCVV.errorCollection[0]['message'];
                }
            }
        }

        return errorCollection;
    };

    /**
     * Callback on form change
     * @method HiPay.Form.change
     * @parameter {Function} callback to use when form change
     * @example
     *           HiPay.Form.change(function() {
            // Information on card CVV
            // message CVV
            _selectElementWithHipayId('container-cvv-help-message').innerHTML = HiPay.Form.CVVHelpText();
            // img CVV
            var myImgCVV = _selectElementWithHipayId("cvv-img");
            var cvvInfo = HiPay.getCVVInformation();
            myImgCVV.src = "./img/cvv-type/cvv_"+cvvInfo['length']+".png";

            $("#pay-button").prop('disabled', !HiPay.Form.paymentFormDataIsValid());
            var errorCollection = HiPay.Form.paymentFormDataGetErrors();
        });
     *
     */
    HiPay.Form.change = function(callback) {
        _callbackEventFormChange = callback;
    };

    /**
     * Is valid form data.
     * @method HiPay.Form.paymentFormDataIsValid
     * @return {Boolean} Form is or is not valid
     *
     */
    HiPay.Form.paymentFormDataIsValid = function() {
        var params = {


            card_number: _selectElementValueWithHipayId(_idInputMapper["cardNumber"]),
            card_holder: _selectElementValueWithHipayId(_idInputMapper["cardHolder"]),
            cvc: _selectElementValueWithHipayId(_idInputMapper["cardCVV"]),
            card_expiry_date:_selectElementValueWithHipayId(_idInputMapper["cardExpiryDate"]),
            multi_use: "0"
        };

        if (!_instanceServiceCreditCard) {

            _instanceServiceCreditCard = new _serviceCreditCard();
        }

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        return validatorCreditCard.isValid(params);
    }

    /**
     *
     * @param instance
     * @param payload
     * @param specialValueCallback
     * @private
     */
    var _processObjectPayload = function (instance, payload, specialValueCallback) {
        var propertyConfig = [];

        for (var key in payload || {}) {

            if (typeof instance._mapping === 'object') {

                var mapping = instance._mapping[key];

                if (typeof mapping === 'object') {
                    value = typeof specialValueCallback !== "undefined" ? (specialValueCallback(key, payload[key]) || payload[key]) : payload[key];

                    // Property is writable, value can directly be set
                    if (!_canDefineProperty || mapping.propertyDescriptors.writable) {
                        instance[mapping.name] = value;
                    }

                    // Property not writable, should be redefined
                    else {
                        propertyConfig[mapping.name] =_extend({}, mapping.propertyDescriptors, {
                            value: value,
                            configurable: true // Values might be refreshed later
                        });

                    }
                }
            }
        }

        if (_canDefineProperty) {
            Object.defineProperties(instance, propertyConfig);
        }
    };

    // IE classlist
    if(Object.defineProperty && isIE() < 10) {


        Object.defineProperty(Element.prototype, 'classList', {
            // _defineProperties(Element.prototype, 'classList', {
            get: function () {
                var self = this, bValue = self.className.split(" ")

                bValue.add = function () {
                    var b;
                    for (i in arguments) {
                        b = true;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] == arguments[i]) {
                                b = false
                                break
                            }
                        if (b)
                            self.className += (self.className ? " " : "") + arguments[i]
                    }
                }
                bValue.remove = function () {
                    self.className = ""
                    for (i in arguments)
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] != arguments[i])
                                self.className += (self.className ? " " : "") + bValue[j]
                }
                bValue.toggle = function (x) {
                    var b;
                    if (x) {
                        self.className = ""
                        b = false;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] != x) {
                                self.className += (self.className ? " " : "") + bValue[j]
                                b = false
                            } else b = true
                        if (!b)
                            self.className += (self.className ? " " : "") + x
                    } else throw new TypeError("Failed to execute 'toggle': 1 argument required")
                    return !b;
                }
                bValue.contains = function () {
                    var b;
                    for (i in arguments) {
                        b = false;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] == arguments[i]) {
                                b = true
                                break
                            }

                        return b;
                    }
                }

                return bValue;
            }

        });

    }




    /**
     *
     * @type {{APIIncorrectCredentials: number, APIIncorrectSignature: number, APIAccountNotActive: number, APIAccountLocked: number, APIInsufficientPermissions: number, APIForbiddenAccess: number, APIUnsupportedVersion: number, APITemporarilyUnavailable: number, APINotAllowed: number, APIMethodNotAllowedGateway: number, APIInvalidParameter: number, APIMethodNotAllowedSecureVault: number, APIInvalidCardToken: number, APIRequiredParameterMissing: number, APIInvalidParameterFormat: number, APIInvalidParameterLength: number, APIInvalidParameterNonAlpha: number, APIInvalidParameterNonNum: number, APIInvalidParameterNonDecimal: number, APIInvalidDate: number, APIInvalidTime: number, APIInvalidIPAddress: number, APIInvalidEmailAddress: number, APIInvalidSoftDescriptorCodeMessage: number, APINoRouteToAcquirer: number, APIUnsupportedECIDescription: number, APIUnsupported: number, APIUnknownOrder: number, APIUnknownTransaction: number, APIUnknownMerchant: number, APIUnsupportedOperation: number, APIUnknownIPAddress: number, APISuspicionOfFraud: number, APIFraudSuspicion: number, APIUnknownToken: number, APILuhnCheckFailed: number, APIUnsupportedCurrency: number, APIAmountLimitExceeded: number, APIMaxAttemptsExceeded: number, APIDuplicateOrder: number, APICheckoutSessionExpired: number, APIOrderCompleted: number, APIOrderExpired: number, APIOrderVoided: number, APIAuthorizationExpired: number, APIAllowableAmountLimitExceeded: number, APINotEnabled: number, APINotAllowedCapture: number, APINotAllowedPartialCapture: number, APIPermissionDenied: number, APICurrencyMismatch: number, APIAuthorizationCompleted: number, APINoMore: number, APIInvalidAmount: number, APIAmountLimitExceededCapture: number, APIAmountLimitExceededPartialCapture: number, APIOperationNotPermittedClosed: number, APIOperationNotPermittedFraud: number, APIRefundNotEnabled: number, APIRefundNotAllowed: number, APIPartialRefundNotAllowed: number, APIRefundPermissionDenied: number, APIRefundCurrencyMismatch: number, APIAlreadyRefunded: number, APIRefundNoMore: number, APIRefundInvalidAmount: number, APIRefundAmountLimitExceeded: number, APIRefundAmountLimitExceededPartial: number, APIOperationNotPermitted: number, APITooLate: number, APIReauthorizationNotEnabled: number, APIReauthorizationNotAllowed: number, APICannotReauthorize: number, APIMaxLimitExceeded: number, APIVoidNotAllowed: number, APICannotVoid: number, APIAuthorizationVoided: number, APIDeclinedAcquirer: number, APIDeclinedFinancialInstituion: number, APIInsufficientFundsAccount: number, APITechnicalProblem: number, APICommunicationFailure: number, APIAcquirerUnavailable: number, APIDuplicateTransaction: number, APIPaymentCancelledByTheCustomer: number, APIInvalidTransaction: number, APIPleaseCallTheAcquirerSupportCallNumber: number, APIAuthenticationFailedPleaseRetryOrCancel: number, APINoUIDConfiguredForThisOperation: number, APIRefusalNoExplicitReason: number, APIIssuerNotAvailable: number, APIInsufficientFundsCredit: number, APITransactionNotPermitted: number, APIInvalidCardNumber: number, APIUnsupportedCard: number, APICardExpired: number, APIExpiryDateIncorrect: number, APICVCRequired: number, APICVCError: number, APIAVSFailed: number, APIRetainCard: number, APILostOrStolenCard: number, APIRestrictedCard: number, APICardLimitExceeded: number, APICardBlacklisted: number, APIUnauthorisedIPAddressCountry: number, APICardnotInAuthorisersDatabase: number}}
     */
    HiPay.ErrorReason = {
        APIIncorrectCredentials: 1000001,
        APIIncorrectSignature: 1000002,
        APIAccountNotActive: 1000003,
        APIAccountLocked: 1000004,
        APIInsufficientPermissions: 1000005,
        APIForbiddenAccess: 1000006,
        APIUnsupportedVersion: 1000007,
        APITemporarilyUnavailable: 1000008,
        APINotAllowed: 1000009,
        APIMethodNotAllowedGateway: 1010001,
        APIInvalidParameter: 1010002,
        APIMethodNotAllowedSecureVault: 1010003,
        APIInvalidCardToken: 1012003,
        APIRequiredParameterMissing: 1010101,
        APIInvalidParameterFormat: 1010201,
        APIInvalidParameterLength: 1010202,
        APIInvalidParameterNonAlpha: 1010203,
        APIInvalidParameterNonNum: 1010204,
        APIInvalidParameterNonDecimal: 1010205,
        APIInvalidDate: 1010206,
        APIInvalidTime: 1010207,
        APIInvalidIPAddress: 1010208,
        APIInvalidEmailAddress: 1010209,
        APIInvalidSoftDescriptorCodeMessage: 1010301,
        APINoRouteToAcquirer: 1020001,
        APIUnsupportedECIDescription: 1020002,
        APIUnsupported: 1020003,

        // Validation errors
        APIUnknownOrder: 3000001,
        APIUnknownTransaction: 3000002,
        APIUnknownMerchant: 3000003,
        APIUnsupportedOperation: 3000101,
        APIUnknownIPAddress: 3000102,
        APISuspicionOfFraud: 3000201,
        APIFraudSuspicion: 3040001,
        APIUnknownToken: 3030001,
        APILuhnCheckFailed: 409,

        // Error codes relating to the Checkout Process
        APIUnsupportedCurrency: 3010001,
        APIAmountLimitExceeded: 3010002,
        APIMaxAttemptsExceeded: 3010003,
        APIDuplicateOrder: 3010004,
        APICheckoutSessionExpired: 3010005,
        APIOrderCompleted: 3010006,
        APIOrderExpired: 3010007,
        APIOrderVoided: 3010008,

        // Error codes relating to Maintenance Operations
        APIAuthorizationExpired: 3020001,
        APIAllowableAmountLimitExceeded: 3020002,
        APINotEnabled: 3020101,
        APINotAllowedCapture: 3020102,
        APINotAllowedPartialCapture: 3020103,
        APIPermissionDenied: 3020104,
        APICurrencyMismatch: 3020105,
        APIAuthorizationCompleted: 3020106,
        APINoMore: 3020107,
        APIInvalidAmount: 3020108,
        APIAmountLimitExceededCapture: 3020109,
        APIAmountLimitExceededPartialCapture: 3020110,
        APIOperationNotPermittedClosed: 3020111,
        APIOperationNotPermittedFraud: 3020112,
        APIRefundNotEnabled: 3020201,
        APIRefundNotAllowed: 3020202,
        APIPartialRefundNotAllowed: 3020203,
        APIRefundPermissionDenied: 3020204,
        APIRefundCurrencyMismatch: 3020205,
        APIAlreadyRefunded: 3020206,
        APIRefundNoMore: 3020207,
        APIRefundInvalidAmount: 3020208,
        APIRefundAmountLimitExceeded: 3020209,
        APIRefundAmountLimitExceededPartial: 3020210,
        APIOperationNotPermitted: 3020211,
        APITooLate: 3020212,
        APIReauthorizationNotEnabled: 3020301,
        APIReauthorizationNotAllowed: 3020302,
        APICannotReauthorize: 3020303,
        APIMaxLimitExceeded: 3020304,
        APIVoidNotAllowed: 3020401,
        APICannotVoid: 3020402,
        APIAuthorizationVoided: 3020403,

        // Acquirer Reason Codes
        APIDeclinedAcquirer: 4000001,
        APIDeclinedFinancialInstituion: 4000002,
        APIInsufficientFundsAccount: 4000003,
        APITechnicalProblem: 4000004,
        APICommunicationFailure: 4000005,
        APIAcquirerUnavailable: 4000006,
        APIDuplicateTransaction: 4000007,
        APIPaymentCancelledByTheCustomer: 4000008,
        APIInvalidTransaction: 4000009,
        APIPleaseCallTheAcquirerSupportCallNumber: 4000010,
        APIAuthenticationFailedPleaseRetryOrCancel: 4000011,
        APINoUIDConfiguredForThisOperation: 4000012,
        APIRefusalNoExplicitReason: 4010101,
        APIIssuerNotAvailable: 4010102,
        APIInsufficientFundsCredit: 4010103,
        APITransactionNotPermitted: 4010201,
        APIInvalidCardNumber: 4010202,
        APIUnsupportedCard: 4010203,
        APICardExpired: 4010204,
        APIExpiryDateIncorrect: 4010205,
        APICVCRequired: 4010206,
        APICVCError: 4010207,
        APIAVSFailed: 4010301,
        APIRetainCard: 4010302,
        APILostOrStolenCard: 4010303,
        APIRestrictedCard: 4010304,
        APICardLimitExceeded: 4010305,
        APICardBlacklisted: 4010306,
        APIUnauthorisedIPAddressCountry: 4010307,
        APICardnotInAuthorisersDatabase: 4010309
    }

    /**
     * @param responseJSON
     * @constructor
     */
    HiPay.Token = function (responseJSON) {
        var payload;

        if (typeof responseJSON !== "undefined") {
            payload = responseJSON;
        }
        if (typeof responseJSON.data !== "undefined") {
            payload = responseJSON.data;
        }


        if (typeof payload === 'object') {
            _processObjectPayload(this, $.extend({}, payload, {
                token: payload.token
            }));
        } else {
            _processObjectPayload(this, $.extend({}, payload, {
                token: payload.token
            }));
        }
    };

    /**
     *
     * @constructor
     */
    HiPay.Token = function() {
        _bootstrapInstanceProperties(this);
    };

    /**
     *
     * @param context
     * @param payload
     * @return {*}
     */
    HiPay.Token.populateProperties = function (context, payload) {
        _processObjectPayload(context, payload,  function (key, val){
            // switch (key) {
            // case 'token':
            //     break;
            // }
        });
        return context;
    };

    /**
     * Set environment type (stage or production) to make HiPay API calls in stage or production environment.
     *
     * @method HiPay.setTarget
     * @param target
     */
    HiPay.setTarget = function(target) {
        HiPay.target = target;
        _initListPaymentMethod();
    };

    /**
     * Get environment type (stage or production) to make API calls in stage or production.
     *
     * @method HiPay.getTarget
     * @return string HiPay.target (stage or production)
     */
    HiPay.getTarget = function() {
        return HiPay.target;
    };

    /**
     * Set credentials (username and password of your public HiPay Api credentials). Use only HiPay credentials with public accessibility.
     *
     * @method HiPay.setCredentials
     * @param username
     * @param password
     */
    HiPay.setCredentials = function(username, password) {
        HiPay.username = username;
        HiPay.password = password;

        _initListPaymentMethod();
    };


    var _availablePaymentProductsCustomerCountry = "";
    var _availablePaymentProductsCurrency = "";

    var _customPaymentProducts = [];
    // var _availablePaymentProductsCodeCollection = ["cb", "visa", "mastercard", "american-express", "carte-accord", "bcmc", "maestro", "postfinance-card", "bcmc-mobile", "dexia-directnet", "giropay", "ideal", "ing-homepay", "sofort-uberweisung", "sisal", "sdd", "paypal", "yandex", "payulatam", "paysafecard"];
    var _availablePaymentProductsCollection = [];
    var _availableAndEnabledPaymentProductsCollection = [];

    /**
     * ISO 3166-1 alpha-2 country code
     *
     * @method  HiPay.setAvailalblePaymentProductsCustomerCountry
     * @param {String} countryISO2
     */
    HiPay.setAvailalblePaymentProductsCustomerCountry = function(countryISO2) {
        _availablePaymentProductsCustomerCountry = countryISO2;
        _initListPaymentMethod();
    }

    /**
     * ISO 4217 currency code
     *
     * @method HiPay.setAvailalblePaymentProductsCurrency
     * @param {String} currencyISO4217
     */
    HiPay.setAvailalblePaymentProductsCurrency = function(currencyISO4217) {
        _availablePaymentProductsCurrency = currencyISO4217;
        _initListPaymentMethod();
    }

    /**
     * Payment products list enabled in the payment form. If a payment product is not enabled in your HiPay account, it will be ignore.
     * visa, mastercard, diners, american-express, maestro
     *
     * @method HiPay.enabledPaymentProducts
     * @param {Array} collectionPaymentProducts
     * @example
     *      HiPay.enabledPaymentProducts(['visa', 'maestro']);
     */
    HiPay.enabledPaymentProducts = function(collectionPaymentProducts) {
        _customPaymentProducts = collectionPaymentProducts;
        _initListPaymentMethod();
    }


    function _disableAllInput() {
        for(var propt in _idInputMapper){


            _selectElementWithHipayId(_idInputMapper[propt]).disabled = true;
        }
    }

    function _enableAllInput() {
        for(var propt in _idInputMapper){
            _selectElementWithHipayId(_idInputMapper[propt]).disabled = false;
        }
    }

    /**
     *
     * @param endpoint
     * @param requestParams
     * @param returnPromise
     * @param checkKey
     * @return {Promise|HiPay.Token} A promise of the result that returns a HiPay.Token in case of success
     * @private
     */
    var _performAPICall = function (endpoint, requestParams, returnPromise, checkKey) {
        if ((typeof checkKey === 'undefined' || checkKey) && (typeof HiPay.password === 'undefined' || typeof HiPay.username === 'undefined')) {
            throw new _Error('missing_public_key', 'You have to provide a HiPay username and public key in order to perform API calls.');
            // {"code":'+APIInvalidCardToken+',
        }

        try{
            var authEncoded = window.btoa(HiPay.username + ':' + HiPay.password);
        }catch(e) {
            throw new _Error('missing_public_key');
        }

        // Ne fonctionne pas avec IE 10 ?
        if ('XDomainRequest' in window && window.XDomainRequest !== null && isIE() != 10 && isIE() != 9) {
            requestParams['Authorization'] = 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.password);
        }


        /* headers for Ajax var */
        var config = {
            headers: {
                'Authorization': "Basic " + authEncoded,
                'Content-Type': "application/json"
            }
        };

        function _status(response) {

            if (response.status >= 200 && response.status < 300) {
                return response
            }
            throw new Error(response.statusText)
        }

        function _json(response) {
            return response.json()
        }


        return new Promise(function (resolve, reject) {

            fetch(endpoint, {
                method: "POST",
                headers: config['headers'],
                body: JSON.stringify( requestParams )
            })
                .then(function (response) {

                    // alert(response);
                    return response.json();
                })
                .then(function (result) {

                    if( typeof result['code'] != "undefined" )  {
                        reject(new _APIError(result));
                    }
                    else {
                        var cardToken = new HiPay.Token(result);
                        cardToken.constructor.populateProperties(cardToken,result);
                        _disableAllInput();
                        resolve(cardToken);

                    }

                })
                .catch(function (error) {
                    // retry call
                    fetch(endpoint, {
                        method: "POST",
                        headers: config['headers'],
                        body: JSON.stringify( requestParams )
                    })
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (result) {
                            if( typeof result['code'] != 'undefined' )  {
                                reject(new _APIError(result));
                            }
                            else {
                                var cardToken = new HiPay.Token(result);
                                cardToken.constructor.populateProperties(cardToken,result);
                                _disableAllInput();
                                resolve(cardToken);

                            }

                        })
                        .catch(function (error) {
                            reject(new _APIError(error));

                        });

                });

        });

    };


    var _initAvailableAndEnabledPaymentProductsCollection = function() {
        var _listEnabledPaymentProducts = [];
        _availableAndEnabledPaymentProductsCollection = [];

        if (_availablePaymentProductsCollection.length > 0) {
            if (_customPaymentProducts.length > 0) {
                for (productAvailableIndex in _availablePaymentProductsCollection) {

                    for (productCustomIndex in _customPaymentProducts) {

                        if (_customPaymentProducts[productCustomIndex] == _availablePaymentProductsCollection[productAvailableIndex]['code']) {
                            _availableAndEnabledPaymentProductsCollection.push(_availablePaymentProductsCollection[productAvailableIndex]['code']);
                        }
                    }

                }
            } else {
                for (productAvailableIndex in _availablePaymentProductsCollection) {
                    _availableAndEnabledPaymentProductsCollection.push(_availablePaymentProductsCollection[productAvailableIndex]['code']);
                }
            }
        }
    };

    var _getAvailablePaymentProducts = function() {

        if (!HiPay.getTarget() || !HiPay.username || !HiPay.password || !_availablePaymentProductsCustomerCountry || !_availablePaymentProductsCurrency) {
            return;
        }

        var endpoint = _endPointAvailablePaymentProducts['prod'];
        if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
            endpoint = _endPointAvailablePaymentProducts['stage'];
        } else if (HiPay.getTarget() == 'dev') {
            endpoint = 'http://localhost:8080/example/dev-api-token.php';
        }

        // endpoint = endpoint + "?eci=7&payment_product=visa&payment_product_category_list=credit-card&customer_country=FR&currency=EUR";
        var endpoint2 = endpoint + "?eci=7&customer_country="+_availablePaymentProductsCustomerCountry+"&currency=" + _availablePaymentProductsCurrency;
        var requestParams = {
            'eci': 7,
            'customer_country': _availablePaymentProductsCustomerCountry,
            'currency': _availablePaymentProductsCurrency
        };

        if ('XDomainRequest' in window && window.XDomainRequest !== null && isIE() != 10) {
            requestParams['Authorization'] = 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.password);
        }


        // endpoint = endpoint + "accept_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Faccept&amount=60.0&authentication_indicator=0&cancel_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fcancel&city=Paris&country=FR&currency=EUR&decline_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fdecline&description=Un%20beau%20v%C3%AAtement.&display_selector=0&eci=7&email=client%40domain.com&exception_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fexception&firstname=Martin&gender=U&language=en_US&lastname=Dupont&long_description=Un%20tr%C3%A8s%20beau%20v%C3%AAtement%20en%20soie%20de%20couleur%20bleue.&multi_use=1&orderid=DEMO_59f08c099ca87&payment_product_category_list=ewallet%2Cdebit-card%2Crealtime-banking%2Ccredit-card&pending_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fpending&recipientinfo=Employee&shipping=1.56&state=France&streetaddress2=Immeuble%20de%20droite&streetaddress=6%20Place%20du%20Colonel%20Bourgoin&tax=2.67&zipcode=75012";
        try{
            var authEncoded = window.btoa(HiPay.username+':'+HiPay.password);
        }catch(e) {
            throw new _Error('missing_public_key');
        }

        var config = {
            headers: {
                'Authorization': "Basic " + authEncoded,
                'Accept': "application/json"
            }
        };

        _loadPaymentProduct = true;

        var mypromise = fetch(endpoint, {
            method: "GET",
            headers: config['headers'],
            data: JSON.stringify( requestParams )
        });

        mypromise.then(function (response) {
            return response.json();
        }).then(function (availablePaymentProductsCollection) {
            _availablePaymentProductsCollection = availablePaymentProductsCollection;
            _loadPaymentProduct = false;
        });

        mypromise["catch"](function (error) {
            _loadPaymentProduct = false;
            reject(new _APIError(error));

        });


    };

    var _initListPaymentMethod = function() {
        _getAvailablePaymentProducts();
    };

    var _extend = function () {

        // Variables
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };


    /**
     *
     * @param data
     * @private
     */
    var _APIError = function (data) {

        var payload;


        // dump(data.response.data);
        if (typeof data.response.data !== "undefined") {
            payload = data.response.data;
        }

        if (typeof payload === 'object') {
            _processObjectPayload(this, _extend({}, payload, {
                'code': payload.code,
                'message': payload.message,
                'description': payload.description
            }));
        } else {
            _processObjectPayload(this, _extend({}, payload, {
                'code': "code",
                'message': "other",
                'description': "description"
            }));
        }
    };

    _APIError.prototype = new _Error();

    /**
     *
     * @param code
     * @param message
     * @private
     */

    // var _InvalidParametersError = function (code, message)
    function _InvalidParametersError(code, message)
    {
        _processObjectPayload(this, {
            'type': 'invalid_parameters',
            'code': code,
            'message': message
        });
    };

    _InvalidParametersError.prototype = new _Error();


    /**
     *
     * @param errorCollection
     * @private
     */
    var _InvalidFormTokenizationError = function (errorCollection) {
        _processObjectPayload(this, {
            'type': 'invalid_cc_form',
            'errorCollection': errorCollection
        });
    };

    _InvalidFormTokenizationError.prototype = new _Error();

    /**
     * @property {Object} HiPay.Token
     @property {String} HiPay.CVVInformation.token
     @property {Number} HiPay.CVVInformation.requestId
     @property {String} HiPay.CVVInformation.brand
     @property {String} HiPay.CVVInformation.pan
     @property {String} HiPay.CVVInformation.cardHolder
     @property {Number} HiPay.CVVInformation.cardExpiryMonth
     @property {Number} HiPay.CVVInformation.cardExpiryYear
     @property {String} HiPay.CVVInformation.issuer
     @property {String} HiPay.CVVInformation.country
     @property {String} HiPay.CVVInformation.cardType
     */
    _defineProperties(HiPay.Token, {
        'token': {name: 'token'},
        'requestId': {name: 'request_id'},
        'brand': {name: 'brand'},
        'pan': {name: 'pan'},
        'cardHolder': {name: 'card_holder'},
        'cardExpiryMonth': {name: 'card_expiry_month'},
        'cardExpiryYear': {name: 'card_expiry_year'},
        'issuer': {name: 'issuer'},
        'country': {name: 'country'},
        'cardType': {name: 'card_type'}
    });



    _defineProperties(_APIError, {
        'code': {name: 'code'},
        'message': {name: 'message'}
    });


    _defineProperties(_InvalidParametersError, {
        'code': {name: 'code'},
        'message': {name: 'message'},
        'server_response': {name: 'serverResponse'}
    });


    _defineProperties(_InvalidFormTokenizationError, {
        'code': {name: 'code'},
        'message': {name: 'message'},
        'errorCollection': {name: 'errorCollection'},
        'server_response': {name: 'serverResponse'}
    });

    /**
     * Get a token with credit card information.
     *
     * @method HiPay.tokenize
     * @param {String} cardNumber
     * @param {String} expiryMonth
     * @param {String} expiryYear
     * @param {String} cardHolder
     * @param {String} cvv
     * @param {Boolean} multiUse
     * @param {Boolean} generateRequestId
     * @return {Promise}
     *
     */
    HiPay.tokenize = function(cardNumber, expiryMonth, expiryYear, cardHolder, cvv, multiUse, generateRequestId) {


        var params = {
            'card_expiry_month': expiryMonth,
            'card_expiry_year': expiryYear,
            'card_number': cardNumber,
            'card_holder': cardHolder,
            'cvc': cvv,
            'multi_use': multiUse,
            'generate_request_id': generateRequestId
        }


        var returnPromise =  new Promise(function (resolve, reject) {});
        if(!_isBrowser()) {
            return returnPromise.reject(new _APIError('"message" : "cant tokenize on server side"}'));
        }

        if(params['card_expiry_month'].length < 2) {
            params['card_expiry_month'] = '0' + params['card_expiry_month'];
        }
        if( params['card_expiry_year'].length == 2) {
            params['card_expiry_year']  = '20' +  params['card_expiry_year'];
        }

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        if (validatorCreditCard.isValid(params) === false) {
            var errorCollection = validatorCreditCard.errorCollection;
            var customError = new _InvalidFormTokenizationError(errorCollection);
            customError.errorCollection = errorCollection;
            return Promise.reject(customError);
        }

        else {
            var endpoint = _endPointTokenize['production'];
            if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
                endpoint = _endPointTokenize['stage'];
            } else if (HiPay.getTarget() == 'dev') {
                endpoint = 'http://localhost:8080/example/dev-api-token.php';
            }

            if (!params['generate_request_id']) {
                params['generate_request_id'] = 0;
            }

            if (!params['multi_use']) {
                params['multi_use'] = 0;
            }
            return _performAPICall(endpoint, params, returnPromise);
        }
    };

    /**
     *
     * @param localeString
     */
    HiPay.Form.setLocale = function(localeString) {
        HiPay.Form.locale = localeString;

    };


    /**
     * Helper to display CVV information
     * @method HiPay.Form.CVVHelpText
     * @return {String} CVV information text
     */
    HiPay.Form.CVVHelpText = function() {
        var serviceCreditCard = new _serviceCreditCard();
        var CVVLength = serviceCreditCard.getCreditCardCVVLengthMax();
        if ( typeof CVVLength == "undefined") {
            CVVLength = 3;
        }
        return _translationJSON[HiPay.Form.locale]["FORM_CVV_"+CVVLength+"_HELP_MESSAGE"];
    };

    /**
     * Tokenize form data.
     * @method HiPay.Form.tokenizePaymentFormData
     * @return {Promise|HiPay.Token} A promise of the result that returns a HiPay.Token in case of success
     */

    HiPay.Form.tokenizePaymentFormData = function() {

        if (!HiPay.Form.paymentFormDataIsValid()) {
            return false;
        }

        var creditCardExpiryDate = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);
        var explodeExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);
        var month = explodeExpiryDate[0];
        var year = "20"+explodeExpiryDate[1];
        var params = {
            card_number: _selectElementValueWithHipayId(_idInputMapper.cardNumber),
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: _selectElementValueWithHipayId(_idInputMapper.cardHolder),
            cvv: _selectElementValueWithHipayId(_idInputMapper.cardCVV),
            multi_use: '0',
            generate_request_id: '0'
        };
        return HiPay.tokenize(params['card_number'], params['card_expiry_month'], params['card_expiry_year'], params['card_holder'], params['cvv'], params['multi_use'], params['generate_request_id'] )

    }


    /**
     * Get card type
     * @method HiPay.Form.getCardType
     * @return {String} Payment product name
     */

    HiPay.Form.getCardType = function() {
        _instanceServiceCreditCard = new _serviceCreditCard();
        var cardTypeId = _instanceServiceCreditCard.getCardTypeId();

        for (var product in _idProductAPIMapper) {
            if (cardTypeId === _idProductAPIMapper[product]) {
                return product;
            }
        }

        return undefined;
    };

    /**
     * Set CVV max length
     * @method HiPay.Form.setCreditCardCVVMaxLength
     * @param {Number} cardCVVMaxLength
     * @return {void}
     */
    HiPay.Form.setCreditCardCVVMaxLength = function(cardCVVMaxLength) {
        _instanceServiceCreditCard = new _serviceCreditCard();
        _instanceServiceCreditCard.setCreditCardCVVMaxLength(cardCVVMaxLength);
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initListeners
     * @return {void}
     */
    HiPay.Form.initListeners = function() {
        _initAllFieldsEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardHolderListeners
     * @return {void}
     */
    HiPay.Form.initCardHolderListeners = function () {
        _initCardHolderFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardExpiryDateListeners
     * @return {void}
     */
    HiPay.Form.initCardExpiryDateListeners = function() {
        _initCardExpiryDateFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCVVListeners
     * @return {void}
     */
    HiPay.Form.initCVVListeners = function() {
        _initCVVFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardExpiryMonthListeners
     * @return {void}
     */
    HiPay.Form.initCardExpiryMonthListeners = function() {
        _initCardExpiryMonthFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardExpiryYearListeners
     * @return {void}
     */
    HiPay.Form.initCardExpiryYearListeners = function() {
        _initCardExpiryYearFieldEventListener();
    };

    /**
     * Get id element with field
     * @method  HiPay.Form.getMappedField
     * @return {void}
     */
    HiPay.getMappedField = function(field) {
        return _idInputMapper[field];
    };

    return HiPay;

} (HiPay || {}));