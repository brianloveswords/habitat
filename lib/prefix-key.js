module.exports = function(prefix, key) {
  return prefix ? prefix + '_' + key : key;
};