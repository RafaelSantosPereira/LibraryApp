function createAuthController(authService) {
  return {
    async login(req, res) {
      try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.cookie('token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 8 * 60 * 60 * 1000
        });

        res.json({
          message: 'Login successful',
          user: result.user
        });
      } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
          message: error.message || 'Internal Server Error'
        });
      }
    },

    async getCurrentUser(req, res) {
      try {
        const user = await authService.getCurrentUser(req.user.id);
        res.json({ user });
      } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
          message: error.message || 'Internal Server Error'
        });
      }
    },

    async signup(req, res) {
      try {
        const { username, email, password, role } = req.body;
        const result = await authService.signup(username, email, password, role);
        res.status(201).json(result);
      } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
          message: error.message || 'Internal Server Error'
        });
      }
    },

    logout(req, res) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      res.json({ message: 'Logged out successfully' });
    }
  };
}

module.exports = { createAuthController };
