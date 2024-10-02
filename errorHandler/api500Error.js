// Usage:
// const Api500Error = require('../errorHandler/api500Error')

// ...
// const user = await User.getUserById(req.params.id)
// if (user === null) {
//  throw new Api404Error(`User with id: ${req.params.id} not found.`)
// }
// ...

const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api500Error extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.INTERNAL_SERVER,
    description = 'Internal Server Error.',
    isOperational = true,
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api500Error;
