import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


export const Register = asyncHandler(async (req, res) => {

    const { name, email, password, age } = req.body;
    console.log(`${name} ${email} ${password} ${age}`)
    if (!name || !email || !password || !age === "") {
        throw new ApiError(400, "Please fill all field !!");
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(400, "Email already exist !!")
    }

    const user = await User.create({
        name,
        email,
        password,
        age
    })
    res.status(200).json(
        new ApiResponse(200, user, "User registered Successfully")
    )
})


export const Login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password === "") {
        throw new ApiError(400, "Please fill all field !!");
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        throw new ApiError(400, "Invalid eamil or password !!");
    }
    const isPasswordMatched = await user.comparePassword(password);
    console.log(`this is password field ${isPasswordMatched}`)
    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid eamil or password !!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})


export const Logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

