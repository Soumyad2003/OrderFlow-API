const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: "Check the API documentation at /api-docs",
  });
};

export default notFoundHandler;
