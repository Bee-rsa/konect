import PropTypes from "prop-types";
import { Heart } from "lucide-react";

const FavouriteServicesCard = ({ favourites = [] }) => {
  return (
    <section className="rounded border bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Heart size={16} className="text-red-500" />
        Favourite Services
      </div>

      {favourites.length === 0 ? (
        <div className="text-xs text-slate-500">
          No favourite services selected yet.
        </div>
      ) : (
        <div className="space-y-2">
          {favourites.map((service) => (
            <div
              key={service}
              className="rounded border px-3 py-2 text-sm text-slate-700"
            >
              {service}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

FavouriteServicesCard.propTypes = {
  favourites: PropTypes.arrayOf(PropTypes.string),
};

export default FavouriteServicesCard;