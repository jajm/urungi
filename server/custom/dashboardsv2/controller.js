const Dashboardsv2 = connection.model('Dashboardsv2');

const Controller = require('../../core/controller.js');

class Dashboardsv2Controller extends Controller {
    constructor () {
        super(Dashboardsv2);
        this.searchFields = [];
    }
}

var controller = new Dashboardsv2Controller();

exports.Dashboardsv2FindAll = async function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    var perPage = config.get('pagination.itemsPerPage');
    var page = (req.query.page) ? req.query.page : 1;
    var result = controller.findAllParams(req);
    let response;

    const commonPipeline = [
        {
            $match: result.find,
        },
    ];

    const pipeline = commonPipeline.slice();

    if (result.fields && Object.keys(result.fields).length > 0) {
        result.fields.layer = 1;
        pipeline.push({ $project: result.fields });
    }

    if (result.params.sort && Object.keys(result.params.sort).length > 0) {
        pipeline.push({ $sort: result.params.sort });
    }

    if (result.params.skip) {
        pipeline.push({ $skip: result.params.skip });
    }

    if (result.params.limit) {
        pipeline.push({ $limit: result.params.limit });
    }

    const collationSpec = {
        locale: 'en',
        strength: 2,
    };

    const countPipeline = commonPipeline.slice();
    countPipeline.push({ $count: 'totalCount' });

    const countDocs = await Dashboardsv2.aggregate(countPipeline);
    const count = countDocs.length ? countDocs[0].totalCount : 0;
    const dashboardsv2 = await Dashboardsv2.aggregate(pipeline).collation(collationSpec);

    response = {
        result: 1,
        page: page,
        pages: req.query.page ? Math.ceil(count / perPage) : 1,
        items: dashboardsv2,
    };

    res.status(200).json(response);
};

exports.Dashboardsv2FindOne = function (req, res) {
    // TODO: Are you granted to execute this Dashboard???

    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.Dashboardsv2Create = function (req, res) {
    if (!req.session.Dashboardsv2Create && !req.session.isWSTADMIN) {
        res.status(401).json({ result: 0, msg: 'You don´t have permissions to create Dashboards' });
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        req.body.owner = req.user._id;
        req.body.isPublic = false;
        req.body.isShared = false;

        req.body.author = req.user.userName;

        controller.create(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.Dashboardsv2Duplicate = function (req, res) {
    if (!req.session.Dashboardsv2Create && !req.session.isWSTADMIN) {
        res.status(401).json({ result: 0, msg: 'You don´t have permissions to create Dashboardsv2' });
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        delete (req.body._id);
        req.body.dashboardName = 'Copy of ' + req.body.dashboardName;
        req.body.owner = req.user._id;
        req.body.isPublic = false;
        req.body.isShared = false;
        req.body.parentFolder = undefined;
        controller.create(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.Dashboardsv2Update = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    var data = req.body;

    if (!req.session.isWSTADMIN) {
        Dashboardsv2.findOne({ _id: data._id, owner: req.user._id }, { _id: 1 }, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req).then(function (result) {
                    res.status(200).json(result);
                });
            } else {
                res.status(401).json({ result: 0, msg: 'You don´t have permissions to update this Dashboard' });
            }
        });
    } else {
        controller.update(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.Dashboardsv2Delete = async function (req, res) {
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.nd_trash_deleted = true;
        dashboard.nd_trash_deleted_date = new Date();

        dashboard.save().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard deleted' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error deleting dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.getDashboard = function (req, res) {
    req.query.trash = true;
    var theReports = [];

    // TODO: permissions to execute

    controller.findOne(req).then(function (result) {
        if (!result.item || (!result.item.isPublic && !req.isAuthenticated())) {
            return res.status(403).send('Forbidden');
        }
        // identify reports of the Dashboard...

        if (result) {
            // Annotate the execution in statistics
            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'Dashboard';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.dashboardName;
            stat.action = 'execute';
            statistics.save(req, stat, function () {

            });

            for (var r in result.item.items) {
                if (result.item.items[r].itemType === 'reportBlock') {
                    theReports.push(result.item.items[r].reportID);
                }
                if (result.item.items[r].itemType === 'tabBlock') {
                    // $scope.getTabBlock(result.item.items[r]);
                }
            }

            // Get all the reports...
            var Reports = connection.model('Reports');

            Reports.find({ _id: { $in: theReports } }, function (err, reports) {
                if (err) { console.error(err); }

                if (reports) {
                    for (var r in reports) {
                        for (var i in result.item.items) {
                            if (reports[r]._id === result.item.items[i].reportID) {
                                result.item.items[i].reportDefinition = reports[r];
                            }
                        }
                    }

                    res.status(200).json(result);
                } else {
                // TODO: NO REPORTS FOUND
                }
            });
        } else {
            // TODO: NO DASHBOARD FOUND
        }
    });
};

exports.PublishDashboard = async function (req, res) {
    // TODO: Check if the connected user has the permission to publish
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.publish().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard published' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error publishing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.UnpublishDashboard = async function (req, res) {
    // TODO: Check if logged in user has the permission to publish
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.unpublish().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard unpublished' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error unpublishing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.ShareDashboard = async function (req, res) {
    // TODO: Check if the connected user has the permission to share
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.share(req.body.parentFolder).then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard shared' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error sharing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.UnshareDashboard = async function (req, res) {
    // TODO: Check if logged in user has the permission to share
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.unshare().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard unshared' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error unsharing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

function getDashboardFromRequest (req) {
    const conditions = {
        _id: req.body._id || req.body.id,
        companyID: req.user.companyID,
    };

    if (!req.session.isWSTADMIN) {
        conditions.owner = req.user._id;
    }

    return Dashboardsv2.findOne(conditions).exec();
}
