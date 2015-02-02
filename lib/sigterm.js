var async = require("async");
var schema = require("./schema");
var triggers = {};

module.exports.logger = function(){ };

module.exports.register = function(task){
  var res = schema.task.validate(task);
  if(res.error){
    return res.error;
  }

  triggers[task.name] = task;
};

module.exports.clear = function(){ triggers = {}; };

module.exports.handler = function(fin){
  var keys = Object.keys(triggers);

  async.each(keys, (function(key, done){
    var task = triggers[key];
    this.logger(["shutdown"], "running task: " + task.name);

    task.task(done);

    if(task.timeout > 0){
      setTimeout(function(){
        done();
      }, task.timeout);
    }

  }).bind(this), function(err){
    fin(err);
  });
};
