import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter the Name !!"],
        minLength: [3, "Please provide valide name !!"],
        validate: [validator.isAlpha, "name must cantain alphabet"]
    },
    email: {
        type: String,
        required: [true, "Please enter the Email !!"],
        validate: [validator.isEmail, "please provide valid Email"]
    },
    password: {
        type: String,
        required: [true, "Please enter the Password !!"],
        minLength: [6, "Password must contain at least 6 characters !!"],
    },
    age: {
        type: Number,
        required: true
    }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);