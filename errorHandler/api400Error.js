/* eslint-disable space-before-function-paren */

// Usage:
// const Api400Error = require('../errorHandler/api400Error')

// ...
// const user = await User.getUserById(req.params.id)
// if (user === null) {
//  throw new Api404Error(`User with id: ${req.params.id} not found.`)
// }
// ...

const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api400Error extends BaseError {
  constructor (
    name,
    statusCode = httpStatusCodes.BAD_REQUEST,
    description = 'Bad Request.',
    isOperational = true,
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api400Error;
