import Hotel from "../models/Hotel";
import User from "../models/User";


export const registerHotel = async(req, res) => {
    try {
        const {name, address, contact, city} = req.body;
        const owner = req.user._id

        // Check if user Already Registerd

        const hotel = await hotel.finOne({owner})
        if(hotel) {
            return res.json({ sucess: false, message: "hotel Alreday Registerd"})
        }

        await Hotel.create({name, address, contact, city, owner});

        await User.findByIdAndUpdate(owner, {role: "hotelOwner"});

        res.json({success: true, message: "hotel Registred Successfully "})


    } catch (error) {

        res.json({success: false, message: error.message})
    }
}