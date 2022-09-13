const aws = require('aws-sdk');
const multerS3 = require( 'multer-s3' );
const multer = require('multer'); 
const path = require("path"); 
require("dotenv").config();
const sharp = require("sharp");
const s3 = new aws.S3({
    accessKeyId: process.env.BUCKET_USER_ACCESS_KEYID,
    secretAccessKey: process.env.BUCKET_USER_SecretAccessKey,
    Bucket: process.env.Bucket
});


const deleteS3File =  (Objects) => {
    return new Promise((resolve, reject) => {
        let params = {
            Bucket: "squareserverbucket",
            Delete: {
                Objects: Objects,
                Quiet: false
            },
        }
        s3.deleteObjects(params, function(err, data) {
                if (err) {
                    resolve({ message: "Not Done", success: false });         // successful response
                    
                } // an error occurred
                else {
                    resolve({ message: "Done", success: true });         // successful response
                }
        });
     })
}

const deleteImageWithKey = (key) => {
    deleteS3File([{key}])
        .then(deleted => console.log(`Image discarded ${key}`))
        .catch(err => console.log(`Fatel Server Error: S3 Leakage`))
}

const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'squareserverbucket',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
        }
    }),
    limits: { fileSize: 1000000000 }, // In bytes: 2000000 bytes = 2 MB
    // fileFilter: function (req, file, cb) {
    //     checkFileType(file, cb);
    // }
})


const getAvatarImage = async (key) => {
    return new Promise(async (resolve, reject) => {
        console.log("key--------------");
        console.log(key);
        let image = s3.getObject({
            Bucket: process.env.Bucket,
            Key: key
        }).promise();
    
        const compressedImageBuffer = await sharp((await image).Body)
            .resize({
                width: 50,
                height: 50,
                fit: 'cover'
            })
            .toBuffer();
    
        
        let splited = `${key}`.split("-");
        
        const uploadParams = {
            ACL: 'public-read',
            Body: compressedImageBuffer,
            Bucket: 'squareserverbucket',
            Key:  `${splited[0]}-${Date.now()}` + ".png"
        };
        
        s3.upload(uploadParams, (err, avatar) => {
            if (err) {
                resolve ({ success: false , message: "Avatar Upload Error"});
            } else {
                resolve ({ success: true , avatar });
            }
        })
    })
   
   
}

 /**
     * Check File Type
     * @param file
     * @param cb
     * @return {*}
     */
    const checkFileType = ( file, cb )=> {
        // Allowed ext
        const filetypes = /jpeg|jpg|png|gif/;
        // Check ext
        const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(file.mimetype);
        if( mimetype && extname ){
            return cb( null, true );
        } else {
            cb( 'Error: Images Only!' );
        }
    }
    
module.exports = {
    uploadS3,
    deleteS3File,
    getAvatarImage,
    deleteImageWithKey
}