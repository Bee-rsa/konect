import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCaseStudies } from "../../redux/slices/caseStudySlice";
import { Link } from "react-router-dom";

const AdminCaseStudiesPage = () => {
  const dispatch = useDispatch();
  const { caseStudies, loading, error } = useSelector((state) => state.caseStudies);

  useEffect(() => {
    dispatch(fetchCaseStudies(false));
  }, [dispatch]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Case Studies</h1>
        <Link
          to="/admin/case-studies/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New Case Study
        </Link>
      </div>

      {loading && <p>Loading case studies...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4">
        {caseStudies.map((item) => (
          <div
            key={item._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {item.author} • {item.category} • {item.region}
                </p>
              </div>

              <Link
                to={`/case-studies/${item.slug}`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCaseStudiesPage;