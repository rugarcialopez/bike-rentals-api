
import { Request } from 'express';
import multer from 'multer';

const DIR = './public/uploads/';

const hasRequiredFields = (req: Request, file: Express.Multer.File) => {
    const { brand, color, weight, longitude, latitude, availableForRenting } = req.body;
    if (brand && color && weight && longitude && latitude && availableForRenting && file) {
        return true;
    }
    return false;
}

const hasFileValidFormat = (file: Express.Multer.File) => {
    if (file && (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')) {
        return true;
    }
    return false;
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = `${Math.random().toString()}.${file.mimetype.split('/')[1]}`;
        cb(null, fileName)
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 //Max file size 10mb
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb) => {
        const requiredFields = hasRequiredFields(req, file);
        if (requiredFields  && hasFileValidFormat(file)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(!requiredFields 
                ? new Error('brand, color, weight, location, availableForRenting and photo are required') 
                : new Error('File types allowed .jpeg, .jpg and .png!'));
        }
    }
}).single('file');

export default upload;