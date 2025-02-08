const mongoose = require("mongoose");
const ShareController = require("./share");
const SelectModel = require("../models/quotation");
const QuotationProductModel = require("../models/quotation_product");
const QuotationStockModel = require("../models/quotation_stock");
const RunningNumberModel = require("../models/running_number");
const async = require("async");
const moment = require("moment-timezone");
const math = require("mathjs");

exports.get_all = (req, res, next) => {
  ShareController.get_all(res, SelectModel, null, (results) => {
    const response = {
      count: results.length,
      results: results,
    };
    res.status(200).json(response);
  });
};

exports.get_all_aggregate = (req, res, next) => {
  ShareController.get_all_aggregate(res, SelectModel, [], null, (results) => {
    const response = {
      count: results.length,
      results: results,
    };
    res.status(200).json(response);
  });
};

exports.find_by_id = (req, res, next) => {
  ShareController.get_all_aggregate(
    res,
    SelectModel,
    [
      {
        $match: {
          $expr: { $eq: [{ $toString: "$_id" }, req.params.paramId] },
        },
      },
      {
        $lookup: {
          from: "bww_quotation_products",
          localField: "_id",
          foreignField: "quotation_id",
          pipeline: [{ $sort: { sequence: 1 } }],
          as: "products",
        },
      },
      {
        $lookup: {
          from: "bww_quotation_stocks",
          localField: "_id",
          foreignField: "quotation_id",
          pipeline: [{ $sort: { sequence: 1 } }],
          as: "stocks",
        },
      },
      // {
      //   $unwind: {
      //     path: "$products",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "bww_quotation_products",
      //     localField: "products._id",
      //     foreignField: "quotation_stock_id",
      //     as: "products.product",
      //   },
      // },
      // {
      //   $group: {
      //     _id: "$_id",
      //     quotation_code: { $first: "$quotation_code" },
      //     customer_id: { $first: "$customer_id" },
      //     customer_code: { $first: "$customer_code" },
      //     customer_name: { $first: "$customer_name" },
      //     document_type: { $first: "$document_type" },
      //     remark: { $first: "$remark" },
      //     status: { $first: "$status" },
      //     created: { $first: "$created" },
      //     products: { $push: "$products" },
      //   },
      // },
      {
        $lookup: {
          from: "bww_customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "bww_sellers",
          localField: "seller_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "bww_quotations",
          let: { ref1: "$ref_quotation_id", ref2: "$ref_quotation_ids" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$ref1"] },
                    {
                      $in: [
                        "$_id",
                        {
                          $cond: {
                            if: {
                              $ne: [{ $type: "$$ref2" }, "array"],
                            },
                            then: [],
                            else: "$$ref2",
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          // localField: "ref_quotation_id",
          // foreignField: "_id",
          as: "ref_quotation",
        },
      },
      // {
      //   $unwind: {
      //     path: "$ref_quotation",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "bww_quotations",
          // localField: "_id",
          // foreignField: "ref_quotation_id",
          let: { ref1: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$ref_quotation_id", "$$ref1"] },
                    {
                      $in: [
                        "$$ref1",
                        {
                          $cond: {
                            if: {
                              $ne: [{ $type: "$ref_quotation_ids" }, "array"],
                            },
                            then: [],
                            else: "$ref_quotation_ids",
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "child_quotations",
        },
      },
    ],
    null,
    (results) => {
      if (results.length > 0) {
        return res.status(200).json(results[0]);
      } else {
        res.status(422).send({
          message: "find-by-id-not-found",
        });
      }
    }
  );
};

exports.find_by_props = (req, res, next) => {
  //console.log(req.body.filter);
  //{ modified: -1 }
  ShareController.get_by_aggregate_paginated_sort(
    res,
    SelectModel,
    [
      {
        $match: {
          $expr: req.body.filter,
        },
      },
      // {
      //   $lookup: {
      //     from: "bww_quotation_products",
      //     localField: "_id",
      //     foreignField: "quotation_id",
      //     pipeline: [{ $sort: { sequence: 1 } }],
      //     as: "products",
      //   },
      // },
      {
        $lookup: {
          from: "bww_quotation_stocks",
          localField: "_id",
          foreignField: "quotation_id",
          pipeline: [{ $sort: { sequence: 1 } }],
          as: "stocks",
        },
      },
      // {
      //   $lookup: {
      //     from: "bww_customers",
      //     localField: "customer_id",
      //     foreignField: "_id",
      //     as: "customer",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$customer",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
    ],
    req.body.startRow,
    req.body.endRow,
    req.body.sort,
    null,
    (results) => {
      const response = {
        count: results.count,
        results: results.rows,
      };
      res.status(200).json(response);
    }
  );
};

exports.find_detail_by_props = (req, res, next) => {
  //console.log(req.body.filter);
  ShareController.get_by_aggregate_paginated_sort(
    res,
    QuotationStockModel,
    [
      {
        $match: {
          $expr: req.body.filter,
        },
      },
      {
        $lookup: {
          from: "bww_quotations",
          localField: "quotation_id",
          foreignField: "_id",
          pipeline: [
            { $sort: { sequence: 1 } },
            { $project: { approved: 1, approvedby: 1, _id: 0 } },
          ],
          as: "fromQuotation",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$fromQuotation", 0] }, "$$ROOT"],
          },
        },
      },
      {
        $project: { fromQuotation: 0 },
      },
    ],
    req.body.startRow,
    req.body.endRow,
    req.body.sort,
    null,
    (results) => {
      const response = {
        count: results.count,
        results: results.rows,
      };
      res.status(200).json(response);
    }
  );
};

exports.manage_data = (req, res, next) => {
  // console.log("req:", req.body);
  var quotation = req.body;

  if (quotation._id == "0") {
    create_new(req, res, quotation.document_type, (result) => {
      // console.log("Result in manage_data", result);
      res.status(200).json(result);
    });
  } else {
    // update
  }
};

const generateRuningNumber = (res, type, callback) => {
  var current_month = moment().month() + 1;
  var current_year = moment().year() + 543;
  // console.log("current_month", current_month);
  // console.log("current_year", current_year);
  // console.log("type", type);
  //, { $eq: ["$running_year", current_year] }, { $eq: ["$running_month", current_month] }
  let filter = {
    $and: [
      { $eq: ["$running_type", type] },
      { $eq: ["$running_year", current_year] },
      { $eq: ["$running_month", current_month] },
    ],
  };
  //console.log("filter", filter);
  ShareController.get_all_aggregate(
    res,
    RunningNumberModel,
    [
      {
        $match: {
          $expr: filter,
        },
      },
    ],
    null,
    (results) => {
      //console.log(results);
      var current_no = 1;
      let isnew = true;
      let runin_id = "";
      if (results.length > 0) {
        current_no = results[0]["running_no"] + 1;
        runin_id = results[0]["_id"];
        isnew = false;
      }
      console.log("runin_id", runin_id);
      var runing_no = `${type.toUpperCase()}${getStringByLength(
        current_year,
        2
      )}${getStringByLength(current_month, 2)}${getStringByLength(
        current_no,
        3
      )}`;
      console.log("runing_no", runing_no);
      var bodyObj = {
        running_type: type,
        running_year: current_year,
        running_month: current_month,
        running_no: current_no,
      };
      if (isnew) {
        var newRunning = new RunningNumberModel(bodyObj);
        newRunning._id = new mongoose.Types.ObjectId();
        ShareController.create_new(res, newRunning, null, (result) => {
          callback(runing_no);
        });
      } else {
        // update
        ShareController.update_by_id(
          res,
          RunningNumberModel,
          runin_id,
          bodyObj,
          null,
          null,
          (result) => {
            callback(runing_no);
          }
        );
      }
    }
  );
};

const getStringByLength = (str, len) => {
  let newstr = `0000000000${str}`;
  let newlen = len * -1;
  return newstr.slice(newlen);
};

const create_new = (req, res, q_type, callback) => {
  //console.log(req.body);
  var stock = req.body.stocks;
  delete req.body["stocks"];

  // generate runing
  generateRuningNumber(res, q_type, (runing_code) => {
    // console.log("runing_code", runing_code);
    var newQuotation = new SelectModel(req.body);
    newQuotation._id = new mongoose.Types.ObjectId();
    newQuotation["quotation_code"] = runing_code;
    // create quotation.
    ShareController.create_new(res, newQuotation, null, (result) => {
      if (stock.length > 0) {
        // create stock
        insertStockData(
          res,
          0,
          stock,
          newQuotation._id,
          newQuotation.quotation_code,
          false,
          () => {
            if (newQuotation.document_type !== "po") {
              callback({
                result: result.result,
                message: "create new quotation success",
              });
            } else {
              // update stock detail status = รอดำเนินการ
              // console.log("create new else work");
              update_all_stock(stock, newQuotation.status, res, () => {
                callback({
                  result: result.result,
                  message: "create new quotation success",
                });
              });
            }
          }
        );
      } else {
        callback({
          result: result.result,
          message: "create new quotation success",
        });
      }
    });
  });
};

const createOrderStockProduct = (
  quotationDetail,
  orderStockProductList,
  res,
  callback
) => {
  let promises = [];
  // console.log("orderStockProductList", orderStockProductList.length);
  let orderNumberList = [];
  for (let orderStockProduct of orderStockProductList) {
    // console.log("order Product", orderStockProduct);
    // create quotation.
    promises.push(function (resolve) {
      // generate runing
      generateRuningNumber(res, "j", (runing_code) => {
        orderNumberList.push(runing_code);
        var newQuotation = new SelectModel(quotationDetail);
        newQuotation._id = new mongoose.Types.ObjectId();
        newQuotation["quotation_code"] = runing_code;
        newQuotation["remark"] = "";
        //newQuotation["document_reference"] = quotationDetail.quotation_code;
        //console.log("pass gen");
        ShareController.create_new(res, newQuotation, null, (result) => {
          // create stock
          insertStockData(
            res,
            0,
            [orderStockProduct],
            newQuotation._id,
            newQuotation.quotation_code,
            true,
            () => {
              resolve();
            }
          );
        });
      });
    });
  }

  async.waterfall(promises, function () {
    callback(orderNumberList);
  });
};

const insertStockData = (
  res,
  index,
  data,
  quotation_id,
  quotation_code,
  isconvert,
  callback
) => {
  // console.log("index", index);
  // console.log("data lenght", data.length);
  // console.log("dquotation_id", quotation_id);
  if (index == data.length) {
    callback();
    // callback({
    //   message: "create new quotation success",
    // });
  } else {
    var products = data[index].products;
    //delete data[index]["products"];
    let stockData = data[index];
    stockData.quotation_id = quotation_id;
    stockData.quotation_code = quotation_code;
    var old_product_unit = stockData.product_unit;
    // if (isconvert) {
    //   stockData.product_unit = "เมตร";
    // }
    var newStock = new QuotationStockModel(stockData);
    newStock._id = new mongoose.Types.ObjectId();
    ShareController.create_new(res, newStock, null, (result) => {
      if (products != undefined && products.length > 0) {
        if (isconvert) {
          insertProductDataConvert(
            res,
            0,
            products,
            quotation_id,
            newStock._id,
            old_product_unit,
            () => {
              insertStockData(
                res,
                index + 1,
                data,
                quotation_id,
                quotation_code,
                isconvert,
                callback
              );
            }
          );
        } else {
          insertProductData(
            res,
            0,
            products,
            quotation_id,
            newStock._id,
            () => {
              insertStockData(
                res,
                index + 1,
                data,
                quotation_id,
                quotation_code,
                isconvert,
                callback
              );
            }
          );
        }
      } else {
        insertStockData(
          res,
          index + 1,
          data,
          quotation_id,
          quotation_code,
          isconvert,
          callback
        );
      }
    });
  }
};

const UnitEng = {
  เมตร: "m",
  "ซม.": "cm",
  "มม.": "mm",
  นิ้ว: "inch",
  ฟุต: "feet",
};

const insertProductDataConvert = (
  res,
  index,
  data,
  quotation_id,
  quotation_stock_id,
  product_unit,
  callback
) => {
  //  console.log("in if call back index", index);
  //   console.log("in if call back data", data);
  if (index == data.length) {
    // console.log("in if call back index", index);
    // console.log("in if call back data", data);
    callback();
  } else {
    let productData = data[index];
    //console.log("productData", productData);
    productData.quotation_id = quotation_id;
    productData.quotation_stock_id = quotation_stock_id;
    //productData.product_unit = "เมตร";
    //console.log("product_unit", product_unit);
    if (productData.width) {
      const oldw = math.unit(productData.width, UnitEng[product_unit]);
      //productData.width = parseFloat(oldw.toNumber(UnitEng["เมตร"]).toFixed(3));
      productData.width_m = parseFloat(
        oldw.toNumber(UnitEng["เมตร"]).toFixed(3)
      );
    }
    if (productData.height) {
      const oldh = math.unit(productData.height, UnitEng[product_unit]);
      //productData.height = parseFloat(oldh.toNumber(UnitEng["เมตร"]).toFixed(3));
      productData.height_m = parseFloat(
        oldh.toNumber(UnitEng["เมตร"]).toFixed(3)
      );
    }
    var newProduct = new QuotationProductModel(productData);
    newProduct._id = new mongoose.Types.ObjectId();
    ShareController.create_new(res, newProduct, null, (result) => {
      insertProductDataConvert(
        res,
        index + 1,
        data,
        quotation_id,
        quotation_stock_id,
        product_unit,
        callback
      );
    });
  }
};

const insertProductData = (
  res,
  index,
  data,
  quotation_id,
  quotation_stock_id,
  callback
) => {
  if (index == data.length) {
    // console.log("in if call back index", index);
    // console.log("in if call back data", data);
    callback();
  } else {
    let productData = data[index];
    productData.quotation_id = quotation_id;
    productData.quotation_stock_id = quotation_stock_id;

    var newProduct = new QuotationProductModel(productData);
    newProduct._id = new mongoose.Types.ObjectId();
    ShareController.create_new(res, newProduct, null, (result) => {
      insertProductData(
        res,
        index + 1,
        data,
        quotation_id,
        quotation_stock_id,
        callback
      );
    });
  }
};

exports.update_status_approve = (req, res, next) => {
  var pushdata = req.body.push;
  var stockDataList = req.body.stocks;
  // console.log("stockDataList", stockDataList);

  delete req.body["push"];
  delete req.body["created"];
  delete req.body["_id"];

  var orderStockProductList = req.body.stocks.filter(
    (stock) =>
      stock.stock_type === "สั่งผลิต" || stock.stock_type === "สั่งผลิต(1D)"
  );

  var quotationDetail = req.body;
  delete quotationDetail["stocks"];

  // console.log("quotationDetail", quotationDetail);

  // update quotation status.
  ShareController.update_by_id(
    res,
    SelectModel,
    req.params.paramId,
    //quotationDetail,
    req.body,
    pushdata,
    null,
    (result) => {
      // update quotation stock list status
      let promises = [];
      if (stockDataList.length > 0) {
        // case update stock
        let updateStocks = stockDataList.filter((stock) => stock._id !== "0");
        if (updateStocks.length > 0) {
          for (let updateStock of updateStocks) {
            // update stock
            updateStock.status = "อนุมัติแล้ว";
            promises.push(function (resolve) {
              update_stock_by_id(updateStock, res, resolve);
            });
          }
        }
      }

      async.parallel(promises, function () {
        // res.status(200).json({ message: "Update quotation success." });
        if (orderStockProductList.length > 0) {
          quotationDetail.document_type = "j";
          quotationDetail.status = "รอสั่งผลิต";
          quotationDetail.ref_quotation_id = req.params.paramId;
          createOrderStockProduct(
            quotationDetail,
            orderStockProductList,
            res,
            (orderNumberList) => {
              res.status(200).json({ result, message: "success" });
              // console.log("Pass12");
              // console.log("orderNumberList", orderNumberList);
              // let orderNumberConcat = {};
              // // orderNumberConcat.document_reference = orderNumberList.join();
              // let oldref = quotationDetail.document_reference || [];
              // orderNumberConcat.document_reference =
              //   oldref.length > 0
              //     ? oldref.replace(/<\/?p[^>]*>/g, "") +
              //       "," +
              //       orderNumberList.join()
              //     : orderNumberList.join();
              // ShareController.update_by_id(
              //   res,
              //   SelectModel,
              //   req.params.paramId,
              //   orderNumberConcat,
              //   null,
              //   null,
              //   (result) => {
              //     res.status(200).json({ result, message: "success" });
              //   }
              // );
            }
          );
        } else {
          console.log("Result in update status approve", result);
          res.status(200).json({ result, message: "success" });
        }
      });
    }
  );
};

exports.update_by_id = (req, res, next) => {
  // console.log("req", req);

  var quotation = req.body.quotation;
  delete req.body["quotation"];

  var pushdata = req.body.push;
  delete req.body["push"];

  var stockDataList = req.body.stocks;
  delete req.body["stocks"];
  // console.log("stockDataList", stockDataList);

  var old_stocks = req.body.old_stocks || [];
  delete req.body["old_stocks"];

  var deleteStockList = req.body.deleteStocks;
  delete req.body["deleteStocks"];
  // console.log("deleteStockList", deleteStockList);

  var deleteProductList = req.body.deleteProducts;
  delete req.body["deleteProducts"];
  // console.log("deleteProductList", deleteProductList);

  // update quotation
  ShareController.update_by_id(
    res,
    SelectModel,
    req.params.paramId,
    quotation,
    pushdata,
    null,
    (result) => {
      // 1.case stock not in new data
      let promises = [];
      if (stockDataList.length > 0) {
        // case new stock
        let newStocks = stockDataList.filter((stock) => stock._id === "0");
        if (newStocks.length > 0) {
          promises.push(function (resolve) {
            insertStockData(
              res,
              0,
              newStocks,
              req.params.paramId,
              quotation.quotation_code,
              false,
              () => {
                if (quotation.document_type !== "po") {
                  resolve({
                    result: result.result,
                    message: "create new stock success",
                  });
                } else {
                  if (old_stocks.length > 0) {
                    // update stock detail status = รอดำเนินการ
                    //console.log("If work!");
                    update_all_stock(old_stocks, quotation.status, res, () => {
                      resolve({
                        result: result.result,
                        message: "create new stock success",
                      });
                    });
                  } else {
                    resolve({
                      result: result.result,
                      message: "create new stock success",
                    });
                  }
                }
              }
            );
          });
        }

        // case update stock
        let updateStocks = stockDataList.filter((stock) => stock._id !== "0");
        if (updateStocks.length > 0) {
          for (let updateStock of updateStocks) {
            // update stock
            promises.push(function (resolve) {
              update_stock_by_id(updateStock, res, resolve);
            });
            // check product
            if (typeof updateStock.products == "undefined") {
              updateStock.products = [];
            }
            if (updateStock.products.length > 0) {
              // case new product
              let newProducts = updateStock.products.filter(
                (p) => p._id === "0"
              );

              if (newProducts.length > 0) {
                // console.log("in if:", newProducts);
                // console.log("in if quotation id:", req.params.paramId);
                // console.log("in if stock id:", updateStock._id);
                promises.push(function (resolve) {
                  insertProductData(
                    res,
                    0,
                    newProducts,
                    req.params.paramId,
                    updateStock._id,
                    resolve
                  );
                });
              }

              // case update product
              let updateProducts = updateStock.products.filter(
                (p) => p._id !== "0"
              );
              if (updateProducts.length > 0) {
                for (let updateProduct of updateProducts) {
                  promises.push(function (resolve) {
                    update_product_by_id(updateProduct, res, resolve);
                  });
                }
              }
            }
          }
        }
      }

      // 2.delete stock
      if (deleteStockList.length > 0) {
        for (let deleteStock of deleteStockList) {
          promises.push(function (resolve) {
            delete_stock_by_id(deleteStock, res, resolve);
          });

          // delete product in stock
          promises.push(function (resolve) {
            delete_many_product(deleteStock, res, resolve);
          });
        }
      }

      // 3.delete product
      if (deleteProductList.length > 0) {
        for (let deleteProduct of deleteProductList) {
          // console.log("deleteProduct in for:", deleteProduct);
          promises.push(function (resolve) {
            delete_product_by_id(deleteProduct, res, resolve);
          });
        }
      }

      async.parallel(promises, function () {
        // console.log("Result", result);
        res.status(200).json({
          result: result.result,
          message: "Update quotation success.",
        });
      });
      // Promise.all(promises)
      //   .then((result) => {
      //     // res.status(200).json(result);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
    }
  );
};

exports.update_quotation_stock_by_id = (req, res, next) => {
  var pushdata = req.body.push;
  delete req.body["push"];

  ShareController.update_by_id(
    res,
    QuotationStockModel,
    req.params.paramId,
    req.body,
    pushdata,
    null,
    (result) => {
      res.status(200).json(result);
    }
  );
};

const update_stock_by_id = (stock, res, next) => {
  ShareController.update_by_id(
    res,
    QuotationStockModel,
    stock._id,
    stock,
    undefined,
    null,
    (result) => {
      // res.status(200).json(result);
      next();
    }
  );
};

const update_product_by_id = (product, res, next) => {
  ShareController.update_by_id(
    res,
    QuotationProductModel,
    product._id,
    product,
    undefined,
    null,
    (result) => {
      // res.status(200).json(result);
      next();
    }
  );
};

exports.delete_by_id = (req, res, next) => {
  var promises = [];
  var delParamId = req.params.paramId;
  promises.push(function (resolve) {
    ShareController.delete_by_id(
      res,
      SelectModel,
      delParamId,
      null,
      (result) => {
        resolve();
      }
    );
  });
  promises.push(function (resolve) {
    ShareController.delete_by_key(
      res,
      QuotationStockModel,
      "quotation_id",
      delParamId,
      null,
      (result) => {
        resolve();
      }
    );
  });
  promises.push(function (resolve) {
    ShareController.delete_by_key(
      res,
      QuotationProductModel,
      "quotation_id",
      delParamId,
      null,
      (result) => {
        resolve();
      }
    );
  });
  async.parallel(promises, function () {
    res.status(200).json({ message: "Delete quotation success." });
  });
};

const delete_stock_by_id = (req, res, next) => {
  ShareController.delete_by_id(
    res,
    QuotationStockModel,
    req._id,
    null,
    (result) => {
      // res.status(200).json({ status: result });
      next();
    }
  );
};

const delete_product_by_id = (req, res, next) => {
  ShareController.delete_by_id(
    res,
    QuotationProductModel,
    req._id,
    null,
    (result) => {
      // res.status(200).json({ status: result });
      next();
    }
  );
};

const delete_many_product = (req, res, next) => {
  ShareController.delete_by_key(
    res,
    QuotationProductModel,
    "quotation_stock_id",
    req._id,
    null,
    (result) => {
      next();
    }
  );
};

exports.delete_many = (req, res, next) => {
  ShareController.delete_many(
    res,
    SelectModel,
    req.body.idarr,
    null,
    (result) => {
      res.status(200).json({ status: result });
    }
  );
};

exports.update_all_approve = (req, res) => {
  // SelectModel.find({ approved: null, status: "อนุมัติแล้ว" }).exec(function (
  SelectModel.find({ approved: null, status: "อนุมัติแล้ว" }).exec(function (
    err,
    quotations
  ) {
    let promises = [];
    if (quotations.length > 0) {
      for (let quotation of quotations) {
        // quotation.approved = quotation.modified;
        // quotation.approvedby = quotation.modifiedby;

        promises.push(function (resolve) {
          SelectModel.updateOne(
            { _id: quotation._id },
            {
              $set: {
                approved: quotation.modified,
                approvedby: quotation.modifiedby,
              },
            }
          ).then(resolve());
          // ShareController.update_by_id(
          //   res,
          //   SelectModel,
          //   quotation._id,
          //   quotation,
          //   undefined,
          //   null,
          //   (result) => {
          //     resolve();
          //   }
          // );
        });
      }

      async.parallel(promises, function () {
        res.status(200).json({ message: "Update quotation success." });
      });
    }
  });
};

exports.find_no_total = (req, res, next) => {
  ShareController.get_by_aggregate_paginated_sort(
    res,
    SelectModel,
    [
      {
        $match: {
          document_type: "q",
          $and: [
            { total_price: { $eq: null } },
            { total_quantity: { $eq: null } },
          ],
        },
      },
      {
        $lookup: {
          from: "bww_quotation_products",
          localField: "_id",
          foreignField: "quotation_id",
          pipeline: [{ $sort: { sequence: 1 } }],
          as: "products",
        },
      },
      {
        $lookup: {
          from: "bww_quotation_stocks",
          localField: "_id",
          foreignField: "quotation_id",
          pipeline: [{ $sort: { sequence: 1 } }],
          as: "stocks",
        },
      },
    ],
    req.body.startRow,
    req.body.endRow,
    req.body.sort,
    null,
    (results) => {
      const response = {
        count: results.count,
        results: results.rows,
      };
      res.status(200).json(response);
    }
  );
};

exports.update_all_total = (req, res) => {
  let promises = [];
  let quotations = req.body;
  if (quotations.length > 0) {
    for (let quotation of quotations) {
      promises.push(function (resolve) {
        SelectModel.updateOne(
          { _id: quotation._id },
          {
            $set: {
              total_quantity: quotation.total_quantity,
              total_price: quotation.total_price,
            },
          }
        ).then(resolve());
      });
    }

    async.parallel(promises, function () {
      res.status(200).json({ message: "Update quotation success." });
    });
  } else {
    res
      .status(200)
      .json({ message: "All quotation total already have value." });
  }
};

const update_all_stock = (stockList, status, res, callback) => {
  let promises = [];
  // console.log("stocklist in update stock", stockList);
  if (stockList.length > 0) {
    for (let quotation_stock of stockList) {
      // console.log("stock id", quotation_stock._id);
      promises.push(function (resolve) {
        QuotationStockModel.updateOne(
          { _id: quotation_stock._id },
          {
            $set: {
              status: status,
            },
          }
        ).then(resolve());
      });
    }

    async.parallel(promises, function () {
      callback();
    });
  }
};

// exports.update_by_id = (req, res, next) => {
//   var pushdata = req.body.push;
//   delete req.body["push"];

//   var currentDataList = req.body.current;
//   delete req.body["current"];
//   // console.log("currentDataList", currentDataList);

//   var newDataList = req.body.new;
//   delete req.body["new"];
//   // console.log("newDataList:", newDataList);

//   // update quotation
//   ShareController.update_by_id(
//     res,
//     SelectModel,
//     req.params.paramId,
//     req.body.quotation,
//     pushdata,
//     null,
//     (result) => {
//       // find current data not in new data
//       let missingStocks = currentDataList.filter((current) => {
//         return !newDataList.some((newData) => {
//           return current._id === newData._id;
//         });
//       });
//       // console.log("missing stocks:", missingStocks);

//       // 1.case stock not in new data
//       let promises = [];
//       if (missingStocks.length > 0) {
//         for (let missingStock of missingStocks) {
//           // delete stock
//           promises.push(function (resolve) {
//             delete_stock_by_id(missingStock, res, resolve);
//           });

//           if (missingStock.products.length > 0) {
//             for (let missingProduct of missingStock.products) {
//               promises.push(function (resolve) {
//                 delete_product_by_id(missingProduct, res, resolve);
//               });
//             }
//           }
//         }
//       }

//       // find new data not in current
//       let newStocks = newDataList.filter((newData) => {
//         return !currentDataList.some((currentData) => {
//           return newData._id === currentData._id;
//         });
//       });
//       // console.log("new stocks:", newStocks);

//       // 2.case new data not in old stock
//       if (newStocks.length > 0) {
//         promises.push(function (resolve) {
//           insertStockData(res, 0, newStocks, req.params.paramId, resolve);
//         });
//       }

//       // find same data from current.
//       let sameStocks = currentDataList.filter((currentData) => {
//         return newDataList.some((newData) => {
//           return newData._id === currentData._id;
//         });
//       });
//       // console.log("sameStocks:", sameStocks);

//       // 3.case update data (new data === old data).
//       if (sameStocks.length > 0) {
//         for (let sameStock of sameStocks) {
//           // update stock
//           promises.push(function (resolve) {
//             update_stock_by_id(sameStock, res, resolve);
//           });

//           // 3.1 case product not in new product => delete product
//           // get stock from newDataList
//           let stockFromCurrentData = currentDataList.find(
//             (c) => c._id === sameStock._id
//           );
//           let stockFromNewData = newDataList.find(
//             (s) => s._id === sameStock._id
//           );
//           let missingProducts = stockFromCurrentData.products.filter((ss) => {
//             return !stockFromNewData.products.some((sfn) => {
//               return sfn._id === ss._id;
//             });
//           });
//           if (missingProducts.length > 0) {
//             for (let missingProduct of missingProducts) {
//               promises.push(function (resolve) {
//                 delete_product_by_id(missingProduct, res, resolve);
//               });
//             }
//           }

//           // 3.2 case new product not in new old product => add product
//           console.log(
//             "stockFromCurrentData Products in 3.2",
//             stockFromCurrentData.products
//           );
//           console.log(
//             "stockFromNewData products in 3.2",
//             stockFromNewData.products
//           );

//           let newProducts = stockFromNewData.products.filter((sfn) => {
//             return !stockFromCurrentData.products.some((ss) => {
//               return ss._id === sfn._id;
//             });
//           });
//           console.log("new products:", newProducts);

//           if (newProducts.length > 0) {
//             console.log("new product length work!", newProducts);
//             // add new product
//             promises.push(function (resolve) {
//               insertProductData(
//                 res,
//                 0,
//                 newProducts,
//                 req.params.paramId,
//                 stockFromCurrentData._id,
//                 resolve
//               );
//             });
//           }

//           // 3.3 case new product === old product => update product
//           let sameProducts = stockFromCurrentData.products.filter(
//             (currentProduct) => {
//               return stockFromNewData.products.some((newProduct) => {
//                 return newProduct._id === currentProduct._id;
//               });
//             }
//           );
//           console.log("sameProducts 3.3", sameProducts);
//           if (sameProducts.length > 0) {
//             for (let sameProduct of sameProducts) {
//               promises.push(function (resolve) {
//                 update_product_by_id(sameProduct, res, resolve);
//               });
//             }
//           }
//         }
//       }
//       async.parallel(promises, function () {
//         res.status(200).json({ message: "Update quotation success." });
//       });
//       // Promise.all(promises)
//       //   .then((result) => {
//       //     // res.status(200).json(result);
//       //   })
//       //   .catch((error) => {
//       //     console.log(error);
//       //   });
//     }
//   );
// };
