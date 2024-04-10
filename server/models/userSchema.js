// userschema.js
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const keysecret = "vrajjariwalanityasheth";

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true, 
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email format");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String
    },
    cid: {
        type: String,
        required: true,
    },
    mobileno: {
        type: String,
        required: true,
    },
    isactive: {
        type: "boolean",
        required: true,
        default: true,
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    gender: {
        type: String
    }
});

// Generate authentication token
userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, keysecret, { expiresIn: "1d" });
        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model("User", userSchema);

module.exports = User;