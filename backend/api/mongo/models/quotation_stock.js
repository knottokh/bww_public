const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const modelSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  quotation_id: mongoose.Schema.Types.ObjectId,
  quotation_code: { type: String },
  stock_code: { type: String },
  title: { type: String },
  original_title: { type: String },
  sequence: { type: Number },
  stock_type: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  unit: { type: String },
  location: { type: String },
  status: { type: String },
  product_code: { type: String },
  product_unit: { type: String },
  product_weight: { type: Number },
  created: { type: Date },
  modified: { type: Date },
  createdby: { type: String },
  modifiedby: { type: String },
  from_quotation: { type: Boolean },
});
module.exports = mongoose.model("bww_quotation_stocks", modelSchema);
