define(function(require, exports, module) {
"use strict";

exports.snippetText = require("../requirejs/text!./javascript-jquery.snippets")
    + "\n"
    + require("../requirejs/text!./javascript.snippets");
exports.scope = "javascript";

});
