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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReserve = exports.getReserves = exports.createReserve = void 0;
const moment_1 = __importDefault(require("moment"));
const bike_1 = __importDefault(require("../../models/bike"));
const reserve_1 = __importDefault(require("../../models/reserve"));
const user_1 = __importStar(require("../../models/user"));
const API_URL = process.env.BIKES_API_URL || 'http://localhost:4000';
const getReserves = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.jwtPayload.userId;
        const role = res.locals.jwtPayload.role;
        let filter = {};
        if (role === user_1.Role.User) {
            filter = { userId: { $eq: userId } };
        }
        const reserves = yield reserve_1.default.find(filter);
        const transformedReserves = (reserves || []).map((reserve) => ({
            id: reserve._id.toString(),
            brand: reserve.brand,
            fullName: reserve.fullName,
            userId: reserve.userId,
            bikeId: reserve.bikeId,
            date: moment_1.default(reserve.date).format('LL'),
            photo: `${API_URL}/${reserve.photo}`
        }));
        res.status(200).json({ reserves: transformedReserves });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getReserves = getReserves;
const createReserve = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bikeId, userId, date } = req.body;
        const bike = yield bike_1.default.findById(bikeId);
        if (!bike) {
            res.status(400).send({ message: 'Bike does not exist' });
            return;
        }
        const user = yield user_1.default.findById(userId);
        if (!user) {
            res.status(400).send({ message: 'User does not exist' });
            return;
        }
        const reserveDB = yield reserve_1.default.findOne({
            bikeId,
            date: new Date(date)
        });
        if (reserveDB) {
            res.status(400).send({ message: 'The bike is not available that date' });
            return;
        }
        const reserve = new reserve_1.default({
            bikeId,
            userId,
            brand: bike.brand,
            fullName: user.firstName + ' ' + user.lastName,
            date: new Date(date),
            photo: bike.photo
        });
        const newReserve = yield reserve.save();
        res.status(200).json({ reserve: {
                id: newReserve._id.toString(),
                brand: newReserve.brand,
                bikeId: newReserve.bikeId,
                userId: newReserve.userId,
                fullName: newReserve.fullName,
                photo: `${API_URL}/${newReserve.photo}`,
                date: moment_1.default(newReserve.date).format('LL')
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.createReserve = createReserve;
const deleteReserve = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const removedReserve = yield reserve_1.default.findByIdAndRemove(req.params.id);
        res.status(200).json({ reserve: {
                id: removedReserve === null || removedReserve === void 0 ? void 0 : removedReserve._id.toString(),
                brand: removedReserve === null || removedReserve === void 0 ? void 0 : removedReserve.brand,
                userId: removedReserve === null || removedReserve === void 0 ? void 0 : removedReserve.userId,
                fullName: removedReserve === null || removedReserve === void 0 ? void 0 : removedReserve.fullName,
                date: moment_1.default(removedReserve === null || removedReserve === void 0 ? void 0 : removedReserve.date).format('LL'),
                photo: `${API_URL}/${removedReserve === null || removedReserve === void 0 ? void 0 : removedReserve.photo}`
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.deleteReserve = deleteReserve;
