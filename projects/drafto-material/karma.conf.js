const path = require("path");
const karmaJasmine = require("karma-jasmine");
const karmaChromeLauncher = require("karma-chrome-launcher");
const karmaJasmineHtmlReporter = require("karma-jasmine-html-reporter");
const karmaCoverage = require("karma-coverage");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    plugins: [
      karmaJasmine,
      karmaChromeLauncher,
      karmaJasmineHtmlReporter,
      karmaCoverage,
    ],
    client: { jasmine: {}, clearContext: false },
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: path.join(__dirname, "../../coverage/drafto-material"),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }],
    },
    reporters: ["progress", "kjhtml"],
    browsers: ["ChromeHeadless"],
    restartOnFileChange: true,
    singleRun: false,
  });
};
