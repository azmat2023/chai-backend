// import { response } from "express";
import { asyncHandler } from "../utils/asyncHandller.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadONCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  // check if user already exists:username , email
  //check for images , check for avatar
  //upload them to cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  //work with step
  //get user details from frontend

  const { fullName, email, username, password } = req.body;
  // console.log("Email : ", email);
  // console.log("Password : ", password);
  // console.log("fullName : ", fullName);
  // console.log("Username : ", username);
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "FullName is required");
  }

  // check if user already exists:username , email

  User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User With email or username already exists");
  }

  //check for images , check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log(req.body)
  if (!avatarLocalPath) {
    throw new ApiError(400, " Avatar file is required");
  }

  //upload them to cloudinary

  const avatar = await uploadONCloudinary(avatarLocalPath);
  const coverImage = await uploadONCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, " Avatar file is required");
  }

  //create user object - create entry in db.

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //coverImage check if hava then give url and if not then ""
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong whiel registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export { registerUser };
