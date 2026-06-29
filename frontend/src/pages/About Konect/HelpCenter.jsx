import { useMemo, useState } from "react";
import {
  FaSearch,
  FaChevronRight,
  FaCompass,
  FaDatabase,
  FaBookOpen,
  FaShieldAlt,
  FaLifeRing,
  FaExternalLinkAlt,
  FaRegClock,
} from "react-icons/fa";

const HELP_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <FaCompass className="text-custom-blue text-sm" />,
    description: "Set up, navigate, and understand the platform structure.",
    articles: [
      {
        title: "What Cargo Konect is",
        type: "Overview",
        readTime: "2 min",
        content:
          "Cargo Konect is a terminal berthing intelligence and maritime insights platform. It is designed to help users access berth-related visibility, interpret operational patterns, and read research-led case studies. Cargo Konect does not provide freight booking, payment handling, or shipping execution services.",
      },
      {
        title: "How to navigate the platform",
        type: "Tutorial",
        readTime: "3 min",
        content:
          "Use the Terminal Berthing section to review vessel activity and berth-related information. Use Case Studies to read research-based industry analysis. Use filters and search to narrow down visible information. The platform is designed for information discovery, not transaction execution.",
      },
      {
        title: "What users should know before relying on data",
        type: "Important",
        readTime: "2 min",
        content:
          "Platform data should be treated as informational. Users should independently verify critical details before using them for operational, commercial, or time-sensitive decisions.",
      },
    ],
  },
  {
    id: "terminal-berthing",
    title: "Terminal Berthing",
    icon: <FaDatabase className="text-custom-blue text-sm" />,
    description: "Understand vessel records, berth activity, and schedule interpretation.",
    articles: [
      {
        title: "How to read a berthing entry",
        type: "Tutorial",
        readTime: "4 min",
        content:
          "A berthing entry may include vessel name, terminal, ETA, ETB, berth window, status, and supporting operational notes. Use these together to understand current movement, expected activity, and possible changes within terminal flow.",
      },
      {
        title: "Why vessel records may change",
        type: "Explainer",
        readTime: "2 min",
        content:
          "Berthing schedules are dynamic. Changes can result from congestion, weather, port-side constraints, terminal operations, or revised vessel movement. Information may update as new data becomes available.",
      },
      {
        title: "How to use berth data responsibly",
        type: "Best Practice",
        readTime: "3 min",
        content:
          "Use berth data as a visibility layer, not as a confirmed operational instruction. For critical movement planning, always cross-check against official operator, port authority, or agent communication.",
      },
    ],
  },
  {
    id: "case-studies",
    title: "Case Studies",
    icon: <FaBookOpen className="text-custom-blue text-sm" />,
    description: "Research-based insights, analytical commentary, and interpretive content.",
    articles: [
      {
        title: "What case studies are based on",
        type: "Overview",
        readTime: "2 min",
        content:
          "Case studies on Cargo Konect are based on research, publicly available information, observed industry patterns, and internal analytical interpretation.",
      },
      {
        title: "Are case studies factual or opinion-based?",
        type: "Important",
        readTime: "2 min",
        content:
          "They are research-based but interpretive. They may contain opinions, analytical conclusions, and directional insights. They should not be treated as legal, financial, or operational advice.",
      },
      {
        title: "How to use case studies inside your workflow",
        type: "Tutorial",
        readTime: "3 min",
        content:
          "Use case studies to understand market patterns, port behaviour, terminal themes, and strategic context. They work best as an intelligence layer alongside official documents and internal decision-making processes.",
      },
    ],
  },
  {
    id: "account-access",
    title: "Account & Access",
    icon: <FaShieldAlt className="text-custom-blue text-sm" />,
    description: "Access, profile controls, and general support topics.",
    articles: [
      {
        title: "Managing your account access",
        type: "Tutorial",
        readTime: "2 min",
        content:
          "Keep your account details current and ensure that login credentials remain secure. Do not share access details across multiple users unless your access model allows it.",
      },
      {
        title: "What to do if something looks wrong",
        type: "Support",
        readTime: "2 min",
        content:
          "If data appears incomplete, out of date, or inconsistent, refresh the page, review filters, and compare against recent entries. If the issue continues, contact support with the specific page, vessel, or dataset involved.",
      },
    ],
  },
];

const HELP_TUTORIALS = [
  "How to read berth windows",
  "How to interpret vessel status changes",
  "How to use case studies for market context",
  "How to verify data before acting on it",
];

const HELP_SHORTCUTS = [
  "Terminal Berthing Guide",
  "Case Study Usage Guide",
  "Data Interpretation Notes",
  "Account & Access Help",
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [openArticle, setOpenArticle] = useState("What Cargo Konect is");

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return HELP_SECTIONS;

    const q = searchQuery.toLowerCase();

    return HELP_SECTIONS.map((section) => ({
      ...section,
      articles: section.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(q) ||
          article.content.toLowerCase().includes(q) ||
          article.type.toLowerCase().includes(q)
      ),
    })).filter((section) => section.articles.length > 0);
  }, [searchQuery]);

  const visibleSections = searchQuery.trim()
    ? filteredSections
    : HELP_SECTIONS;

  const currentSection =
    visibleSections.find((section) => section.id === activeSection) ||
    visibleSections[0];

  const currentArticle =
    currentSection?.articles.find((article) => article.title === openArticle) ||
    currentSection?.articles[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-custom-blue">
                Cargo Konect Support
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                Help Centre
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Navigate platform features, understand terminal berthing data,
                and access guidance designed for users working with maritime intelligence.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, tutorials, and help topics"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-custom-blue"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {HELP_SHORTCUTS.map((item) => (
              <button
                key={item}
                type="button"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm text-slate-700 transition hover:border-custom-blue hover:bg-white"
              >
                <span className="truncate pr-3">{item}</span>
                <FaChevronRight className="text-[10px] text-custom-blue" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[260px_minmax(0,1fr)_280px]">
          {/* Left rail */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm h-fit">
            <div className="mb-3 px-2">
              <h2 className="text-sm font-semibold text-slate-900">Browse topics</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Structured guidance across platform areas.
              </p>
            </div>

            <div className="space-y-1">
              {visibleSections.map((section) => {
                const isActive = currentSection?.id === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(section.id);
                      setOpenArticle(section.articles[0]?.title || "");
                    }}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-custom-blue bg-custom-blue text-white"
                        : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${isActive ? "text-white" : "text-custom-blue"} mt-0.5`}>
                        {section.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{section.title}</p>
                        <p
                          className={`mt-1 text-xs leading-5 ${
                            isActive ? "text-blue-100" : "text-slate-500"
                          }`}
                        >
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Centre content */}
          <main className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Help Centre</span>
                <FaChevronRight className="text-[9px]" />
                <span>{currentSection?.title}</span>
                {currentArticle?.title && (
                  <>
                    <FaChevronRight className="text-[9px]" />
                    <span className="text-slate-700">{currentArticle.title}</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="border-b border-slate-200 p-4 xl:border-b-0 xl:border-r">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Articles in this section
                </h3>

                <div className="space-y-2">
                  {currentSection?.articles.map((article) => {
                    const isOpen = currentArticle?.title === article.title;
                    return (
                      <button
                        key={article.title}
                        type="button"
                        onClick={() => setOpenArticle(article.title)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                          isOpen
                            ? "border-custom-blue bg-blue-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800">
                              {article.title}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                              <span className="rounded-full bg-slate-100 px-2 py-1">
                                {article.type}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaRegClock className="text-[10px]" />
                                {article.readTime}
                              </span>
                            </div>
                          </div>
                          <FaChevronRight className="mt-1 text-[10px] text-custom-blue" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 md:p-6">
                {currentArticle ? (
                  <>
                    <div className="mb-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-custom-blue">
                          {currentArticle.type}
                        </span>
                        <span className="text-xs text-slate-500">{currentArticle.readTime} read</span>
                      </div>

                      <h2 className="text-2xl font-semibold text-slate-900">
                        {currentArticle.title}
                      </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm leading-7 text-slate-700">
                        {currentArticle.content}
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-2 text-sm font-semibold text-slate-900">
                          Recommended next step
                        </h4>
                        <p className="text-sm leading-6 text-slate-600">
                          Review related platform sections and compare information before using it in a live workflow.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-2 text-sm font-semibold text-slate-900">
                          Important note
                        </h4>
                        <p className="text-sm leading-6 text-slate-600">
                          Cargo Konect provides informational visibility and research-led insight. It is not an operational authority source.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-sm text-slate-600">
                      No articles matched your search.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Right rail */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Tutorials
              </h3>
              <div className="space-y-2">
                {HELP_TUTORIALS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm text-slate-700 transition hover:border-custom-blue hover:bg-white"
                  >
                    <span className="pr-3">{item}</span>
                    <FaExternalLinkAlt className="text-[10px] text-custom-blue" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaLifeRing className="text-sm text-custom-blue" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Need support?
                </h3>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Contact support for data issues, page errors, or platform access questions.
              </p>
              <div className="mt-4 rounded-xl bg-custom-blue px-4 py-3 text-sm text-white">
                support@cargokonect.com
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Help Centre notes
              </h3>
              <ul className="space-y-2 text-sm leading-6 text-slate-600">
                <li>Use search to jump to relevant articles.</li>
                <li>Read tutorials before interpreting berth changes.</li>
                <li>Verify critical data with official sources.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;