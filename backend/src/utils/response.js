function sendSuccess(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

function pageResult(items, page, limit, total) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

module.exports = { sendSuccess, pageResult };
