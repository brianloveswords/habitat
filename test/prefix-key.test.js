var prefixKey = require('../lib/prefix-key');
var test = require('tap').test;

test('prefix-key: with null prefix', function(t) {
  t.same(prefixKey(null, 'key'), 'key', 'should return key');
  t.end();
});

test('prefix-key: with undefined prefix', function(t) {
  t.same(prefixKey(undefined, 'key'), 'key', 'should return non-prefixed key');
  t.end();
});

test('prefix-key: with null prefix', function(t) {
  t.same(prefixKey('', 'key'), 'key', 'should return non-prefixed key');
  t.end();
});

test('prefix-key: with prefix', function(t) {
  t.same(prefixKey('prefix', 'key'), 'prefix_key', 'should return prefixed key');
  t.end();
});
