import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const QuoteResultsPage = () => {
  const { results, loading, error, searchParams } = useSelector(
    (state) => state.quotes || {}
  );

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Quote Results
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Available freight options
          </h1>

          {searchParams && (
            <p className="mt-2 text-sm text-slate-600">
              {searchParams.serviceType} delivery from {searchParams.pickupCity} to{" "}
              {searchParams.dropoffCity} for {searchParams.weight}kg
            </p>
          )}
        </div>

        {loading && <p className="text-sm text-slate-600">Loading quotes...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && results?.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-600">
              No matching companies found yet.
            </p>
            <Link
              to="/user-home"
              className="mt-4 inline-block text-sm font-semibold text-custom-blue"
            >
              Back to search
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {results?.map((item, index) => (
            <div
              key={`${item.companyName}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.serviceType}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {item.companyName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Route: {item.pickupCity} → {item.dropoffCity}
                  </p>
                  <p className="text-sm text-slate-600">
                    Distance: {item.distance} km
                  </p>
                  <p className="text-sm text-slate-600">
                    Delivery: {item.estimatedDays}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-sm text-slate-500">Estimated price</p>
                  <p className="text-2xl font-bold text-custom-blue">
                    R {item.finalPrice.toFixed(2)}
                  </p>
                  <button className="mt-3 rounded-xl bg-custom-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                    Select Company
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 text-sm text-slate-600 md:grid-cols-4">
                <p>Base: R {item.baseRate}</p>
                <p>Rate/km: R {item.ratePerKm}</p>
                <p>Rate/kg: R {item.ratePerKg}</p>
                <p>Minimum: R {item.minimumCharge}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteResultsPage;