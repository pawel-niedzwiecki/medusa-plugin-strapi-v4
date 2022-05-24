"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const body_parser_1 = require("body-parser");
const middlewares_1 = require("../../middlewares");
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use("/hooks", route);
    route.post("/update-medusa", body_parser_1.default.json(), middlewares_1.default.wrap(require("./update-medusa").default));
    route.post("/seed", body_parser_1.default.json(), middlewares_1.default.wrap(require("./seed").default));
    return app;
};
