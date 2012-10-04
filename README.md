# habitat [![Build Status](https://secure.travis-ci.org/brianloveswords/habitat.png)](http://travis-ci.org/brianloveswords/habitat)

Library for managing your environment vars.

# Why

According to [factor 3](http://www.12factor.net/config), you should be
storing your configuration as environment variables. Writing
`process.env` everywhere can be real annoying, so this abstracts away of
that manipulation. It also provides some nice little nicities for testing.

# Installation

Why NPM of course!

```bash
$ npm install habitat
```

# Usage

## new habitat([*prefix*, [*defaults*]])

Creates a new environment manipulator.

`prefix` is the prefix for your environment variables. For example, if
your app is called `airsupport`, it's probably good to namespace your
environment variables like so:

```bash
export AIRSUPPORT_HOST=lolcathost
export AIRSUPPORT_PORT=3000
export AIRSUPPORT_WEBSOCKETS=true
```

In this case, your prefix will `'airsupport'` -- prefixes will be
auto-capitalized because only barbarians use lowercase letters in their
environment variables.

Note that you don't have to pass in a prefix, if you're crazy like
that. Keys will be looked up (after capitalization) straight from the
env:

```js
var env = new habitat;
var path= env.get('path'); 
```

`defaults` is an object representing the defaults if a key cannot be
found in the environment. This should be used sparingly.

```js
var env = new habitat('airsupport', { port: 3000 })
// will try the environment first, then fall back to 3000
var port = env.get('port');
```

## habitat#get(key)

Gets a key from the environment. Automatically prefixes with the
`prefix` passed to the constructor, if necessary.

`habitat#get` will also try to do some parsing of the value if it looks
like a `boolean`, `number` or `json`, so you can do things like this:

```bash
exports APP_ADMINS='["me@example.com", "you@example.com"]';
```
```js
var env = new habitat('app');
var admins = env.get('admins');
console.log(admins.indexOf('you@example.com')) // 1
```

## habitat#set(key, value)

Sets an environment variable, with prefix if passed.

## habitat#unset(key)

Unsets an environment variable

## habitat#temp(object, callback)

Temporarily overrides environment variables with values from `object`.

`callback` can be syncronous if defined without any parameters, or async
if defined with a single parameter.

Example:
```js

var env = new habitat('airsupport', {
  protocol: 'http',
  host: 'airsupport.io',
  port: 3000
});

// sync 
var tempEnv = {
  host: 'lolcathost'
  port: 5000
};

env.temp(tempEnv, function() {
  console.log(env.get('host')) // "lolcathost"
  console.log(process.env['AIRSUPPORT_HOST']) // "lolcathost"
})

console.log(env.get('host')) // "airsupport.io"

// async
env.temp({tempEnv, function(done)
  process.nextTick(function(){
    console.log(env.get('port')) // 5000
    done();
  });
})
```
# License

MIT
