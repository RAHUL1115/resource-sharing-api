const express = require("express");
const authController = require("../v1/auth/controller");
const resourceController = require("../v1/resources/controller");

const v1Router = express.Router();

// * resources
authController.register("/auth", v1Router);
resourceController.register("/resources", v1Router);

module.exports = v1Router;
