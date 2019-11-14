describe('hapi-shutdown', function(){
  var sigterm = require('../lib/sigterm');
  var plugin = require('../index');
  var should = require('should');

  beforeEach(function(){
    sigterm.logger = function(){};
    sigterm.clear();
  });

  it('should run all the given tasks', function(done){
    var wasRun1 = false;
    var wasRun2 = false;

    sigterm.register({
      taskname: 'mytask1',
      task: function(cb){
        wasRun1 = true;
        cb();
      },
      timeout: 0
    });

    sigterm.register({
      taskname: 'mytask2',
      task: function(cb){
        wasRun2 = true;
        cb();
      },
      timeout: 0
    });

    sigterm.handler(function(){
      wasRun1.should.eql(true);
      wasRun2.should.eql(true);
      done();
    });
  });

  it('should log the run', function(done){
    sigterm.register({
      taskname: 'mytask',
      task: function(cb){ cb(); },
      timeout: 0
    });

    sigterm.logger = function(){
      done();
    };

    sigterm.handler(function(){});
  });

  it('should validate the task is a function', function(){
    var err = sigterm.register({
      taskname: 'mytask',
      task: 'blarg',
      timeout: 0
    });

    var t = err.should.be.an.Error;
  });

  it('should validate the timeout is a number', function(){
    var err = sigterm.register({
      taskname: 'mytask',
      task: function(){},
      timeout: 'blarg'
    });

    var t = err.should.be.an.Error;
  });

  it('should not forcibly return when timeout is 0', function(done){
    var waited = false;

    sigterm.register({
      taskname: 'mytask',
      task: function(cb){
        setTimeout(function(){
          waited = true;
          cb();
        }, 500);
      },
      timeout: 0
    });

    sigterm.handler(function(){
      waited.should.eql(true);
      done();
    });
  });

  it('should forcibly return when timeout elapses', function(done){

    sigterm.register({
      taskname: 'mytask',
      task: function(cb){},
      timeout: 1000
    });

    sigterm.handler(function(){
      done();
    });
  });

  it('should validate serverSpindownTime', function(done){
    var config = { serverSpindownTime: 'blarg' };
    plugin.register({}, config, function(err){
      var t = err.should.be.an.Error;
      done();
    });
  });

  it('should validate plugin config', function(done){
    var config = { foo: 'bar' };
    plugin.register({}, config, function(err){
      var t = err.should.be.an.Error;
      done();
    });
  });

  it('should expose the register method', function(done){
    var config = {};
    var server = {
      log: function(){ },
      root: { stop: function(){} },
      expose: function(key, value){
        key.should.eql('register');
        done();
      }
    };

    plugin.register(server, config, function(){});
  });

  it('should catch the SIGTERM signal', function(done){
    var stopCalled = false;
    var config = {};
    var server = {
      log: function(){ },
      root: { stop: function(options, cb){ stopCalled = true; cb(); } },
      expose: function(){}
    };

    plugin.register(server, config, function(){});

    // override process.exit()
    process.exit = function(){
      stopCalled.should.eql(true);
      done();
    };

    // send SIGTERM to trigger the handler
    process.kill(process.pid, 'SIGTERM');
  });
});
