import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { Clock3, Eye, User } from "lucide-react";

import {
  fetchCaseStudyBySlug,
  fetchCaseStudies,
  incrementCaseStudyViews,
  clearCurrentCaseStudy,
} from "../redux/slices/caseStudySlice";
import LoadSpinner from "../components/Tools/LoadSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const Section = ({ title, text }) => {
  if (!text) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="whitespace-pre-line leading-7 text-slate-700">{text}</p>
    </section>
  );
};

Section.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
};

Section.defaultProps = {
  text: "",
};

const formatCaseStudyDate = (dateValue) => {
  if (!dateValue) return "No date";

  return new Date(dateValue).toLocaleDateString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCaseStudyDateTime = (dateValue) => {
  if (!dateValue) return "Publication date not set";

  return new Date(dateValue).toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CaseStudyDetailsPage = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const startedAtRef = useRef(null);

  const { caseStudy, caseStudies, loading, error } = useSelector(
    (state) => state.caseStudies
  );

  useEffect(() => {
    dispatch(fetchCaseStudies(true));
  }, [dispatch]);

  useEffect(() => {
    if (!slug) return;

    startedAtRef.current = Date.now();

    dispatch(clearCurrentCaseStudy());
    dispatch(fetchCaseStudyBySlug(slug));
    dispatch(incrementCaseStudyViews(slug));

    return () => {
      if (!startedAtRef.current || !slug) return;

      const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);

      if (seconds >= 5) {
        axios
          .put(`${API_BASE_URL}/api/case-studies/slug/${slug}/read-time`, {
            seconds,
          })
          .catch((err) => {
            console.error("Failed to record case study read time:", err);
          });
      }
    };
  }, [dispatch, slug]);

  if (loading && !caseStudy) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="px-6 py-10 text-red-600">{error}</div>;
  }

  if (!caseStudy) {
    return <div className="px-6 py-10">Case study not found.</div>;
  }

  const viewCount = caseStudy.views || caseStudy.viewCount || 0;

  const mostViewedCaseStudies = (caseStudies || [])
    .filter((item) => item.slug !== caseStudy.slug)
    .sort(
      (a, b) => (b.views || b.viewCount || 0) - (a.views || a.viewCount || 0)
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 xl:col-span-8">
          {caseStudy.featuredImage && (
            <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <img
                src={caseStudy.featuredImage}
                alt={caseStudy.title}
                className="h-[300px] w-full object-cover md:h-[380px]"
              />
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>{caseStudy.category}</span>
              <span>•</span>
              <span>{formatCaseStudyDate(caseStudy.publishDate)}</span>
              {caseStudy.settings?.showRegion && caseStudy.region && (
                <>
                  <span>•</span>
                  <span>{caseStudy.region}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
              {caseStudy.title}
            </h1>

            {caseStudy.subtitle && (
              <p className="mt-3 text-lg text-slate-600">
                {caseStudy.subtitle}
              </p>
            )}

            {caseStudy.description && (
              <p className="mt-5 text-base leading-7 text-slate-600">
                {caseStudy.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-5 text-sm text-slate-500">
              {caseStudy.settings?.showAuthor && caseStudy.author && (
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{caseStudy.author}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                <span>{formatCaseStudyDateTime(caseStudy.publishDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{viewCount} views</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <Section
              title="Introduction"
              text={caseStudy.content?.introduction}
            />
            <Section
              title="Background / Context"
              text={caseStudy.content?.backgroundContext}
            />
            <Section
              title="Problem Statement"
              text={caseStudy.content?.problemStatement}
            />
            <Section title="Objectives" text={caseStudy.content?.objectives} />
            <Section
              title="Methodology / Approach"
              text={caseStudy.content?.methodology}
            />
            <Section
              title="Main Body / Analysis"
              text={caseStudy.content?.analysisBody}
            />
            <Section
              title="Key Findings"
              text={caseStudy.content?.keyFindings}
            />
            <Section
              title="Recommendations"
              text={caseStudy.content?.recommendations}
            />
            <Section
              title="Conclusion"
              text={caseStudy.content?.conclusion}
            />

            <div className="mt-10 border-t border-slate-200" />

            <div className="mt-6 flex flex-col items-center justify-center gap-4">
              <p className="text-sm font-medium text-slate-600">
                Share this article
              </p>

              <div className="flex items-center gap-4">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:scale-110"
                >
                  <img
                    src="https://img.icons8.com/ios-filled/50/1e293b/linkedin.png"
                    alt="LinkedIn"
                    className="h-6 w-6"
                  />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:scale-110"
                >
                  <img
                    src="https://img.icons8.com/ios-filled/50/1e293b/facebook-new.png"
                    alt="Facebook"
                    className="h-6 w-6"
                  />
                </a>

                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:scale-110"
                >
                  <img
                    src="https://img.icons8.com/ios-filled/50/1e293b/instagram-new.png"
                    alt="Instagram"
                    className="h-6 w-6"
                  />
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:scale-110"
                >
                  <img
                    src="https://img.icons8.com/ios-filled/50/1e293b/whatsapp.png"
                    alt="WhatsApp"
                    className="h-6 w-6"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              Most Viewed Case Studies
            </h3>

            <div className="space-y-3">
              {mostViewedCaseStudies.length > 0 ? (
                mostViewedCaseStudies.map((post) => (
                  <Link
                    key={post._id}
                    to={`/case-studies/${post.slug}`}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white hover:shadow-sm"
                  >
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-slate-200" />
                    )}

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        {post.category && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                            {post.category}
                          </span>
                        )}
                        <span>{formatCaseStudyDate(post.publishDate)}</span>
                      </div>

                      <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                        {post.title}
                      </p>

                      {post.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {post.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No additional case studies available yet.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CaseStudyDetailsPage;