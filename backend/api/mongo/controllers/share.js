const moment = require("moment-timezone");
const async = require("async");

const db_error = (res, error, maperrname) => {
  //console.log(maperrname);
  console.log(error);
  res.status(422).send({
    success: false,
    message: maperrname ? maperrname : error.errmsg,
  });
};
const db_success = (fnsuccess, result, message) => {
  fnsuccess({
    success: true,
    message: message,
    result: result,
  });
};
exports.get_all = (res, model, maperrname, fnsuccess) => {
  model
    .find()
    .exec()
    .then((results) => {
      fnsuccess(results);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.get_all_sort = (res, model, sort, maperrname, fnsuccess) => {
  model
    .find()
    .sort(sort)
    .exec()
    .then((results) => {
      fnsuccess(results);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.get_all_aggregate = (res, model, aggregate, maperrname, fnsuccess) => {
  model
    .aggregate(aggregate)
    .exec()
    .then((results) => {
      fnsuccess(results);
    })
    .catch((err) => {
      //console.log("err", err);
      db_error(res, err, maperrname);
    });
};

exports.get_one_query = (res, query, model, maperrname, fnsuccess) => {
  model
    .findOne(query)
    .exec()
    .then((result) => {
      fnsuccess(result);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};
exports.get_one_query_sort = (
  res,
  query,
  sort,
  model,
  maperrname,
  fnsuccess
) => {
  model
    .findOne(query)
    .sort(sort)
    .exec()
    .then((result) => {
      fnsuccess(result);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.get_all_query = (res, query, model, maperrname, fnsuccess) => {
  model
    .find(query)
    .exec()
    .then((results) => {
      fnsuccess(results);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.get_all_query_sort = (
  res,
  model,
  query,
  sort,
  maperrname,
  fnsuccess
) => {
  model
    .find(query)
    .sort(sort)
    .exec()
    .then((results) => {
      fnsuccess(results);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};
/**
 * Query posts by user -> paginated results and a total count.
 * @param startRow {Number} First row to return in results (startwith 0)
 * @param endRow {Number} Last row to return in results (Page Size)
 * @param [sort] {Object} Optional sort query object
 */
exports.get_by_aggregate_paginated_sort = (
  res,
  model,
  aggregate,
  startRow,
  endRow,
  sort,
  maperrname,
  fnsuccess
) => {
  const aggregateall = aggregate.filter((f) => {
    return f["$match"] != null && typeof f["$match"] != "undefined";
  });
  //const aggregateall = aggregate.concat([]);
  //console.log(aggregateall);
  aggregateall.push({ $group: { _id: null, n: { $sum: 1 } } });

  if (sort) {
    // maybe we want to sort by post title or something
    aggregate.push({ $sort: sort });
  }

  if (
    typeof startRow === "number" &&
    typeof endRow === "number" &&
    endRow > 0
  ) {
    aggregate.push({ $limit: startRow + endRow });
    aggregate.push({ $skip: startRow });
    // aggregate.push(
    //     {
    //         $group: {
    //             _id: null,
    //             // get a count of every result that matches until now
    //             count: { $sum: 1 },
    //             // keep our results for the next operation
    //             results: { $push: '$$ROOT' }
    //         }
    //     },
    //     // and finally trim the results to within the range given by start/endRow
    //     {
    //         $project: {
    //             count: 1,
    //             rows: { $slice: ['$results', startRow, endRow] }
    //         }
    //     }
    // )
  } else {
    // aggregate.push(
    //     {
    //         $group: {
    //             _id: null,
    //             // get a count of every result that matches until now
    //             count: { $sum: 1 },
    //             // keep our results for the next operation
    //             results: { $push: '$$ROOT' }
    //         }
    //     },
    //     // and finally trim the results to within the range given by start/endRow
    //     {
    //         $project: {
    //             count: 1,
    //             rows: '$results'
    //         }
    //     }
    // )
  }
  //console.log(aggregate);

  // model.aggregate(aggregate)
  // .exec()
  // .then(results => {
  //     //console.log(results);
  //     if(results.length > 0){
  //         //fnsuccess(results[0]);
  //         fnsuccess({
  //             count: 0,
  //             rows: results
  //         });
  //     }
  //     else{
  //         fnsuccess({
  //             count: 0,
  //             rows: []
  //         });
  //     }
  // })
  // .catch(err => {
  //     db_error(res, err, maperrname);
  // });
  var promisedata = [];

  // console.log(aggregateall);
  // console.log(aggregate);
  // console.log("-----");
  promisedata.push(function (callback) {
    model
      .aggregate(aggregateall)
      .exec()
      .then((results) => {
        //console.log(results);
        callback(null, results.length > 0 ? results[0].n : 0);
      })
      .catch((err) => {
        callback(err, maperrname);
      });
  });

  promisedata.push(function (callback) {
    model
      .aggregate(aggregate)
      .exec()
      .then((results) => {
        //console.log(results.length);
        callback(null, results);
      })
      .catch((err) => {
        callback(err, maperrname);
      });
  });

  async.parallel(promisedata, function (err, results) {
    if (!err) {
      fnsuccess({
        count: results[0],
        rows: results[1],
      });
    } else {
      db_error(res, err, results);
    }
  });
};

exports.get_distinct = (res, model, dis_field, maperrname, fnsuccess) => {
  model
    .distinct(dis_field)
    .exec()
    .then((result) => {
      fnsuccess(result);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.find_by_id = (res, model, id, maperrname, fnsuccess) => {
  model
    .findById(id)
    .exec()
    .then((result) => {
      fnsuccess(result);
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.create_new = (res, modeldata, maperrname, fnsuccess) => {
  const cremo = moment().tz("Asia/Bangkok").format("M/D/YYYY HH:mm:ss");
  modeldata.created = cremo;
  modeldata.modified = cremo;
  modeldata
    .save()
    .then((result) => {
      db_success(fnsuccess, result, "create-success");
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.update_by_id = (
  res,
  model,
  id,
  data,
  pushdata,
  maperrname,
  fnsuccess
) => {
  if (data) {
    data = Object.assign(data, {
      modified: moment().tz("Asia/Bangkok").format("M/D/YYYY HH:mm:ss"),
    });
    if (pushdata) {
      model
        .update({ _id: id }, { $push: pushdata, $set: data })
        .exec()
        .then((result) => {
          db_success(fnsuccess, result, "update-success");
        })
        .catch((err) => {
          db_error(res, err, maperrname);
        });
    } else {
      model
        .update({ _id: id }, { $set: data })
        .exec()
        .then((result) => {
          db_success(fnsuccess, result, "update-success");
        })
        .catch((err) => {
          db_error(res, err, maperrname);
        });
    }
  } else {
    if (pushdata) {
      model
        .update({ _id: id }, { $push: pushdata })
        .exec()
        .then((result) => {
          db_success(fnsuccess, result, "update-success");
        })
        .catch((err) => {
          db_error(res, err, maperrname);
        });
    }
  }
};

exports.update_many_id = (
  res,
  model,
  idarr,
  data,
  pushdata,
  maperrname,
  fnsuccess
) => {
  data = Object.assign(data, {
    modified: moment().tz("Asia/Bangkok").format("M/D/YYYY HH:mm:ss"),
  });

  if (pushdata) {
    model
      .updateMany({ _id: { $in: idarr } }, { $push: pushdata, $set: data })
      .exec()
      .then((result) => {
        db_success(fnsuccess, result, "update-success");
      })
      .catch((err) => {
        db_error(res, err, maperrname);
      });
  } else {
    model
      .updateMany({ _id: { $in: idarr } }, { $set: data })
      .exec()
      .then((result) => {
        db_success(fnsuccess, result, "update-success");
      })
      .catch((err) => {
        db_error(res, err, maperrname);
      });
  }
};

exports.delete_by_id = (res, model, id, maperrname, fnsuccess) => {
  model
    .remove({ _id: id })
    .exec()
    .then((result) => {
      db_success(fnsuccess, result, "delete-success");
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.delete_by_key = (res, model, key, id, maperrname, fnsuccess) => {
  var delobj = {};
  delobj[key] = id;
  model
    .remove(delobj)
    .exec()
    .then((result) => {
      db_success(fnsuccess, result, "delete-success");
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};

exports.delete_many = (res, model, idarr, maperrname, fnsuccess) => {
  //console.log(idarr);
  model
    .remove({ _id: { $in: idarr } })
    .exec()
    .then((result) => {
      db_success(fnsuccess, result, "delete-success");
    })
    .catch((err) => {
      db_error(res, err, maperrname);
    });
};
