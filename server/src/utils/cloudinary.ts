import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import conf from '../conf/conf.js'
import fs from 'node:fs'

cloudinary.config({
    cloud_name: conf.cloudinaryCloudName,
    api_key: conf.cloudinaryApiKey,
    api_secret: conf.cloudinaryApiSecret
});

const uploadOnCloudinary = async (localFilePath: string): Promise<UploadApiResponse | null> => {
    try {
        if (!localFilePath) return null;
    
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
    
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    
        return response;
    }
    catch (error: any) {
        console.error('CLOUDINARY REJECTION ERROR: ', error.message || error);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> => {
    try {
        if (!publicId) return null;
    
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    
        if (response.result !== 'ok' && response.result !== 'not found') {
            console.error(`Cloudinary failed to delete the file with public ID: ${publicId} ; Response: ${response.result}`);
        }
    
        return response;
    }
    catch (error: any) {
        console.error('CLOUDINARY DELETION ERROR: ', error.message || error);
        return null;
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}