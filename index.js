const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const SettingsBill = require("./settings-bill");
const moment = require("moment");

const app = express();

const settingsBill = SettingsBill();

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.engine('handlebars', exphbs({ defaultLayout: 'main', layoutsDir: 'views/layouts' }));

app.set('view engine', 'handlebars');

app.use(express.static('public'));


app.get("/", function (req, res) {
    res.render("index", {
        settings: settingsBill.getSettings(),
        totals: settingsBill.totals(),
        totalStyle: settingsBill.color()


    })
});

app.post("/settings", function (req, res) {
    settingsBill.setSettings({
        callCost: req.body.callCost,
        smsCost: req.body.smsCost,
        warningLevel: req.body.warningLevel,
        criticalLevel: req.body.criticalLevel
    });

    res.render("index", {
        settings: settingsBill.getSettings()
    })
});

app.post("/action", function (req, res) {
    settingsBill.recordAction(req.body.actionType)
    console.log(settingsBill.totals());

    res.redirect("/");
});

app.get("/actions", function (req, res) {
    const actions = settingsBill.actions();
    for (action of actions) {
        action.stringDate = moment(action.timestamp).fromNow();
    }
    res.render("actions", { actions: settingsBill.actions() });

});

app.get("/actions/:actionType", function (req, res) {
    const actionType = req.params.actionType;
    const actions = settingsBill.actionsFor(actionType);
    for (action of actions) {
        action.stringDate = moment(action.timestamp).fromNow();
    }
    res.render("actions", { actions: settingsBill.actionsFor(actionType) });
});

const PORT = process.env.PORT || 3014;
app.listen(PORT, function () {
    console.log("App started at port", PORT);
})