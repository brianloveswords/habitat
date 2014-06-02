var Habitat = require('..');
var path = require('path');
var test = require('tap').test;

test('process.env and habitat.load priority', function(t) {
  process.env = {
    A: '1st'
  };
  Habitat.load(path.join(__dirname + '/2nd.env'));
  Habitat.load(path.join(__dirname + '/3rd.env'));

  var env = new Habitat();

  t.same(env.get('A'), '1st');
  t.same(env.get('B'), '2nd');
  t.same(env.get('C'), '3rd');
  t.end();
});

test('process.env and habitat.load priority with json', function(t) {
  process.env = {
    A: '1st'
  };
  Habitat.load(path.join(__dirname + '/2nd-json.env'));
  Habitat.load(path.join(__dirname + '/3rd-json.env'));

  var env = new Habitat();

  t.same(env.get('A'), '1st');
  t.same(env.get('B'), '2nd');
  t.same(env.get('C'), '3rd');
  t.end();
});
