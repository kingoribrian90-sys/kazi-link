const AppError = require("../utils/AppError");

function validate(schema, source = "body") {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return next(new AppError(400, message));
    }
    req[source] = parsed.data;
    return next();
  };
}

module.exports = validate;
