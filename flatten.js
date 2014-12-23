const fromCamelCase = require('./from-camel-case')
const reduce = require('lodash.reduce')
const xtend = require('xtend')
const prefixKey = require('./prefix-key')

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
