const IncomingForm = require('formidable').IncomingForm;
const XLSX = require('xlsx');
const btoa = require('btoa');
const fs = require('fs');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const StockModel = require('../models/stock');
const { getJsDateFromExcel } = require("excel-date-to-js");


const FindModelByName = function (name) {
    switch (name) {
        case "bww_stocks":
            return StockModel;
    }
}


const excelToDatabaseWithBody = function (req, res) {
    var form = new IncomingForm();
    let readBuffer;
    //let excelKeys;
    let group;
    let body_data;
    form.parse(req, (err, fields, files) => {
        //console.log(fields);
        // if (fields["excelkeys"]) {
        //     excelKeys = JSON.parse(fields["excelkeys"]);
        // }
        if (fields["group"]) {
            group = fields["group"];
        }
        if (fields["course_type"]) {
            body_data = JSON.parse(fields["course_type"]);
        }
    });
    form.on('file', (field, file) => {
        // Do something with the file
        // e.g. save it to the database
        // you can access it using file.path
        readBuffer = fs.readFileSync(file.path);
    });
    form.on('end', () => {
        //console.log(d);
        let workBook = XLSX.read(readBuffer, { type: 'buffer' });
        let jsonData = workBook.SheetNames.reduce((initial, name) => {
            const sheet = workBook.Sheets[name];
            initial[name] = XLSX.utils.sheet_to_json(sheet);
            return initial;
        }, {});

        // console.log(excelKeys);
        // console.log(jsonData.Sheet1);
        let focussheet = '';
        Object.keys(jsonData).forEach(function (key, index) {
            if (index === 0) {
                focussheet = key;
            }
        });
        //jsonData.data
        var recordfail = [];
        // if (excelKeys) {
        if (jsonData[focussheet] && jsonData[focussheet].length > 0) {
            //console.log(err);
            /***  Import/ Update data ***/
            console.log(jsonData[focussheet].length);
            let checkkeymaple = true;
            // Object.keys(jsonData[focussheet][0]).forEach(function (key) {
            //     //console.log("key:", key);
            //     if (key !== 'id' && key !== 'status') {
            //         if (typeof studentkey[key] == "undefined" && typeof applicationkey[key] == "undefined") {
            //             checkkeymaple = false;
            //         }
            //     }
            // });
            // console.log("studentkey", studentkey);
            // console.log("applicationkey", applicationkey);
            //console.log(checkkeymaple);

            //console.log("body_data", body_data);

            if (checkkeymaple) {
                //res.status(200).json({ message: 'import-success' });

                //update & find master

                const updateAndFindMaster = (index, d, refs, refObj, mainerror, callback) => {
                    if (refs.length > 0) {
                        let currentRefs = refs[index];

                        let ParentModel = FindModelByName(currentRefs.table_name);
                        let targetFilterObj = {};
                        let targetObj = {};
                        let isSkip = true;

                        let convertdate = null;

                        if (currentRefs.filter_columns) {
                            currentRefs.filter_columns.forEach(function (key) {
                                let type = '';
                                let curval = d[key];
                                if (typeof key !== "string") {
                                    curval = key.title?  d[key.title] : d[key.name];
                                    type = key.type;
                                    key = key.name;
                                }

                                switch (type) {
                                    case "date":
                                        if (typeof curval == "number") {
                                            convertdate = moment(getJsDateFromExcel(curval), "YYYY-MM-DDTHH:mm:ss:SSSZ").add(1, 'ms').utc();
                                        } else {
                                            convertdate = moment(curval, "ll");
                                        }
                                        if (convertdate.isValid()) {
                                            targetFilterObj[key] = convertdate.format('M/D/YYYY 07:00');
                                        }
                                        break;
                                    case "bool":
                                        targetFilterObj[key] = curval ? curval : false;
                                        break;
                                    default:
                                        targetFilterObj[key] = curval;
                                        break;
                                }
                                if (targetFilterObj[key]) {
                                    isSkip = false;
                                }
                            });
                        }

                        if (currentRefs.fix_filter_data) {
                            currentRefs.fix_filter_data.forEach(function (data) {
                                targetFilterObj[data.column] = data.value;
                            });
                        }

                        if (currentRefs.update_columns) {
                            currentRefs.update_columns.forEach(function (key) {
                                let type = '';
                                let curval = d[key];
                                if (typeof key !== "string") {
                                    curval = key.title?  d[key.title] : d[key.name];                                    
                                    type = key.type;
                                    key = key.name;
                                }

                                switch (type) {
                                    case "date":
                                        if (typeof curval == "number") {
                                            convertdate = moment(getJsDateFromExcel(curval), "YYYY-MM-DDTHH:mm:ss:SSSZ").add(1, 'ms').utc();
                                        } else {
                                            convertdate = moment(curval, "ll");
                                        }
                                        if (convertdate.isValid()) {
                                            targetObj[key] = convertdate.format('M/D/YYYY 07:00');
                                        }
                                        break;
                                    case "bool":
                                        targetObj[key] = curval ? curval : false;
                                    default:
                                        targetObj[key] = curval;
                                        break;
                                }
                            });
                        }

                        if (currentRefs.fix_data) {
                            currentRefs.fix_data.forEach(function (data) {
                                targetObj[data.column] = data.value;
                            });
                        }
                        //console.log("isSkip", isSkip);
                        if (!isSkip) {

                            ParentModel.findOneAndUpdate(targetFilterObj, targetObj, { upsert: true, new: true })
                                .exec()
                                .then(stu => {
                                    //console.log("stu", stu);
                                    refObj[currentRefs.ref_to] = stu._id;
                                    index++;
                                    if (refs.length === index) {
                                        callback(refObj, mainerror);

                                    }
                                    else {
                                        updateAndFindMaster(index, d, refs, refObj, mainerror, callback);
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                    mainerror.push(index + 1);
                                    index++;
                                    if (refs.length === index) {
                                        callback(refObj, mainerror);
                                    }
                                    else {
                                        updateAndFindMaster(index, d, refs, refObj, mainerror, callback);
                                    }
                                });

                        } else {
                            //console.log("skip parent");
                            mainerror.push(index + 1);
                            index++;
                            if (refs.length === index) {
                                callback(refObj, mainerror);
                            }
                            else {
                                updateAndFindMaster(index, d, refs, refObj, mainerror, callback);
                            }
                        }
                    } else {
                        callback(refObj, mainerror);
                    }
                }

                //read database
                const instertData = (index) => {
                    let d = jsonData[focussheet][index];
                    if (typeof d !== "undefined") {

                        let TargetMode = FindModelByName(body_data.table_name);
                        let targetFilterObj = {};
                        let targetObj = {};
                        let isSkip = true;

                        let convertdate = null;

                        if (body_data.filter_columns) {
                            body_data.filter_columns.forEach(function (key) {
                                let type = '';
                                let curval = d[key];
                                // console.log("d", d);
                                // console.log("key", key);
                                if (typeof key !== "string") {
                                    curval = key.title?  d[key.title] : d[key.name];
                                    type = key.type;
                                    key = key.name;
                                }

                                switch (type) {
                                    case "date":
                                        if (typeof curval == "number") {
                                            convertdate = moment(getJsDateFromExcel(curval), "YYYY-MM-DDTHH:mm:ss:SSSZ").add(1, 'ms').utc();
                                        } else {
                                            convertdate = moment(curval, "ll");
                                        }
                                        if (convertdate.isValid()) {
                                            targetFilterObj[key] = convertdate.format('M/D/YYYY 07:00');
                                        }
                                        break;
                                    case "bool":
                                        targetFilterObj[key] = curval ? curval : false;
                                    default:
                                        targetFilterObj[key] = curval;
                                        break;
                                }
                                if (targetFilterObj[key]) {
                                    isSkip = false;
                                }
                            });
                        }

                        if (body_data.fix_filter_data) {
                            body_data.fix_filter_data.forEach(function (data) {
                                targetFilterObj[data.column] = data.value;
                            });
                        }

                        if (body_data.update_columns) {
                            body_data.update_columns.forEach(function (key) {
                                let type = '';
                                let curval = d[key];
                                //console.log("typeof key", typeof key);
                                if (typeof key !== "string") {
                                    curval = key.title?  d[key.title] : d[key.name];
                                    type = key.type;
                                    key = key.name;
                                }

                               // console.log("curval", curval);

                                switch (type) {
                                    case "date":
                                        if (typeof curval == "number") {
                                            convertdate = moment(getJsDateFromExcel(curval), "YYYY-MM-DDTHH:mm:ss:SSSZ").add(1, 'ms').utc();
                                        } else {
                                            convertdate = moment(curval, "ll");
                                        }
                                        if (convertdate.isValid()) {
                                            targetObj[key] = convertdate.format('M/D/YYYY 07:00');
                                        }
                                        break;
                                    case "bool":
                                        targetObj[key] = curval ? curval : false;
                                    default:
                                        targetObj[key] = curval;
                                        break;
                                }
                            });
                        }

                        if (body_data.fix_data) {
                            body_data.fix_data.forEach(function (data) {
                                targetObj[data.column] = data.value;
                            });
                        }
                        //console.log("targetObj", targetObj);
                        updateAndFindMaster(0, d, body_data.refs, {}, [], function (mergeObj, mainerr) {
                            if (!isSkip && mainerr.length == 0) {
                                let concateObj = { ...targetObj, ...mergeObj }
                                TargetMode.findOneAndUpdate(targetFilterObj, concateObj, { upsert: true })
                                    .exec()
                                    .then(stu => {
                                        index++;
                                        if (jsonData[focussheet].length === index) {
                                            if (recordfail.length == 0) {
                                                res.status(200).json({ message: 'import-success' });
                                            }
                                            else {
                                                res.status(201).json({ message: 'import-failed', rows: recordfail });
                                            }

                                        }
                                        else {
                                            instertData(index)
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        recordfail.push(index + 1);
                                        index++;
                                        if (jsonData[focussheet].length === index) {
                                            if (recordfail.length == 0) {
                                                res.status(200).json({ message: 'import-success' });
                                            }
                                            else {
                                                res.status(201).json({ message: 'import-failed', rows: recordfail });
                                            }

                                        }
                                        else {
                                            instertData(index)
                                        }
                                    });

                            } else {
                                //console.log("skip target");
                                recordfail.push(index + 1);
                                index++;
                                if (jsonData[focussheet].length === index) {
                                    if (recordfail.length == 0) {
                                        res.status(200).json({ message: 'import-success' });
                                    }
                                    else {
                                        res.status(201).json({ message: 'import-failed', rows: recordfail });
                                    }

                                }
                                else {
                                    instertData(index)
                                }
                            }
                        });
                        //console.log(studentobj.email);


                    }
                }
                instertData(0);
            }
            else {
                res.json({ message: 'excel-key-header-incorrect' });
            }
        }
        else {
            res.json({ message: 'excel-data-failed' });
        }

    });
}


module.exports.ImportWithBody = function (req, res) {
    excelToDatabaseWithBody(req, res);
};

