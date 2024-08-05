export const successResponse = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode, message, error) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    error,
  });
};
