import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCaseStudies } from "../redux/slices/caseStudySlice";
import { Link } from "react-router-dom";
import { trackAnalyticsEvent } from "../utils/analytics";
import { HiOutlineMagnifyingGlass, HiChevronDown } from "react-icons/hi2";
import Navbar from "../components/Common/Navbar";

const CATEGORY_OPTIONS = [
  "Port Operations",
  "Terminal Berthing",
  "Maritime Logistics",
  "Supply Chain",
  "Freight",
  "Trade",
  "Infrastructure",
  "Technology",
];

const REGION_OPTIONS = [
  "South Africa",
  "SADC",
  "Africa",
  "Asia",
  "Europe",
  "Middle East",
  "North America",
  "South America",
  "Global",
];

const CaseStudiesPage = () => {
  const dispatch = useDispatch();
  const hasTrackedRef = useRef(false);
  const debounceRef = useRef(null);

  const {
    caseStudies = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.caseStudies || {});

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const safeCaseStudies = Array.isArray(caseStudies) ? caseStudies : [];
  const hasCaseStudies = safeCaseStudies.length > 0;

  const runSearch = useCallback(
    ({
      search = searchText,
      category = selectedCategory,
      region = selectedRegion,
    } = {}) => {
      dispatch(
        fetchCaseStudies({
          published: true,
          sortBy: "newest",
          limit: 12,
          search: search.trim(),
          category: category || undefined,
          region: region || undefined,
        })
      );
    },
    [dispatch, searchText, selectedCategory, selectedRegion]
  );

  useEffect(() => {
    if (!hasCaseStudies && !loading) {
      dispatch(
        fetchCaseStudies({
          published: true,
          sortBy: "newest",
          limit: 12,
        })
      );
    }
  }, [dispatch, hasCaseStudies, loading]);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const timer = setTimeout(() => {
      trackAnalyticsEvent({
        eventType: "page_view",
        page: "case-studies",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runSearch({
        search: searchText,
      });
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText, runSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    runSearch();
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900">
            Case Studies
          </h1>
          <p className="mt-2 text-slate-600">
            Explore insights, research, and structured maritime and logistics case studies.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="lg:min-w-0 lg:flex-[2]">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search keywords for a case study..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                />
              </div>
            </div>

            <div className="relative lg:flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative lg:flex-1">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
              >
                <option value="">All Regions</option>
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="lg:flex-shrink-0">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-custom-blue px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 lg:w-auto"
              >
                <HiOutlineMagnifyingGlass className="h-5 w-5" />
                Search
              </button>
            </div>
          </div>
        </form>

        {loading && safeCaseStudies.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Loading case studies...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && safeCaseStudies.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            No case studies found.
          </div>
        )}

        {safeCaseStudies.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {safeCaseStudies.map((item) => (
              <Link
                key={item._id}
                to={`/case-studies/${item.slug}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {item.featuredImage ? (
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-52 bg-slate-100" />
                )}

                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.category || "Uncategorized"} •{" "}
                    {item.region || "Unknown Region"}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {item.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {item.description}
                  </p>

                  <p className="mt-4 text-xs text-slate-500">
                    {item.author || "Unknown Author"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CaseStudiesPage;