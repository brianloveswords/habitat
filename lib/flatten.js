const fromCamelCase = require('./from-camel-case')
const xtend = require('xtend')
const prefixKey = require('./prefix-key')

function reduce(obj, fn, collector) {
  var keys = Object.keys(obj);
  for (var i = 0, len = keys.length; i < len; i++) {
    collector = fn(collector, obj[keys[i]], keys[i])
  }
  return collector
}

module.exports = function flatten(obj, prefix) {
  prefix = prefix || ''

  function makeKey(s) {
    return prefixKey(prefix, s)
  }

  return reduce(obj, function (result, val, key) {
    const newKey = fromCamelCase(makeKey(key)).toUpperCase()

    if (typeof val == 'object' && !Array.isArray(val))
      return xtend(result, flatten(val, newKey))

    else
      result[newKey] = val

    return result
  }, {})
}
