#Hapi-shutdown
[![Build Status](https://travis-ci.org/opentable/hapi-shutdown.png?branch=master)](https://travis-ci.org/opentable/hapi-shutdown) [![NPM version](https://badge.fury.io/js/hapi-shutdown.png)](http://badge.fury.io/js/hapi-shutdown) ![Dependencies](https://david-dm.org/opentable/hapi-shutdown.png)

Plugin listens to SIGTERM and then runs optional triggers before calling server.stop

This is for things that need to happen *before* `server.stop` is called.

For things that need to happen after server.stop, you can use `server.on('stop', ...)`

Usage:

```
var Hapi = require("hapi");
var server = new Hapi.Server();

server.register([
  {
    plugin: require('hapi-shutdown'),
    options: {
      serverSpindownTime: 10000 // time to wait for existing connections before forcibly stopping the server
    }
  }],
  function(err){
    server.start(function(){

      server.plugins['hapi-shutdown'].register({
        taskname: 'do stuff',
        task: function(done){ console.log('doing stuff before server.stop is called'); done(); },
        timeout: 2000 // time to wait
      })
    });
  });

```

__.register(_task_)__

Register a task to be run before server.stop is called. Can be called as part of another plugin, or using `server.after()`.

Param: `task`
```
{
  taskname: 'mytask', // used for logging and to guard against multiple registrations
  task: function(done){
    // do stuff
    done()
  },
  timeout: 2000 // time in ms to wait for the task to complete
}
```

Returns: a joi validation error for the task.

__Logging__:

Will log using 'server.log()' and the tag "shutdown"
