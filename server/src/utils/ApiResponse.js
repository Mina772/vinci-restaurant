/** Uniform success envelope for all API responses. */
export class ApiResponse {
  constructor(statusCode, data = null, message = "Success", meta = undefined) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }

  static ok(res, data, message = "Success", meta) {
    return new ApiResponse(200, data, message, meta).send(res);
  }
  static created(res, data, message = "Created") {
    return new ApiResponse(201, data, message).send(res);
  }
}
