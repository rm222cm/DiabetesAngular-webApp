const { Parser } = require('json2csv');

const Insulin = require('../database/models/insulin');
const Activity = require('../database/models/activity');
const Carbs = require('../database/models/carbs');
const Glucose = require('../database/models/glucose');

const fields = [{
    label: 'Date',
    value: 'csvTime'
}, {
    label: 'Email',
    value: 'email'
}, {
    label: 'Dosage Type',
    value: 'dosageType'
}, {
    label: 'Dosage Units',
    value: 'dosageUnits'
}, {
    label: 'Activity Type',
    value: 'activityType'
}, {
    label: 'Activity Duration',
    value: 'activityDuration'
}, {
    label: 'Carbs Type',
    value: 'carbsType'
}, {
    label: 'Carbs Item',
    value: 'carbsItem'
}, {
    label: 'Glucose Type',
    value: 'glucoseType'
}, {
    label: 'Glucose Level Units',
    value: 'glucoseLevelUnits'
}];

const json2csvParser = new Parser({ fields, quote: '' });


exports.exportHistory = async(req, res) => {

    let insulinRecord = await Insulin.find({});
    let activityRecord = await Activity.find({});
    let carbsRecord = await Carbs.find({});
    let glucoseRecord = await Glucose.find({});


    let map = new Map();

    exports.addInsulinElementsToMap(insulinRecord, map);
    exports.addActivityElementsToMap(activityRecord, map);
    exports.addCarbsElementsToMap(carbsRecord, map);
    exports.addGlucoseElementsToMap(glucoseRecord, map);

    var mapAsc = new Map([...map.entries()].sort());
    let mapToArray = Array.from(mapAsc.values());

    const csv = await json2csvParser.parse(mapToArray);
    // res.setHeader('Content-disposition', 'attachment; filename=diabetes-logbook-history.csv');
    // res.set('Content-Type', 'text/csv');
    // res.status(200).send(csv);
    res.json({
        msg: 'success',
        redirect: '/home',
        data: csv
    });
};


exports.exportAsReport = async(req, res) => {

    let fromDate = new Date(req.body.startDate)
    let toDate = new Date(req.body.endDate)
    toDate.setDate(toDate.getDate() + 1)

    //making time as empty
    fromDate.setHours(0, 0, 0)
    toDate.setHours(0, 0, 0)

    let insulinRecord = await Insulin.find({ $and: [{ "dosageTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });
    let activityRecord = await Activity.find({ $and: [{ "activityTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });
    let carbsRecord = await Carbs.find({ $and: [{ "carbsTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });
    let glucoseRecord = await Glucose.find({ $and: [{ "glucoseTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });

    let map = new Map();

    exports.addInsulinElementsToMap(insulinRecord, map);
    exports.addActivityElementsToMap(activityRecord, map);
    exports.addCarbsElementsToMap(carbsRecord, map);
    exports.addGlucoseElementsToMap(glucoseRecord, map);

    var mapAsc = new Map([...map.entries()].sort());
    let mapToArray = Array.from(mapAsc.values());

    res.json({
        msg: 'success',
        redirect: '/home',
        data: mapToArray
    });
};

exports.exportAsReportInsulin = async(req, res) => {

    let fromDate = new Date(req.body.startDate)
    let toDate = new Date(req.body.endDate)
    let dosageType = req.body.dosageType
    toDate.setDate(toDate.getDate() + 1)

    //making time as empty
    fromDate.setHours(0, 0, 0)
    toDate.setHours(0, 0, 0)

    let insulinRecord = await Insulin.find({ $and: [{ "dosageTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }, { "dosageType": { $in: dosageType } }] });

    let map = new Map();

    exports.addInsulinElementsToMap(insulinRecord, map);

    var mapAsc = new Map([...map.entries()].sort());
    let mapToArray = Array.from(mapAsc.values());
    const index1 = dosageType.indexOf(1);
    const index2 = dosageType.indexOf(2);
    const index3 = dosageType.indexOf(3);
    if (index1 > -1) {
        mapToArray.push({ "_id": "", "dosageType": "1", "dosageUnits": "", "dosageTime": "2020-01-07T18:40:00.648Z", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }
    if (index2 > -1) {
        mapToArray.push({ "_id": "", "dosageType": "2", "dosageUnits": "", "dosageTime": "2020-01-07T18:40:00.648Z", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }
    if (index3 > -1) {
        mapToArray.push({ "_id": "", "dosageType": "3", "dosageUnits": "", "dosageTime": "2020-01-07T18:40:00.648Z", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }

    res.json({
        msg: 'success',
        redirect: '/home',
        data: mapToArray
    });
};

exports.exportAsReportActivity = async(req, res) => {

    let fromDate = new Date(req.body.startDate)
    let toDate = new Date(req.body.endDate)
    let activityType = req.body.activity
    toDate.setDate(toDate.getDate() + 1)

    //making time as empty
    fromDate.setHours(0, 0, 0)
    toDate.setHours(0, 0, 0)

    let activityRecord = await Activity.find({ $and: [{ "activityTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }, { "activityType": { $in: activityType } }] });

    let map = new Map();

    exports.addActivityElementsToMap(activityRecord, map);

    var mapAsc = new Map([...map.entries()].sort());
    let mapToArray = Array.from(mapAsc.values());
    const index1 = activityType.indexOf('running');
    const index2 = activityType.indexOf('jogging');
    const index3 = activityType.indexOf('walking');
    const index4 = activityType.indexOf('lifting_weight');
    if (index1 > -1) {
        mapToArray.push({ "_id": "", "activityType": "running", "activityDuration": "", "activityTime": "2020-01-07T18:40:00.648Z", "latestGlucoseLevelUnits": "", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }
    if (index2 > -1) {
        mapToArray.push({ "_id": "", "activityType": "jogging", "activityDuration": "", "activityTime": "2020-01-07T18:40:00.648Z", "latestGlucoseLevelUnits": "", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }
    if (index3 > -1) {
        mapToArray.push({ "_id": "", "activityType": "walking", "activityDuration": "", "activityTime": "2020-01-07T18:40:00.648Z", "latestGlucoseLevelUnits": "", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }
    if (index4 > -1) {
        mapToArray.push({ "_id": "", "activityType": "lifting_weight", "activityDuration": "", "activityTime": "2020-01-07T18:40:00.648Z", "latestGlucoseLevelUnits": "", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }

    res.json({
        msg: 'success',
        redirect: '/home',
        data: mapToArray
    });
};

exports.exportAsReportCarbs = async(req, res) => {

    let fromDate = new Date(req.body.toDate)
    let toDate = new Date(req.body.fromDate)
    let carbsType = req.body.carbsType
    toDate.setDate(toDate.getDate() + 1)

    //making time as empty
    fromDate.setHours(0, 0, 0)
    toDate.setHours(0, 0, 0)
    let carbsRecord = await Carbs.find({ $and: [{ "carbsTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }, { "carbsType": { $in: carbsType } }] });

    // let activityRecord = await Activity.find({ $and: [{ "activityTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }, { "activityType": { $in: activityType } }] });

    let map = new Map();

    exports.addCarbsElementsToMap(carbsRecord, map);

    var mapAsc = new Map([...map.entries()].sort());
    let mapToArray = Array.from(mapAsc.values());
    const index1 = carbsType.indexOf(1);
    const index2 = carbsType.indexOf(2);
    const index3 = carbsType.indexOf(3);

    if (index1 > -1) {
        mapToArray.push({ "_id": "", "carbsItem": "", "carbsType": "1", "carbsTime": "2020-01-07T18:40:00.648Z", "latestGlucoseLevelUnits": "", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }
    if (index2 > -1) {
        mapToArray.push({ "_id": "", "carbsItem": "", "carbsType": "2", "carbsTime": "2020-01-07T18:40:00.648Z", "latestGlucoseLevelUnits": "", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }
    if (index3 > -1) {
        mapToArray.push({ "_id": "", "carbsItem": "", "carbsType": "3", "carbsTime": "2020-01-07T18:40:00.648Z", "latestGlucoseLevelUnits": "", "entryTime": "", "latestGlucoseLevelUnits": "", "email": req.session.user.email, "__v": 0 });
    }

    res.json({
        msg: 'success',
        redirect: '/home',
        data: mapToArray
    });
};

exports.exportAsReportGlucose = async(req, res) => {

    let fromDate = new Date(req.body.fromDate);
    let toDate = new Date(req.body.toDate);

    //making time as empty
    fromDate.setHours(0, 0, 0);
    toDate.setHours(0, 0, 0);

    console.log('fromDate', fromDate);
    console.log('toDate', toDate);

    let glucoseRecord =  await Glucose.find({ $and: [{ "glucoseTime": { "$gte": toDate , "$lt": fromDate } }, { "email": req.session.user.email }] });
    // 
    
    let map = new Map();

    exports.addGlucoseElementsToMap(glucoseRecord, map);

    var mapAsc = new Map([...map.entries()].sort());
    let mapToArray = Array.from(mapAsc.values());

    res.json({
        msg: 'success',
        redirect: '/home',
        data: mapToArray
    });
};


exports.export = async(req, res) => {

    let fromDate = new Date(req.body.startDate)
    let toDate = new Date(req.body.endDate)
    toDate.setDate(toDate.getDate() + 1)

    //making time as empty
    fromDate.setHours(0, 0, 0)
    toDate.setHours(0, 0, 0)


    let insulinRecord = await Insulin.find({ $and: [{ "dosageTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });
    let activityRecord = await Activity.find({ $and: [{ "activityTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });
    let carbsRecord = await Carbs.find({ $and: [{ "carbsTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });
    let glucoseRecord = await Glucose.find({ $and: [{ "glucoseTime": { "$gte": fromDate, "$lt": toDate } }, { "email": req.session.user.email }] });


    let map = new Map();

    exports.addInsulinElementsToMap(insulinRecord, map);
    exports.addActivityElementsToMap(activityRecord, map);
    exports.addCarbsElementsToMap(carbsRecord, map);
    exports.addGlucoseElementsToMap(glucoseRecord, map);

    var mapAsc = new Map([...map.entries()].sort());
    let mapToArray = Array.from(mapAsc.values());

    const csv = await json2csvParser.parse(mapToArray);
    res.json({
        msg: 'success',
        redirect: '/home',
        data: csv
    });
};

exports.addInsulinElementsToMap = function(insulinRecord, map) {
    for (let i = 0; i < insulinRecord.length; i++) {
        var element = insulinRecord[i];
        var d = element.dosageTime;
        var datestring = ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" +
            d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        element.csvTime = datestring;
        if (map.has(datestring)) {
            var getElement = map.get(datestring);
            getElement.dosageType = element.dosageType;
            getElement.dosageUnits = element.dosageUnits;
            map.set(datestring, getElement);
        } else {
            map.set(datestring, element);
        }
    }
};

exports.addActivityElementsToMap = function(activityRecord, map) {
    for (let i = 0; i < activityRecord.length; i++) {
        var element = activityRecord[i];
        var d = element.activityTime;
        var datestring = ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" +
            d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        element.csvTime = datestring;
        if (map.has(datestring)) {
            var getElement = map.get(datestring);
            getElement.activityType = element.activityType;
            getElement.activityDuration = element.activityDuration;
            map.set(datestring, getElement);
        } else {
            map.set(datestring, element);
        }
    }
};

exports.addCarbsElementsToMap = function(carbsRecord, map) {
    for (let i = 0; i < carbsRecord.length; i++) {
        var element = carbsRecord[i];
        var d = element.carbsTime;
        var datestring = ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" +
            d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        element.csvTime = datestring;
        if (map.has(datestring)) {
            var getElement = map.get(datestring);
            getElement.carbsType = element.carbsType;
            getElement.carbsItem = element.carbsItem;
            map.set(datestring, getElement);
        } else {
            map.set(datestring, element);
        }
    }
};

exports.addGlucoseElementsToMap = function(glucoseRecord, map) {

    for (let i = 0; i < glucoseRecord.length; i++) {
        var element = glucoseRecord[i];
        var d = element.glucoseTime;
        var datestring = ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" +
            d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        element.csvTime = datestring;
        if (map.has(datestring)) {
            var getElement = map.get(datestring);
            getElement.glucoseType = element.glucoseType;
            getElement.glucoseLevelUnits = element.glucoseLevelUnits;
            map.set(datestring, getElement);
        } else {
            map.set(datestring, element);
        }
    }
};
