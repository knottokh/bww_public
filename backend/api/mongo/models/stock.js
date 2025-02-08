const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const modelSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  stock_code: { type: String },
  title: { type: String },
  original_title: { type: String },
  stock_type: { type: String },
  price: { type: Number },
  unit: { type: String },
  product_code: { type: String },
  product_unit: { type: String },
  product_weight: { type: Number },
  sequence: { type: Number },
  created: { type: Date },
  modified: { type: Date },
  createdby: { type: String },
  modifiedby: { type: String },
});
module.exports = mongoose.model("bww_stocks", modelSchema);
//module.exports = mongoose.model('gouni_academies_tests', academySchema);
