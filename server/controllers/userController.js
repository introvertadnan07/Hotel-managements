export const getUserData = async (req, res) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Example role logic (customize as needed)
    const role = "hotelOwner"; // or fetch from DB
    const recentSearchedCities = [];

    res.json({
      success: true,
      user: { role },
      recentSearchedCities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const storeRecentSearchCities = async (req, res) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { city } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    res.json({
      success: true,
      message: "City stored successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
