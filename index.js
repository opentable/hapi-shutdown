var sigterm = require("./lib/sigterm");
var schema = require("./lib/schema");

exports.register = function(server, options, next){
  var res = schema.plugin.validate(options);
  if(res.error){
    return next(res.error);
  }

  sigterm.logger = function(msg){ server.log(["shutdown"], msg); };
  process.on('SIGTERM', function(){
    server.log(["shutdown"], "got SIGTERM; running triggers before shutdown");
    sigterm.handler(function(err){
      server.log(["shutdown"], "calling server.stop");
      server.root.stop({ timeout: options.serverSpindownTime }, function(){
        process.exit(0);
      });
    });
  });

  server.expose('register', sigterm.register);

  next();
};

exports.pkg=require('./package.json');
