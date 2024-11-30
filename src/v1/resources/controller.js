const express = require("express");
const upload = require("../../config/mutureConfig");
const { authenticateUser } = require("../../middleware/auth");
const resourceService = require("./service");

class ResourceController {
  /**
   *
   * @param {String} baseRoute
   * @param {express.Router} router
   */
  register(baseRoute, router) {
    router.get(`${baseRoute}/`, authenticateUser, this.getResources);
    router.get(`${baseRoute}/:id`, authenticateUser, this.getResource);
    router.post(
      `${baseRoute}/`,
      authenticateUser,
      upload.single("file"),
      this.addResource
    );
    router.delete(`${baseRoute}/:id`, authenticateUser, this.deleteResource);
    router.get(`${baseRoute}/:id/:token`, this.getGuestResource);
  }

  /**
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  async getResources(req, res, next) {
    try {
      const { status } = req.query;
      const userId = req.user.id;
      const resources = await resourceService.getResources(userId, status);

      res.status(200).json({ resources });
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  async getResource(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const resource = await resourceService.getResource(id, userId);

      if (!resource) {
        return res
          .status(404)
          .json({ error: "Resource not found or unauthorized" });
      }

      res.status(200).json({ resource });
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  async getGuestResource(req, res, next) {
    try {
      const { id, token } = req.params;
      const resource = await resourceService.getGuestResource(id, token);

      if (!resource) {
        return res
          .status(404)
          .json({ error: "Invalid Url or resource not found" });
      }

      res.status(200).json({ resource });
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  async addResource(req, res, next) {
    try {
      const file = req.file;
      const { expirationTime } = req.body;
      const userId = req.user.id;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const resource = await resourceService.addResource({
        file,
        expirationTime,
        userId,
      });

      res.status(201).json({
        message: "Resource uploaded successfully",
        resourceId: resource.id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  async deleteResource(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const success = await resourceService.deleteResource(id, userId);

      if (!success) {
        return res
          .status(404)
          .json({ error: "Resource not found or unauthorized" });
      }

      res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

const resourceController = new ResourceController();

module.exports = resourceController;
