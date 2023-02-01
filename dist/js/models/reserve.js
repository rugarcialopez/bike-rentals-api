"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reserveSchema = new mongoose_1.Schema({
    bikeId: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    photo: {
        type: String,
        required: true
    }
}, { timestamps: true });
const Reserve = mongoose_1.model('reserves', reserveSchema);
exports.default = Reserve;
