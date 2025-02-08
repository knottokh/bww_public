const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const fsChunkSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    files_id: { type: mongoose.Schema.Types.ObjectId, ref: 'bww_fs.file' }
});
module.exports = mongoose.model('bww_fs.chunk', fsChunkSchema);