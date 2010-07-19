const self = require("self");
const widgets = require("widget");
const observers = require("observer-service");
const {Cu} = require("chrome");

let namespace = {};
Cu.import("resource://services-sync/service.js", namespace);
let Weave = namespace.Weave;

exports.main = function(options, callbacks) {

    function needsSetup() {
        return (Weave.Status.service == Weave.CLIENT_NOT_CONFIGURED)
            || (Weave.Svc.Prefs.get("firstSync", "") == "notReady");
    }
 
    widgets.add(widgets.Widget({
        label: "Firefox Sync",
        content: '<img id="throbber" src=""><span id="status">Firefox Sync</span>',
        onReady: function (event) {
            let widget = this;
            widget.width = 150;
            let document = event.target;
            let throbber = document.getElementById("throbber");
            let status = document.getElementById("status");

            function setStatus (label) {
                status.firstChild.nodeValue = label;
            }

            function init () {
                throbber.src = self.data.url("sync-16x16.png");
                if (Weave.Service.isLoggedIn) {
                    setStatus("Connected");
                } else if (needsSetup()) {
                    setStatus("Needs setup");
                } else {
                    setStatus("Disconnected");
                }
            }
            init();

            observers.add("weave:service:sync:start", function () {
                throbber.src = self.data.url("sync-throbber-16x16-active.apng");
                setStatus("Syncing...");
            });

            observers.add("weave:service:sync:finish", function () {
                throbber.src = self.data.url("sync-16x16.png");
                setStatus("Connected");
            });

            observers.add("weave:engine:sync:start", function (subject, data) {
                let engine = (subject == "clients") ? Weave.Clients
                                  : Weave.Engines.get(subject);
                setStatus("Syncing " + engine.displayName);
            });

            observers.add("weave:service:sync:error", function () {
                throbber.src = self.data.url("warning-16.png");
                let error = Weave.Utils.getErrorString(Weave.Status.sync);
                setStatus("Error: " + error);
            });

            observers.add("weave:service:login:finish", function () {
                if (needsSetup()) {
                    setStatus("Needs setup");
                } else {
                    setStatus("Connected");
                }
            });

            observers.add("weave:service:logout:finish", function () {
                if (needsSetup()) {
                    setStatus("Needs setup");
                } else {
                    setStatus("Disconnected");
                }
            });

            observers.add("private-browsing", function (subject, data) {
                if (data == "enter") {
                    setStatus("Private browsing");
                } else {
                    init();
                }
            });

        }
    }));
};
