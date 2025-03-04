abstract class ApplicationError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

class BadRequest extends ApplicationError { }
class ValidationError extends BadRequest { }
class Unauthorized extends BadRequest { }
class Forbidden extends BadRequest { }
class NotFound extends BadRequest { }

export {
  ApplicationError,
  BadRequest,
  Forbidden,
  NotFound,
  Unauthorized,
  ValidationError,
};
