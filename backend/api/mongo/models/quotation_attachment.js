const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const modelSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    document_name: { type: String },
    document: mongoose.Schema.Types.ObjectId,
    quotation_id: mongoose.Schema.Types.ObjectId,
    created: { type: Date },
    modified: { type: Date },
    createdby: { type: String },
    modifiedby: { type: String },
});
module.exports = mongoose.model('bww_quotation_attachments', modelSchema);
//module.exports = mongoose.model('gouni_academies_tests', academySchema);