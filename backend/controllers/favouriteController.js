const User = require("../models/CompanyUser");
const ActivityLog = require("../models/ActivityLog");

const toggleFavouriteService = async (req, res) => {
  try {
    const { serviceName } = req.body;

    if (!serviceName) {
      return res.status(400).json({ message: "Service name is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFavourite = user.favouriteServices.includes(serviceName);

    if (alreadyFavourite) {
      user.favouriteServices = user.favouriteServices.filter(
        (service) => service !== serviceName
      );
    } else {
      user.favouriteServices.push(serviceName);
    }

    await user.save();

    await ActivityLog.create({
      company: req.user.company._id,
      branch: req.user.branch?._id || null,
      user: req.user._id,
      userIdText: req.user.userId,
      username: req.user.username,
      module: "Dashboard",
      service: "Favourite Services",
      action: alreadyFavourite ? "remove_favourite" : "add_favourite",
      message: `${req.user.username} ${alreadyFavourite ? "removed" : "added"} ${serviceName} ${alreadyFavourite ? "from" : "to"} favourites`,
      meta: { serviceName },
    });

    return res.status(200).json({
      favouriteServices: user.favouriteServices,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFavouriteServices = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("favouriteServices");
    return res.status(200).json(user?.favouriteServices || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  toggleFavouriteService,
  getFavouriteServices,
};