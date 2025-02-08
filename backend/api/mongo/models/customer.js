const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const modelSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customer_code: { type: String },
    customer_name: { type: String },
    dealer: { type: String },
    phone: { type: String },
    email: { type: String },
    line: { type: String },
    customer_type: { type: String },
    payment_type: { type: String },
    payment_remark: { type: String },
    shipping_type: { type: String },
    shipping_detail: { type: String },
    tax_address: { type: String },
    tax_id: { type: String },
    note: { type: String },
    remark: { type: String },
    is_approve: { type: Boolean, default: false},
    created: { type: Date },
    modified: { type: Date },
    createdby: { type: String },
    modifiedby: { type: String },
});
module.exports = mongoose.model('bww_customers', modelSchema);
//module.exports = mongoose.model('gouni_academies_tests', academySchema);