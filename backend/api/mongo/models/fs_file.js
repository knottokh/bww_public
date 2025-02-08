const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const fsFileSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId
});
module.exports = mongoose.model('bww_fs.file', fsFileSchema);