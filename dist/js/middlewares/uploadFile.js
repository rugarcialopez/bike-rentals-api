"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const DIR = './public/uploads/';
const hasRequiredFields = (req, file) => {
    const { brand, color, weight, longitude, latitude, availableForRenting } = req.body;
    if (brand && color && weight && longitude && latitude && availableForRenting && file) {
        return true;
    }
    return false;
};
const hasFileValidFormat = (file) => {
    if (file && (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')) {
        return true;
    }
    return false;
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = `${Math.random().toString()}.${file.mimetype.split('/')[1]}`;
        cb(null, fileName);
    },
});
const upload = multer_1.default({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 //Max file size 10mb
    },
    fileFilter: (req, file, cb) => {
        const requiredFields = hasRequiredFields(req, file);
        if (requiredFields && hasFileValidFormat(file)) {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(!requiredFields
                ? new Error('brand, color, weight, location, availableForRenting and photo are required')
                : new Error('File types allowed .jpeg, .jpg and .png!'));
        }
    }
}).single('file');
exports.default = upload;
