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

test('habitat#set: set an array value', function (t) {
  const env = new habitat('habitat');
  const expect = [1,2,3];
  env.set('array', expect);
  t.same(env.get('array'), expect);
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

test('habitat#temp: with array', function (t) {
  var env = new habitat('habitat');
  env.temp({
    array: [1, 2, 3]
  }, function () {
    t.same(env.get('array'), [1, 2, 3]);
  });
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

test('habitat#all', function (t) {
  process.env['HABITAT_YEP'] = 'yeah';
  process.env['HABITAT_NOPE'] = 'naw';
  var env = new habitat('habitat');
  var obj = env.all();
  t.same(obj.yep, 'yeah');
  t.same(obj.nope, 'naw');
  t.end();
});

test('habitat#rawKeys', function (t) {
  process.env['OTHERAPP_HOST'] = 'not-local-host';
  process.env['RAWKEYS_HOST'] = 'localhost';
  process.env['RAWKEYS_PORT'] = 3000;
  var env = new habitat('rawkeys');
  t.same(env.rawKeys(), ['RAWKEYS_HOST', 'RAWKEYS_PORT'])
  t.end();
});

test('habitat#getAsObject', function (t) {
  process.env['APP_REDIS_HOST'] = 'localhost';
  process.env['APP_REDIS_PORT'] = 3000;
  var env = new habitat('app');
  var obj = env.getAsObject('redis');
  t.same(obj.host, 'localhost');
  t.same(obj.port, 3000);
  t.end();
});

test('habitat#get: should try `getAsObject` if no value is found', function (t) {
  process.env['APP_REDIS_HOST'] = 'localhost';
  process.env['APP_REDIS_PORT'] = 3000;
  var env = new habitat('app');
  var obj = env.get('redis');
  t.same(obj.host, 'localhost');
  t.same(obj.port, 3000);

  var value = env.get('nonexistent');
  t.notOk(value, 'should not have a value');
  t.end();
});

test('habitat#get: should not use default when there is a valid obj', function (t) {
  process.env['APP_REDIS_HOST'] = 'localhost';
  process.env['APP_REDIS_PORT'] = 3000;
  var env = new habitat('app');
  var obj = env.get('redis', { host: 'nope', port: 1e300 });
  t.same(obj.host, 'localhost');
  t.same(obj.port, 3000);
  t.end();
});

test('habitat#get: should try to expand camelcase', function (t) {
  process.env['APP_REDIS_HOST'] = 'localhost';
  process.env['APP_REDIS_PORT'] = 3000;
  var env = new habitat('app');
  var host = env.get('redisHost');
  var port = env.get('redisPort');
  t.same(host, 'localhost');
  t.same(port, 3000);
  t.end();
});

test('habitat.load: load some shit in from a file', function (t) {
  var path = pathutil.join(__dirname, '.env');
  habitat.load(path);
  t.same(process.env['PARAMETER_ONE'], 'one=1');
  t.same(process.env['PARAMETER_TWO'], 'two');
  t.end();
});

test('habitat.load crash regression: load a file that has blank newlines', function(t) {
  var path = pathutil.join(__dirname, 'env.blank');
  var env = habitat.load(path);
  t.ok(true, "habitat didn't crash when loading from file");
  t.end();
});

test('habitat.load crash regression: load a file that has comments', function(t) {
  var path = pathutil.join(__dirname, 'env.comments');
  var env = habitat.load(path);
  t.ok(true, "habitat didn't crash when loading from file");
  t.same(env.get('A'), 'B')
  t.end();
});

test('habitat.load crash regression: load a json file', function(t) {
  var path = pathutil.join(__dirname, 'env.json');
  var env = habitat.load(path);
  t.same(env('db').get('nestedMore'), 'stuff')
  t.end();
});
