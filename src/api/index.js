"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hooks_1 = require("./routes/hooks");
exports.default = (container) => {
    const app = (0, express_1.Router)();
    (0, hooks_1.default)(app);
    return app;
};
