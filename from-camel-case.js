/**
 * Convert a camelcased string to an underscored string
 *
 * @param {String} input
 * @return {String} underscored string
 */

module.exports = function fromCamelCase(input) {
  var expression = /([a-z])([A-Z])/g;
  return input.replace(expression, function (_, lower, upper) {
    return lower + '_' + upper.toLowerCase();
  });
}
