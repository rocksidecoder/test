class ExtendableError extends Error {
  constructor({ message, errors, status, isPublic, stack }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.stack = stack;
  }
}

class APIError extends ExtendableError {
  constructor({ message, errors, stack, status = 500, isPublic = true }) {
    super({ message, errors, status, isPublic, stack });
  }
}

module.exports = APIError;
