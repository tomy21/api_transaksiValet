const response = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    payload: {
      statusCode: statusCode,
      message: message,
      data: data,
    },
  });
};

export default response;
