
// GET /api/user/

export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({sucess: true, role, recentSearchedCities})

    } catch (error) {
        res.json({sucess: false, message: error.message})

    }
}


// Store User Recent Searched cities

export const storeRecentSearchCities = async (req, res) => {
    try {
        const {recentSearchedCity} = req.body;
        const user = await req.user;

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchedCity)
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity)
        }

        await user.save();
        res.json({sucess: true, message: "City added"})


    } catch (error) {
        res.json({sucess: false, message: error.message })

    }
};