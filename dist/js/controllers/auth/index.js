"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = exports.signUp = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const user_1 = __importStar(require("../../models/user"));
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        //Check if firstName, lastName, email and password are set
        const { firstName, lastName, email, password } = req.body;
        if (!(firstName && lastName && email && password)) {
            res.status(400).send({ message: 'firstName, lastName, email and password are required' });
            return;
        }
        const userDB = yield user_1.default.findOne({ email: email.toLowerCase() });
        if (userDB) {
            res.status(401).send({ message: 'User already exists' });
            return;
        }
        const user = new user_1.default({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email.toLowerCase(),
            password: user_1.default.hashPassword(body.password),
            role: body.role || user_1.Role.User
        });
        const newUser = yield user.save();
        const secretKey = process.env.JWT_SECRET || 'YOUR_SECRET_STRING';
        //Sing JWT, valid for 1 hour
        const token = jwt.sign({ userId: newUser._id.toString(), role: newUser.role }, secretKey, { expiresIn: "1h" });
        res.status(201).json({ token, role: newUser.role, expirationTime: 3600, userId: newUser._id.toString() });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send({ message: 'email and password are required' });
            return;
        }
        //Get user from database
        const user = yield user_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).send({ message: 'User does not exist' });
            return;
        }
        //Check if encrypted password match
        if (!user.checkIfPasswordIsValid(password)) {
            res.status(401).send({ message: 'Password does not match' });
            return;
        }
        const secretKey = process.env.JWT_SECRET || 'YOUR_SECRET_STRING';
        //Sing JWT, valid for 1 hour
        const token = jwt.sign({ userId: user._id.toString(), role: user.role }, secretKey, { expiresIn: "1h" });
        res.status(201).json({ token, role: user.role, expirationTime: 3600, userId: user._id.toString() });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.signIn = signIn;
