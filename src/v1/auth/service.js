const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");

class AuthService {
  /**
   * Login a user by email and password
   * @param {string} email
   * @param {string} password
   * @param {function} next Express next function
   * @returns {string} JWT token
   */
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return token;
  }

  /**
   * Sign up a new user
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {function} next Express next function
   * @returns {Object} User data
   */
  async signup(name, email, password) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const error = new Error("Email already in use");
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return user;
  }
}

const authService = new AuthService();

module.exports = authService;
