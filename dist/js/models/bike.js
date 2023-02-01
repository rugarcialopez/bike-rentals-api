"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bikeSchema = new mongoose_1.Schema({
    brand: {
        type: String,
        required: true
    },
    color: {
        type: [String],
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    location: {
        longitude: {
            type: String
        },
        latitude: {
            type: String,
        }
    },
    photo: {
        type: String,
        required: true
    },
    availableForRenting: {
        type: Boolean,
        required: true
    },
    rates: {
        type: [Number],
        default: []
    }
}, { timestamps: true });
const Bike = mongoose_1.model('Bike', bikeSchema);
exports.default = Bike;
