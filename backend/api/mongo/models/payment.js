const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const pyamentSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String },
    sequence: { type: Number },
    created: { type: Date },
    modified: { type: Date },
    createdby: { type: String },
    modifiedby: { type: String },
});
module.exports = mongoose.model('bww_payments', pyamentSchema);
//module.exports = mongoose.model('gouni_academies_tests', academySchema);