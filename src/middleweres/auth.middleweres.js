import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandller.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      throw new ApiError(401, "Uauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!User) {
      //TODO:discuss about frontend
      throw new ApiError(401, "Invalid access Token");
    }

    req.user = User;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid acess Token");
  }
});
