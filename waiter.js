var WaiterContext = this;
/**
 *
 * @param {Number} timeout Max time in milliseconds
 * @param {Number} interval Interval in milliseconds
 * @param {Function} condition Return your condition's result or run callback with this result as first argument (if your handling is async). Not both together! If you return array then its will be passed to callback at the end of the list of arguments
 * @param {Function} callback Callback function
 * @returns {waiter}
 * @constructor
 */
waiter = function Waiter (timeout, interval, condition, callback) {
  var options,
      args = Waiter.toArray(arguments),
      isCleanedArgs = args[4] || false;

  if (!isCleanedArgs) {
    options = Waiter._parseArgs(args);
    timeout = options.timeout;
    interval = options.interval;
    condition = options.condition;
    callback = options.callback;
  }

  // singleton
  if (!(this instanceof Waiter)) {
    isCleanedArgs = true;
    return new Waiter(timeout, interval, condition, callback, isCleanedArgs);
  }

  this.timeout = timeout;
  this.interval = interval;
  this.condition = condition;
  this.cb = callback;

  /**
   * @type {boolean}
   */
  this.done = false;
  /**
   * @type {number}
   */
  this.elapsedTime = 0;
  /**
   * @type {number}
   */
  this.iteration = 0;
  /**
   * @type {Number}
   */
  this.tstart = Waiter.getTimeInMs();

  this.check();
};

/**
 * @param {[]} args
 * @returns {{}}
 * @private
 */
Waiter._parseArgs = function (args) {
  var options,
      defaults = {
        timeout: 1,
        interval: 1,
        condition: Waiter.noopPositive,
        conditionAsync: false,
        cb: Waiter.noop
      };

  if (args.length == 1) {
    options = args[0];
  } else {
    options.timeout = args[0] || false;
    options.interval = args[1] || false;
    options.condition = args[2] || false;
    options.callback = args[3] || false;
  }

  var result = {};
  result.timeout = parseInt(options.timeout, 10) || defaults.timeout;
  result.interval = parseInt(options.interval, 10) || defaults.interval;
  result.condition = (typeof options.condition == 'function') ? options.condition : defaults.condition;
  result.callback = (typeof options.callback == 'function') ? options.callback : defaults.cb;

  return result;
};

/**
 * @type {{constructor: Function, check: Function, afterCheck: Function, runCallback: Function}}
 */
Waiter.prototype = {
  constructor: Waiter,

  check: function () {
    var self = this;
    var conditionResult, cbArgs;
    self.iteration = self.iteration + 1;
    self.elapsedTime = Waiter.getTimeInMs() - self.tstart;
    if (!self.done) {
      if (self.elapsedTime <= self.timeout) {
        conditionResult = self.condition(self.elapsedTime, self.iteration, self.afterCheck.bind(this));
        self.afterCheck(conditionResult);
      } else {
        // timeout
        cbArgs = [new Error(Waiter.errText), self.elapsedTime, self.iteration];
        self.runCallback.apply(self, cbArgs);
      }
    }
  },
  afterCheck: function (conditionResult) {
    var self = this;
    var cbArgs;
    if (typeof conditionResult != 'undefined') {
      if (!!conditionResult) {
        self.done = true;
        cbArgs = [null, self.elapsedTime, self.iteration];
        if (Waiter.isArray(conditionResult)) {
          cbArgs = cbArgs.concat(conditionResult);
        }
        self.runCallback.apply(self, cbArgs);
      } else {
        setTimeout(function () {
          self.check();
        }, self.interval);
      }
    }
  },
  runCallback: function (args) {
    if (typeof args == 'undefined' || !Waiter.isArray(args)) {
      args = Waiter.toArray(arguments);
    }

    var cb = this.cb;

    delete(this); // self destruction

    cb.apply(WaiterContext, args);
  }
};

/**
 * Error message if time elapsed with false condition
 * @type {string}
 */
Waiter.errText = '[waiter.js] Timeout with false condition';

/**
 * Plug function
 */
Waiter.noop = function () {};

/**
 * Positive plug function
 * @returns {boolean}
 */
Waiter.noopPositive = function () { return true; };

/**
 * Return current timestamp in milliseconds
 * @returns {Number}
 */
Waiter.getTimeInMs = function () {
  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }
  return Date.now();
};

/**
 * @param raw
 * @returns {Array}
 */
Waiter.toArray = function (raw) {
  return Array.prototype.slice.call(raw, 0);
};
/**
 * @param arg
 * @returns {boolean}
 */
Waiter.isArray = function (arg) {
  if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  return Array.isArray(arg);
};

if (module && module.exports) {
  module.exports = waiter;
}

