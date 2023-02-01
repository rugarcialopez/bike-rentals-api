"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.addUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../../models/user"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Get the user ID from previous midleware
        const userId = res.locals.jwtPayload.userId;
        const role = req.query.role;
        const filter = role ? { _id: { $ne: userId }, role: role } : { _id: { $ne: userId } };
        const users = yield user_1.default.find(filter);
        const transformedUsers = (users || []).map((user) => ({
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        }));
        res.status(200).json({ users: transformedUsers });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getUsers = getUsers;
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        //Check if firstName, lastName, email, password and role are set
        const { firstName, lastName, email, password, role } = req.body;
        if (!(firstName && lastName && email && password && role)) {
            res.status(400).send({ message: 'fullName, email, password and role are required' });
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
            role: body.role
        });
        const newUser = yield user.save();
        res.status(200).json({ user: {
                id: newUser._id.toString(),
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.addUser = addUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, body, } = req;
        const updatedUser = yield user_1.default.findByIdAndUpdate({ _id: id }, body, { new: true });
        res.status(200).json({ user: {
                id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id.toString(),
                firstName: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.firstName,
                lastName: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.lastName,
                email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
                role: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.role,
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const removedUser = yield user_1.default.findByIdAndRemove(req.params.id);
        res.status(200).json({ user: {
                id: removedUser === null || removedUser === void 0 ? void 0 : removedUser._id.toString(),
                firstName: removedUser === null || removedUser === void 0 ? void 0 : removedUser.firstName,
                lastName: removedUser === null || removedUser === void 0 ? void 0 : removedUser.lastName,
                email: removedUser === null || removedUser === void 0 ? void 0 : removedUser.email,
                role: removedUser === null || removedUser === void 0 ? void 0 : removedUser.role,
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.deleteUser = deleteUser;
