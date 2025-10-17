const path = require("path");
const karmaJasmine = require("karma-jasmine");
const karmaChromeLauncher = require("karma-chrome-launcher");
const karmaJasmineHtmlReporter = require("karma-jasmine-html-reporter");
const karmaCoverage = require("karma-coverage");
const angularDevkit = require("@angular-devkit/build-angular/plugins/karma");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      karmaJasmine,
      karmaChromeLauncher,
      karmaJasmineHtmlReporter,
      karmaCoverage,
      angularDevkit,
    ],
    client: { jasmine: {}, clearContext: false },
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: path.join(__dirname, "../../coverage/webadmin"),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }],
    },
    reporters: ["progress", "kjhtml"],
    browsers: ["ChromeHeadless"],
    restartOnFileChange: true,
    singleRun: false,
  });
};
