const mongoose = require("mongoose");
const ShareController = require('./share');
const SelectModel = require("../models/user");
const  bcrypt = require('bcrypt');

exports.get_all = (req, res, next) => {
    ShareController.get_all(res, SelectModel, null, (results) => {
        const response = {
            count: results.length,
            results: results
        };
        res.status(200).json(response);
    });
}

exports.get_all_aggregate = (req, res, next) => {
    ShareController.get_all_aggregate(res, SelectModel, [

    ], null, (results) => {

        const response = {
            count: results.length,
            results: results
        };
        res.status(200).json(response);
    });
}

exports.find_by_id = (req, res, next) => {

    ShareController.get_all_aggregate(res, SelectModel, [
        {
            $match:
            {
                $expr:
                    { $eq: [{ $toString: '$_id' }, req.params.paramId] }
            }
        }
    ], null, (results) => {
        if (results.length > 0) {
            return res.status(200).json(results[0]);
        }
        else {
            res.status(422).send({
                message: 'find-by-id-not-found'
            });
        }
    });
}

exports.find_by_props = (req, res, next) => {
    //console.log(req.body.filter);
    //{ modified: -1 }
    ShareController.get_by_aggregate_paginated_sort(res, SelectModel, [
        {
            $match: {
                $expr: req.body.filter
            }
        }
    ], req.body.startRow, req.body.endRow, req.body.sort, null, (results) => {
        const response = {
            count: results.count,
            results: results.rows
        };
        res.status(200).json(response);
    });
}

exports.create_new = (req, res, next) => {
    //console.log(req.body);
    var curpassword = req.body.password;
    delete req.body['password'];
    var newData = new SelectModel(req.body);
    newData._id = new mongoose.Types.ObjectId();
    newData.hash_password = bcrypt.hashSync(curpassword, 10);
    ShareController.create_new(res, newData, null, (result) => {
        res.status(200).json(result);
    });
}

exports.update_by_id = (req, res, next) => {

    var pushdata = req.body.push;
    delete req.body['push'];

    var curpassword = req.body.password;
    delete req.body['password'];

    var updateuser = req.body;
    if(curpassword && curpassword != ""){
        updateuser.hash_password = bcrypt.hashSync(curpassword, 10);
    }

    ShareController.update_by_id(res, SelectModel, req.params.paramId, updateuser, pushdata, null, (result) => {
        res.status(200).json(result);
    });
};

exports.delete_by_id = (req, res, next) => {
    ShareController.delete_by_id(res, SelectModel, req.params.paramId, null, (result) => {
        res.status(200).json({ status: result });
    });
};

exports.delete_many = (req, res, next) => {
    ShareController.delete_many(res, SelectModel, req.body.idarr, null, (result) => {
        res.status(200).json({ status: result });
    });
};