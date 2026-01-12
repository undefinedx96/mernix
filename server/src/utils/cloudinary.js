import { v2 as cloudinary } from 'cloudinary'
import conf from '../conf/conf.js'
import fs from 'node:fs'

cloudinary.config({
    cloud_name: conf.cloudinaryCloudName,
    api_key: conf.cloudinaryApiKey,
    api_secret: conf.cloudinaryApiSecret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return 'Could not find path of file';
    
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
    
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    
        return response;
    }
    catch (error) {
        console.error('CLOUDINARY REJECTION ERROR: ', error.message);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
    
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image'
        });
    
        if (response.result !== 'ok' && response.result !== 'not found') {
            console.error(`Cloudinary failed to delete the file with public ID: ${publicId} ; Response: ${response.result}`);
        }
    
        return response;
    }
    catch (error) {
        console.error('CLOUDINARY DELETION ERROR: ', error.message);
        return null;
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}