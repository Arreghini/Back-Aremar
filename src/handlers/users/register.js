const registerController = require('../../controllers/users/register');

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const user = await registerController(username, email, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Email or password are not valid' });
  }
};

module.exports = { registerUser };
