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
        content: '<button id="connect-button">Connect</button>'
               + '<button id="sync-button" disabled="disabled">Sync</button>'
               + '<img id="warning" src="" style="visibility: hidden">'
               + '<span id="error-label"> </span>',
        onReady: function (event) {
            let widget = this;
            widget.width = 250;
            let document = event.target;
            let connect_button = document.getElementById("connect-button");
            let sync_button = document.getElementById("sync-button");
            let throbber = document.getElementById("throbber");
            let warning = document.getElementById("warning");
            let error_label = document.getElementById("error-label");

            connect_button.style.height = "22px";
            connect_button.style.margin = 0;
            connect_button.style.backgroundColor = "transparent";
            sync_button.style.height = "22px";
            sync_button.style.margin = 0;
            sync_button.style.paddingLeft = "18px";
            sync_button.style.backgroundColor = "transparent";
            sync_button.style.backgroundPosition = "left center";
            sync_button.style.backgroundRepeat = "no-repeat";

            function setThrobberImage(filename) {
                sync_button.style.backgroundImage
                    = "url('" + self.data.url(filename) + "')";
            }

            warning.src = self.data.url("warning-16.png");

            connect_button.addEventListener("click", function () {
                if (Weave.Service.isLoggedIn) {
                    Weave.Service.logout();
                } else {
                    Weave.Service.login();
                }
            }, false);

            sync_button.addEventListener("click", function () {
                Weave.Service.sync();
            }, false);

            function setConnectButtonLabel (label) {
                connect_button.firstChild.nodeValue = label;
            }
            function setErrorLabel (label) {
                warning.style.visibility = label ? "visible" : "hidden";
                error_label.firstChild.nodeValue = label;
            }
            function setSyncButtonLabel (label) {
                sync_button.firstChild.nodeValue = label;
            }

            function initUI () {
                setThrobberImage("sync-16x16.png");
                if (Weave.Service.isLoggedIn) {
                    setConnectButtonLabel("Disconnect");
                    connect_button.removeAttribute("disabled");
                    sync_button.removeAttribute("disabled");
                } else if (needsSetup()) {
                    connect_button.setAttribute("disabled", "disabled");
                    sync_button.setAttribute("disabled", "disabled");
                    setErrorLabel("Needs setup");
                } else {
                    setConnectButtonLabel("Connect");
                    connect_button.removeAttribute("disabled");
                    sync_button.setAttribute("disabled", "disabled");
                }
            }
            initUI();

            observers.add("weave:service:sync:start", function () {
                setThrobberImage("sync-throbber-16x16-active.apng");
                connect_button.setAttribute("disabled", "disabled");
                sync_button.setAttribute("disabled", "disabled");
                setSyncButtonLabel("Syncing...");
                setErrorLabel("");
            });

            observers.add("weave:service:sync:finish", function () {
                setThrobberImage("sync-16x16.png");
                connect_button.removeAttribute("disabled");
                sync_button.removeAttribute("disabled");
                setSyncButtonLabel("Sync");
            });

            observers.add("weave:engine:sync:start", function (subject, data) {
                let engine = (subject == "clients") ? Weave.Clients
                                  : Weave.Engines.get(subject);
                setSyncButtonLabel("Syncing " + engine.Name);
            });

            observers.add("weave:service:sync:error", function () {
                let error = Weave.Utils.getErrorString(Weave.Status.sync);
                setErrorLabel("Error: " + error);
            });

            observers.add("weave:service:login:start", function () {
                setConnectButtonLabel("Connecting...");
                connect_button.setAttribute("disabled", "disabled");
            });
            observers.add("weave:service:login:finish", initUI);

            observers.add("weave:service:logout:finish", initUI);
            observers.add("weave:service:setup-complete", initUI);

            observers.add("private-browsing", function (subject, data) {
                if (needsSetup()) {
                    return;
                }
                if (data == "enter") {
                    setErrorLabel("Private browsing");
                } else {
                    setErrorLabel("");
                    return;
                }
            });

        }
    }));
};
