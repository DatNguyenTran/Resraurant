const crypto = require("crypto");
const { promisify } = require("util");
const randomBytesAsync = promisify(crypto.randomBytes);
exports.genarateResetToken = async () => {
  const buffer = await randomBytesAsync(32);
  const resetToken = buffer.toString("hex");
  return resetToken;
};
