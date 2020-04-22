var Joi = require("@hapi/joi");

module.exports.plugin = Joi.object({
  serverSpindownTime: Joi.number().integer().min(0)
});

module.exports.task = Joi.object({
  taskname: Joi.string().required(),
  task: Joi.func().required(),
  timeout: Joi.number().integer()
});
