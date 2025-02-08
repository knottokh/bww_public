const config = require('../../config/index');
const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const gfsfunction = require('../../config/mongo').gfs;
const curdb = require('../../config/mongo').db;
let multer = require('multer');
let GridFsStorage = require('multer-gridfs-storage');
const fsFileModel = require('../models/fs_file');
const fsChunkModel = require('../models/fs_chunk');
const collectionname = 'bww_fs';


// Setting up the storage element
let storage = GridFsStorage({
    url: config.mongo.host,

    file: function (req, file) {
        return {
            bucketName: collectionname,
            metadata: { originalname: file.originalname }
        };
    },
    root: 'bww_fs' // Root collection name
});

// Multer configuration for single file uploads
let upload = multer({
    storage: storage
}).single('file');


// Route for file upload
router.post('/', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        //console.log(req.file.id);
        res.json({ error_code: 0, error_desc: null, file_uploaded: true, file_id: req.file.id });
    });
});

// Route for file upload
router.post('/:fileId', (req, res) => {
    const fileid = req.params.fileId || '';
    console.log("fileid", fileid);
    fsChunkModel.remove({ files_id: fileid })
        .exec(function () {
            fsFileModel.remove({ _id: fileid })
                .exec(function () {
                    upload(req, res, (err) => {
                        console.log(err);
                        if (err) {
                            res.json({ error_code: 1, err_desc: err });
                            return;
                        }
                        //console.log(req.file.id);
                        res.json({ error_code: 0, error_desc: null, file_uploaded: true, file_id: req.file.id });
                    });
                });
        });

});

router.post('/remove/multi', (req, res) => {
    const idarr = req.body.ids;
    console.log("arr", idarr);
    fsChunkModel.remove({ files_id: { $in: idarr } })
        .exec(function () {
            fsFileModel.remove({ _id: { $in: idarr } })
                .exec(function () {
                    res.json({ success: true });
                });
        });

});

// Downloading a single file
router.get('/getfileinfo/:fileid', (req, res) => {
    const gfs = gfsfunction();
    const collection = gfs.collection(collectionname);
    /** First check if file exists */
    collection.aggregate([
        {
            $match:
            {
                $expr:
                    { $eq: [{ $toString: '$_id' }, req.params.fileid] }
            }
        },
        {
            $lookup:
            {
                from: 'bww_fs.chunks',
                localField: '_id',
                foreignField: 'files_id',
                as: 'chunks'
            }
        }
    ]).toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        let file = files[0];
        return res.status(200).json({
            id: file._id,
            size: file.length,
            filename: file.filename,
            contentType: file.contentType,
            originalname: file.metadata.originalname,
            src : ''
        });
    });
});

// Downloading a single file
router.get('/:filename', (req, res) => {
    const gfs = gfsfunction();
    const collection = gfs.collection(collectionname);
    /** First check if file exists */
    console.log( req.params.filename);
    collection.find({ filename: req.params.filename }).toArray((err, files) => {
        if (!files || files.length === 0) {
            console.log('file not found');
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        res.set('Content-Type', files[0].contentType);
        //console.log(files[0].metadata.originalname);
        //res.set('Content-Disposition', 'attachment; filename="' + files[0].metadata.originalname + '"');
        // create read stream
        var readstream = gfs.createReadStream({
            filename: files[0].filename,
            //metadata: { originalname: files[0].metadata.originalname },
            root: collectionname
        });

        readstream.on("error", function(err) { 
            console.log(err);
            res.end();
        });
    
        // set the proper content type 
        //console.log(files[0].metadata.originalname);

        // Return response
        //console.log(res);
        return readstream.pipe(res);
    });
});

router.get('/web/:filename', (req, res) => {
    const gfs = gfsfunction();
    const collection = gfs.collection(collectionname);
    /** First check if file exists */
    console.log( req.params.filename);
    collection.find({ filename: req.params.filename }).toArray((err, files) => {
        if (!files || files.length === 0) {
            console.log('file not found');
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        res.set('Content-Type', files[0].contentType);
        //console.log(files[0].metadata.originalname);
        var newFileName = encodeURIComponent(files[0].metadata.originalname);
        res.setHeader('Content-Disposition', 'attachment;filename*=UTF-8\'\''+newFileName);
        //res.set('Content-Disposition', 'attachment; filename="' + files[0].metadata.originalname + '"');
        // create read stream
        var readstream = gfs.createReadStream({
            filename: files[0].filename,
            metadata: { originalname: files[0].metadata.originalname },
            root: collectionname
        });

        readstream.on("error", function(err) { 
            console.log(err);
            res.end();
        });
    
        // set the proper content type 
        //console.log(files[0].metadata.originalname);

        // Return response
        //console.log(res);
        return readstream.pipe(res);
    });
});

// Downloading a single file
router.get('/getbyid/:fileid', (req, res) => {
    const gfs = gfsfunction();
    const collection = gfs.collection(collectionname);
    /** First check if file exists */

    //collection.find({ _id: req.params.fileid }).toArray((err, files) => {
    collection.aggregate([
        {
            $match:
            {
                $expr:
                    { $eq: [{ $toString: '$_id' }, req.params.fileid] }
            }
        },
        {
            $lookup:
            {
                from: 'bww_fs.chunks',
                localField: '_id',
                foreignField: 'files_id',
                as: 'chunks'
            }
        }
    ]).toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        else {
            let f = files[0];
            let fileData = [];
            for (let i = 0; i < f.chunks.length; i++) {
                //This is in Binary JSON or BSON format, which is stored               
                //in fileData array in base64 endocoded string format               

                fileData.push(f.chunks[i].data.toString('base64'));
            }

            //Display the chunks using the data URI format          
            let finalFile = 'data:' + f.contentType + ';base64,'
                + fileData.join('');
            f.imageUrl = finalFile;
            delete f['chunks'];

            return res.status(200).json({
                imageurl: finalFile
            });
        }
    });
});
// Route for getting all the files
router.get('/', (req, res) => {
    let filesData = [];
    let count = 0;
    const gfs = gfsfunction();
    //console.log(gfs);
    const collection = gfs.collection(collectionname);  // set the collection to look up into
    //console.log(collection);
    collection.aggregate([
        {
            $lookup:
            {
                from: 'bww_fs.chunks',
                localField: '_id',
                foreignField: 'files_id',
                as: 'chunks'
            }
        }
    ]).toArray((err, files) => {
        // Error checking
        if (!files || files.length === 0) {
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        let newfiles = files.map(f => {
            let fileData = [];
            for (let i = 0; i < f.chunks.length; i++) {
                //This is in Binary JSON or BSON format, which is stored               
                //in fileData array in base64 endocoded string format               

                fileData.push(f.chunks[i].data.toString('base64'));
            }

            //Display the chunks using the data URI format          
            let finalFile = 'data:' + f.contentType + ';base64,'
                + fileData.join('');
            f.imageUrl = finalFile;
            delete f['chunks'];

            return f;
        })
        res.json(newfiles);
    });
    /* collection.find({}).toArray((err, files) => {
         // Error checking
         if(!files || files.length === 0){
             return res.status(404).json({
                 responseCode: 1,
                 responseMessage: "error"
             });
         }
         // Loop through all the files and fetch the necessary information
         files.forEach((file) => {
             console.log(file);
             var readstream = gfs.createReadStream({
                 filename: file.filename,
                 root: collectionname
             });
 
             // Return response
             filesData[count++] = {
                 originalname: file.metadata? file.metadata.originalname : '',
                 filename: file.filename,
                 contentType: file.contentType
             }
         });
         res.json(filesData);
     });*/
});

module.exports = router;