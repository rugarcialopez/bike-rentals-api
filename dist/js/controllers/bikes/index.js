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
exports.addRate = exports.deleteBike = exports.updateBike = exports.addBike = exports.getBikes = void 0;
const bike_1 = __importDefault(require("../../models/bike"));
const API_URL = process.env.BIKES_API_URL || 'http://localhost:4000';
const averageRage = (rates) => {
    if (!rates || rates.length === 0)
        return 0;
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const numOfRates = rates.length;
    const sum = rates.reduce(reducer);
    return Math.round(sum / numOfRates);
};
const getBikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filter = {};
        const brand = req.query.brand;
        const color = req.query.color;
        const weight = req.query.weight;
        const rate = req.query.rate;
        filter = brand ? Object.assign(Object.assign({}, filter), { brand: brand }) : filter;
        filter = color ? Object.assign(Object.assign({}, filter), { color: { $in: [color] } }) : filter;
        filter = weight ? Object.assign(Object.assign({}, filter), { weight: weight }) : filter;
        const bikes = yield bike_1.default.find(filter);
        const transformedBikes = (bikes || []).map((bike) => ({
            id: bike._id.toString(),
            brand: bike.brand,
            colors: bike.color,
            weight: bike.weight,
            location: bike.location,
            photo: `${API_URL}/${bike.photo}`,
            availableForRenting: bike.availableForRenting,
            averageRate: averageRage(bike.rates),
            numberOfRates: bike.rates.length
        }));
        if (rate) {
            const filteredBikes = transformedBikes.filter(bike => bike.averageRate === parseInt(rate));
            res.status(200).json({ bikes: filteredBikes });
            return;
        }
        res.status(200).json({ bikes: transformedBikes });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getBikes = getBikes;
const addBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { brand, color, weight, longitude, latitude, availableForRenting } = req.body;
        const bike = new bike_1.default({
            brand,
            color: color.split(','),
            weight: parseInt(weight),
            location: {
                longitude: longitude,
                latitude: latitude
            },
            photo: (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename,
            availableForRenting: availableForRenting === 'true'
        });
        const newBike = yield bike.save();
        res.status(200).json({ bike: {
                id: newBike._id.toString(),
                brand: newBike.brand,
                colors: newBike.color,
                weight: newBike.weight,
                location: newBike.location,
                photo: newBike.photo,
                availableForRenting: newBike.availableForRenting,
                averageRate: 0,
                numberOfRates: 0
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.addBike = addBike;
const updateBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, body, } = req;
        const updatedBike = yield bike_1.default.findByIdAndUpdate({ _id: id }, {
            brand: body.brand,
            color: body.color.split(','),
            weight: body.weight,
            location: {
                longitude: body.longitude,
                latitude: body.latitude
            },
            availableForRenting: body.availableForRenting
        }, { new: true });
        res.status(200).json({ bike: {
                id: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike._id.toString(),
                brand: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.brand,
                colors: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.color,
                weight: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.weight,
                location: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.location,
                photo: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.photo,
                availableForRenting: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.availableForRenting,
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.updateBike = updateBike;
const deleteBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const removedBike = yield bike_1.default.findByIdAndRemove(req.params.id);
        res.status(200).json({ bike: {
                id: removedBike === null || removedBike === void 0 ? void 0 : removedBike._id.toString(),
                brand: removedBike === null || removedBike === void 0 ? void 0 : removedBike.brand,
                colors: removedBike === null || removedBike === void 0 ? void 0 : removedBike.color,
                weight: removedBike === null || removedBike === void 0 ? void 0 : removedBike.weight,
                location: removedBike === null || removedBike === void 0 ? void 0 : removedBike.location,
                photo: removedBike === null || removedBike === void 0 ? void 0 : removedBike.photo,
                availableForRenting: removedBike === null || removedBike === void 0 ? void 0 : removedBike.availableForRenting
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.deleteBike = deleteBike;
const addRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, body, } = req;
        const updatedBike = yield bike_1.default.findByIdAndUpdate({ _id: id }, { $push: { rates: parseInt(body.rate) } }, { new: true });
        res.status(200).json({ rate: {
                bikeId: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike._id.toString(),
                averageRate: averageRage((updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.rates) || []),
                numberOfRates: updatedBike === null || updatedBike === void 0 ? void 0 : updatedBike.rates.length
            } });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.addRate = addRate;
