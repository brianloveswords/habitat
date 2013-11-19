# habitat [![Build Status](https://secure.travis-ci.org/brianloveswords/habitat.png)](http://travis-ci.org/brianloveswords/habitat)
## Version 1.1.0

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
export AIRSUPPORT_HOST='lolcathost'
export AIRSUPPORT_PORT=3000
export AIRSUPPORT_WEBSOCKETS=true
```

In this case, you would use  `new habitat('airsupport')` -- the prefix will be
auto-capitalized because only barbarians use lowercase letters in their
environment variables.

`defaults` is an object representing the defaults if a key cannot be
found in the environment. This should be used sparingly.

```js
var env = new habitat('airsupport', { port: 1024 })
// will try the environment first, then fall back to 1024
var port = env.get('port');
```

## habitat#get(key, [*default*])

Gets a key from the environment. Automatically prefixes with the
`prefix` passed to the constructor, if necessary.

`habitat#get` will also try to do some parsing of the value if it looks
like a `boolean`, `number` or `json`, so you can do things like this:

```bash
export APP_ADMINS='["me@example.com", "you@example.com"]'
```
```js
var env = new habitat('app');
var admins = env.get('admins');
console.log(admins.indexOf('you@example.com')) // 1
```

If a `default` is passed, if the key is undefined in either the env or
the constructor-set defaults, it will fall back to that.

### Getting objects
`get` will automatically return objects if you take advantage of common prefixing:

```bash
export APP_DB='redis'
export APP_REDIS_HOST='127.0.0.1'
export APP_REDIS_PORT=6379
```

```js
var env = new habitat('app');
var db = env.get('db');
var options = env.get(db);
console.log(options.host); // '127.0.0.1'
console.log(options.port); // 6379
```

### Getting keys using camelCase
You can also use camelcase instead of underscores if you want, habitat's
got your back.

```bash
export APP_SOME_LONG_KEY='great'
```

```js
var env = new habitat('app');
console.log(env.get('someLongKey')) // 'great'
```

## habitat.get(key)

You can also use `get` directly from the habitat object to get
unprefixed things from the environment.

```js
var path = habitat.get('path');
var nodeEnv = habitat.get('nodeEnv');
```

## habitat.load([*pathToEnvFile*])
Try to load a set of environment variables from a file. This **will** override whatever is in the environment.

Environment file can be in the form of exports:

```bash
# /some/directory/.env
# The leading `export` is optional.
# Useful if you want to be able to also `source /some/directory/.env`

export PARAMETER_ONE=one
export PARAMETER_TWO=two
```

It can also take JSON if you're into that:

```json
{"parameterOne": "one",
 "parameterTwo": "two"}
```

```js
var env = habitat.load('/some/directory/.env'); // returns true on success
console.dir(env.get('parameter')); // { one: 'one', two: 'two' }
```

`pathToEnvFile` defaults to `'.env'`, which will just look for a .env
file in the current working directory.

## habitat#set(key, value)

Sets an environment variable, with prefix if passed.

## habitat#unset(key)

Unsets an environment variable

## habitat#all()

Get an object with all of the things in the environment.

Example:

```bash
export APP_HOST='localhost'
export APP_PORT=3000
export APP_PROTO=http
```
```js
var env = new habitat('app');
var obj = env.all();

console.log(obj.host); // 'localhost'
```

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

var tempEnv = {
  host: 'lolcathost'
  port: 5000
};

// sync
env.temp(tempEnv, function() {
  console.log(env.get('host')) // "lolcathost"
  console.log(process.env['AIRSUPPORT_HOST']) // "lolcathost"
})

console.log(env.get('host')) // "airsupport.io"

// async
env.temp(tempEnv, function(done)
  process.nextTick(function(){
    console.log(env.get('port')) // 5000
    done();
  });
})
```
# License

MIT
