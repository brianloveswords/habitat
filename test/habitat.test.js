var fs = require('fs');
var pathutil = require('path');
var test = require('tap').test;
var util = require('util');

var habitat = require('..');

test('habitat#get: basic test', function (t) {
  process.env['HABITAT_HELLO'] = 'world';

  var env = new habitat('habitat');
  t.same(env.get('hello'), 'world');

  var env2 = new habitat('HABITAT');
  t.same(env.get('HELLO'), 'world');
  t.end();
});

test('habitat#get: no prefix', function (t) {
  process.env['SOMETHING'] = 'that thing';
  var env = new habitat();
  t.same(env.get('something'), 'that thing');
  t.end();
});

test('habitat.get: shortcut for non-prefixed things', function (t) {
  process.env['SOMETHING'] = 'other thing';
  t.same(habitat.get('something'), 'other thing');
  t.end();
});

test('habitat#set: set a value', function (t) {
  var env = new habitat('habitat');
  env.set('lol', 'wut');
  t.same(env.get('lol'), process.env['HABITAT_LOL'], 'should be "wut"');
  t.end();
});


test('habitat#temp: syncronous', function (t) {
  var env = new habitat('habitat');
  process.env['HABITAT_HELLO'] = 'universe';
  env.temp({
    hello: 'world',
    goodnight: 'moon'
  }, function () {
    t.same(process.env['HABITAT_HELLO'], 'world');
    t.same(env.get('hello'), 'world');
  });

  t.same(env.get('hello'), 'universe');
  t.end();
});

test('habitat#temp: asyncronous', function (t) {
  var env = new habitat('habitat');
  process.env['HABITAT_HELLO'] = 'universe';
  env.temp({
    hello: 'world',
    goodnight: 'moon'
  }, function (done) {
    t.same(process.env['HABITAT_HELLO'], 'world');
    t.same(env.get('hello'), 'world');

    done();

    t.same(env.get('hello'), 'universe');
    t.end();
  });

});

test('habitat constructor: defaults', function (t) {
  process.env['HABITAT_AWESOME'] = 'yep';
  var env = new habitat('habitat', {
    rad: 'to the max',
    awesome: 'to the extreme'
  });
  t.same(env.get('rad'), 'to the max');
  t.same(env.get('awesome'), 'yep');
  t.end();
});

test('habitat#unset', function (t) {
  process.env['HABITAT_WUT'] = 'lol';
  var env = new habitat('habitat');
  env.unset('wut');
  t.notOk(env.get('wut'), 'should not get a result');
  t.end();
});

test('habitat.parse: parse potential things', function (t) {
  t.same(typeof habitat.parse('true'), 'boolean');
  t.same(typeof habitat.parse('false'), 'boolean');
  t.same(typeof habitat.parse('3000'), 'number');
  t.same(typeof habitat.parse('12.0'), 'number');
  t.same(typeof habitat.parse('{"hi": "hello"}'), 'object');
  t.same(habitat.parse('{"hi": "hello"}').hi, 'hello');
  t.same(typeof habitat.parse('[1,2,3]'), 'object');
  t.same(habitat.parse('[1,2,3]')[2], 3);
  t.same(typeof habitat.parse('12/>SDc80'), 'string');
  t.end();
});

test('habitat#get: array parsing', function (t) {
  process.env['HABITAT_ADMINS'] = '["me@example.com", "you@example.com"]';
  var env = new habitat('habitat');
  t.same(env.get('admins').indexOf('you@example.com'), 1);
  t.end();
});


test('habitat#get: defaults', function (t) {
  var env = new habitat('noexist');
  t.same(env.get('port', 3000), 3000);
  t.same(env.get('yayay'), undefined);
  t.end();
});
