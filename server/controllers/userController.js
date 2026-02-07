export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchedCities = req.user.recentSearchedCities;

    res.json({
      success: true,
      user: { role },
      recentSearchedCities,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
