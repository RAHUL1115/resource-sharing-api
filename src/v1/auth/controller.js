const express = require("express");
const authService = require("./service");

class AuthController {
  /**
   * @param {String} baseRoute
   * @param {express.Router} router
   */
  register(baseRoute, router) {
    router.post(`${baseRoute}/login`, this.login);
    router.post(`${baseRoute}/signup`, this.signup);
  }

  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const user = await authService.signup(name, email, password);
      res
        .status(201)
        .json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      next(error);
    }
  }
}

const authController = new AuthController();

module.exports = authController;
