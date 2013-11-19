const test = require('tap').test
const flatten = require('../flatten')

test('flattening', function (t) {
  t.same(
   flatten({
     a: { b: {c: 'sup'},
          b2: 'hi'},
     a2: 'yah'
   }), { A_B_C: 'sup', A_B2: 'hi', A2: 'yah' })
  t.end()
})
