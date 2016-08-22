'use strict';

const Joi = require('joi');

const authenticateUserSchema = Joi.object({
  fb_uid: Joi.string().required(),
  access_token: Joi.string().required()
});

module.exports = authenticateUserSchema;