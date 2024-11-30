const crypto = require("crypto");
const prisma = require("../../config/prisma");

class ResourceService {
  /**
   * Fetch all resources for a user with optional status filter
   * @param {string} userId
   * @param {string} status
   */
  async getResources(userId, status) {
    const currentTime = new Date();

    return await prisma.resource.findMany({
      where: {
        userId,
        ...(status === "active" && {
          expirationTime: { gt: currentTime },
        }),
        ...(status === "expired" && {
          expirationTime: { lte: currentTime },
        }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch a single resource by ID for a user
   * @param {string} id
   * @param {string} userId
   */
  async getResource(id, userId) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    console.log(resource, userId);

    if (!resource || resource.userId !== userId) {
      return null;
    }

    return resource;
  }

  /**
   * Fetch a resource via shared token
   * @param {string} id
   * @param {string} token
   */
  async getGuestResource(id, token) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (
      !resource ||
      resource.accessToken !== token ||
      new Date() > resource.expirationTime
    ) {
      return null;
    }

    return resource;
  }

  /**
   * Add a new resource
   * @param {Object} params
   * @param {Object} params.file
   * @param {string} params.expirationTime
   * @param {string} params.userId
   */
  async addResource({ file, expirationTime, userId }) {
    const defaultExpiration = expirationTime
      ? new Date(expirationTime)
      : new Date(Date.now() + 3600 * 1000); // 1 hour default

    return await prisma.resource.create({
      data: {
        resourceUrl: `/uploads/${file.filename}`,
        expirationTime: defaultExpiration,
        userId,
        accessToken: crypto.randomUUID(),
      },
    });
  }

  /**
   * Delete a resource by ID for a user
   * @param {string} id
   * @param {string} userId
   */
  async deleteResource(id, userId) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource || resource.userId !== userId) {
      return false;
    }

    await prisma.resource.delete({
      where: { id },
    });

    return true;
  }
}

const resourceService = new ResourceService();

module.exports = resourceService;
