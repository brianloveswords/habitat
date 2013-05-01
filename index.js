var fs = require('fs');
var pathutil = require('path');

function habitat(prefix, defaults) {
  if (!(this instanceof habitat))
    return new habitat(prefix);
  if (prefix)
    this.prefix = prefix.toUpperCase();
  if (defaults)
    this.defaults = this.setDefaults(defaults);
};

/**
 * Setup default environment options
 */

habitat.prototype.setDefaults = function setDefaults(defaults) {
  eachKey(defaults, function (key) {
    if (typeof this.get(key) === 'undefined')
      this.set(key, defaults[key])
  }.bind(this));
  return this;
};

/**
 * Get a key from the environment with the prefix is one was passed
 * in at construction time.
 *
 * @param {String} key The key to lookup in the environment
 * @param {Mixed} someDefault
 * @return {Mixed} Result of the key lookup
 */

habitat.prototype.get = function get(key, someDefault) {
  var value, envkey;
  if (key.match(/[a-z]+[A-Z]/))
    return this.get(fromCamelCase(key));

  envkey = this.envkey(key);
  value = process.env[envkey];

  // try straight up
  if (typeof value !== 'undefined')
    return habitat.parse(value);

  // try as an object
  value = this.getAsObject(key);
  if (typeof value !== 'undefined') {
    if (Object.keys(value).length)
      return value;
  }

  // fallback
  return someDefault;
};

/**
 * Attempt to nativize things coming from the environment.
 *
 * @param {String} thing The string coming in from the environment
 * @return {Mixed} A native object if parseable, otherwise raw string
 */

habitat.parse = function parse(thing) {
  var bool = /^(true|false)$/;
  var number = /^\d+(\.\d+)?$/;
  var json = /^(\{.*?\})|(\[.*?\])$/;
  if (bool.test(thing))
    return thing === 'true';
  if (number.test(thing))
    return parseInt(thing, 10);
  if (json.test(thing)) {
    try { return JSON.parse(thing) }
    catch(err) { return thing }
  }
  return thing;
};


/**
 * Set a value on the environment
 *
 * @param {String} key
 * @param {String} value
 * @param {Object} this
 */

habitat.prototype.set = function set(key, value) {
  var envkey = this.envkey(key);
  if (typeof value !== 'string' && typeof value !== 'number')
    value = JSON.stringify(value);
  process.env[envkey] = value;
  return this;
};

habitat.prototype.unset = function unset(key) {
  var envkey = this.envkey(key);
  delete process.env[envkey];
  return this;
};

/**
 * Set a temporary environment. Useful for testing.
 */

habitat.prototype.temp = function (obj, callback) {
  var original = {};
  eachKey(obj, function (key) {
    var envkey = this.envkey(key);
    original[key] = this.get(key);
    this.set(key, obj[key]);
  }.bind(this));

  var reset = function reset() {
    eachKey(original, function (key) {
      if (typeof original[key] !== 'undefined')
        this.set(key, original[key]);
      else
        delete this.unset(key);
    }.bind(this));
  }.bind(this);

  if (callback.length === 0) {
    callback();
    return reset();
  }

  return callback(reset);
};


/**
 * Create the environment key string with the (optional) prefix.
 *
 * @param {String} key
 * @param {String} Prepared environment key string.
 */

habitat.prototype.envkey = function envkey(key) {
  var envkey;
  if (this.prefix)
    envkey = this.prefix + '_' + key.toUpperCase();
  else
    envkey = key.toUpperCase();
  return envkey;
};

/**
 * Get an object with all of the stuff in the environment
 *
 * @return {Object}
 */

habitat.prototype.all = function all() {
  var prefix = this.prefix;
  if (!prefix) return process.env;
  var keys = this.rawKeys();
  return keys.reduce(function (obj, key) {
    var lowerKey = key.replace(prefix + '_', '').toLowerCase();
    obj[lowerKey] = habitat.parse(process.env[key]);
    return obj;
  }, {});
};

habitat.prototype.rawKeys = function rawKeys() {
  var prefix = this.prefix;
  var keys = Object.keys(process.env);
  if (!prefix) return keys;
  return keys.reduce(function (accum, key) {
    if (key.indexOf(prefix) === 0)
      accum.push(key);
    return accum;
  }, []);
};

/**
 * Get an object by key
 *
 * @param {String} keyPrefix
 * @return {Object}
 */

habitat.prototype.getAsObject = function getAsObject(keyPrefix) {
  var envkey = this.envkey(keyPrefix);
  var env = new habitat(envkey);
  return env.all();
};

/**
 * Get a key from the environment without a prefix.
 *
 * @see habitat#get
 */

habitat.get = function get() {
  var env = new habitat();
  return env.get.apply(env, arguments)
};

/**
 * Load some things from an env file into the environment.
 *
 * @param {String} path The path to the environment file.
 * @return {Boolean} true if able to load, false otherwise.
 */

habitat.load = function load(path) {
  path = path || '.env';
  if (!fileExists(path))
    return false;
  var exports = fs.readFileSync(path).toString().split('\n');
  exports.filter(function(param) {
    return !!param.match(/(.+?)=(.*)/);
  }).map(function (param) {
    var match = param.replace(/^export /i, '').match(/(.+?)=(.*)/);
    var key = match[1];
    var value = match[2];
    if ((match = value.match(/^(?:'|")(.*)(?:'|")$/)))
      value = match[1];
    return { key: key, value: value };
  }).forEach(function (param) {
    if (process.env[param.key]) return;
    process.env[param.key] = param.value;
  });
  return true;
};

/**
 * Shortcut for Object.keys(obj).forEach(fn);
 */

function eachKey(obj, fn) {
  return Object.keys(obj).forEach(fn);
}

/**
 * Convert a camelcased string to an underscored string
 *
 * @param {String} input
 * @return {String} underscored string
 */

function fromCamelCase(input) {
  var expression = /([a-z])([A-Z])/g;
  return input.replace(expression, function (_, lower, upper) {
    return lower + '_' + upper.toLowerCase();
  });
}

/**
 * Check file existence.
 * For supporting both node 0.6 and node 0.8
 */

function fileExists(path) {
  return (fs.existsSync || pathutil.existsSync)(path);
}

module.exports = habitat;
