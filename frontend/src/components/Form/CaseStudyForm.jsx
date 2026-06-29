import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  ImagePlus,
  LayoutTemplate,
  Globe2,
  BookOpen,
  FileText,
  Sparkles,
  ChevronRight,
  Trash2,
  Type,
  RefreshCcw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCaseStudy,
  resetCaseStudyState,
} from "../../redux/slices/caseStudySlice";

const categoryOptions = [
  "Port Operations",
  "Maritime Trade",
  "Supply Chain",
  "Logistics Strategy",
  "Terminal Performance",
  "Infrastructure",
  "Shipping Innovation",
  "Regional Development",
];

const regionOptions = [
  "South Africa",
  "SADC Region",
  "East Africa",
  "West Africa",
  "North Africa",
  "Europe",
  "Asia",
  "Middle East",
  "Global",
];

const designTemplates = [
  {
    id: "editorial",
    name: "Editorial",
    description: "Clean, research-driven layout.",
  },
  {
    id: "insight",
    name: "Insight Panel",
    description: "Modern layout with key takeaways.",
  },
  {
    id: "report",
    name: "Executive Report",
    description: "Formal report-style presentation.",
  },
];

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const textareaClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none";

const sectionCard =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(15,23,42,0.04)]";

const labelClass = "text-sm font-medium text-slate-700";

const createSection = (number) => ({
  id: Date.now() + Math.random(),
  label: `Section ${number}`,
  content: "",
  image: "",
  preview: "",
  caption: "",
  hasImage: false,
});

const createInitialFormData = () => ({
  title: "",
  subtitle: "",
  description: "",
  author: "",
  publishDate: "",
  category: "",
  region: "",
  readingTime: "",
  featuredImage: "",
  featuredImagePreview: "",
  designTemplate: "editorial",
  tags: "",
  sections: [createSection(1)],
  settings: {
    featured: false,
    published: false,
    showAuthor: true,
    showRegion: true,
    allowHighlights: true,
  },
});

const CaseStudyForm = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.caseStudies);

  const [formData, setFormData] = useState(createInitialFormData());

  useEffect(() => {
    if (success) {
      setFormData(createInitialFormData());
      dispatch(resetCaseStudyState());
    }
  }, [success, dispatch]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSetting = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        featuredImage: reader.result,
        featuredImagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const addTextBlock = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, createSection(prev.sections.length + 1)],
    }));
  };

  const addImageToLatestSection = () => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const targetIndex = sections.findIndex((section) => !section.hasImage);

      if (targetIndex === -1) {
        sections.push({
          ...createSection(sections.length + 1),
          hasImage: true,
        });
      } else {
        sections[targetIndex] = {
          ...sections[targetIndex],
          hasImage: true,
        };
      }

      return {
        ...prev,
        sections,
      };
    });
  };

  const removeSection = (id) => {
    setFormData((prev) => {
      const updatedSections = prev.sections.filter((section) => section.id !== id);

      const relabelled =
        updatedSections.length > 0
          ? updatedSections.map((section, index) => ({
              ...section,
              label: `Section ${index + 1}`,
            }))
          : [createSection(1)];

      return {
        ...prev,
        sections: relabelled,
      };
    });
  };

  const moveSection = (index, direction) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= updated.length) return prev;

      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];

      return {
        ...prev,
        sections: updated.map((section, idx) => ({
          ...section,
          label: `Section ${idx + 1}`,
        })),
      };
    });
  };

  const updateSectionField = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      ),
    }));
  };

  const handleSectionImageChange = (e, id) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === id
            ? {
                ...section,
                image: reader.result,
                preview: reader.result,
                hasImage: true,
              }
            : section
        ),
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeSectionImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              image: "",
              preview: "",
              caption: "",
              hasImage: false,
            }
          : section
      ),
    }));
  };

  const imageNumberMap = useMemo(() => {
    let imageCounter = 0;
    const map = {};

    formData.sections.forEach((section) => {
      if (section.hasImage) {
        imageCounter += 1;
        map[section.id] = imageCounter;
      }
    });

    return map;
  }, [formData.sections]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      sections: formData.sections.map((section) => ({
        label: section.label,
        content: section.content,
        image: section.image,
        caption: section.caption,
      })),
    };

    dispatch(createCaseStudy(payload));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-6xl p-4 md:p-6"
    >
      <div className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-[0_10px_40px_rgb(15,23,42,0.06)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <Sparkles size={14} />
            Publishing Studio
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Create Case Study
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create and publish structured case studies for your platform.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className={sectionCard}>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">Core Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  className={textareaClass}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Author</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.author}
                  onChange={(e) => updateField("author", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Publish Date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.publishDate}
                  onChange={(e) => updateField("publishDate", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Region</label>
                <select
                  className={inputClass}
                  value={formData.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  required
                >
                  <option value="">Select region</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Reading Time</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.readingTime}
                  onChange={(e) => updateField("readingTime", e.target.value)}
                  placeholder="e.g. 6 min read"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Tags</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="port operations, terminal efficiency, logistics"
                  value={formData.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <div className="mb-4 flex items-center gap-2">
              <ImagePlus size={18} className="text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">
                Thumbnail / Featured Image
              </h2>
            </div>

            <input
              id="featuredImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFeaturedImageChange}
            />

            <label
              htmlFor="featuredImage"
              className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-100"
            >
              <Upload size={20} className="mb-2 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                Upload thumbnail image
              </span>
              <span className="mt-1 text-xs text-slate-500">
                This will be used as the main preview image
              </span>
            </label>

            {formData.featuredImagePreview && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={formData.featuredImagePreview}
                  alt="Thumbnail preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className={sectionCard}>
            <div className="mb-4 flex items-center gap-2">
              <LayoutTemplate size={18} className="text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">Post Design</h2>
            </div>

            <div className="space-y-3">
              {designTemplates.map((template) => {
                const active = formData.designTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => updateField("designTemplate", template.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{template.name}</p>
                        <p className={`mt-1 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {template.description}
                        </p>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={sectionCard}>
            <div className="mb-4 flex items-center gap-2">
              <Globe2 size={18} className="text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">Display Settings</h2>
            </div>

            <div className="space-y-3">
              {[
                ["featured", "Mark as featured"],
                ["published", "Publish immediately"],
                ["showAuthor", "Show author"],
                ["showRegion", "Show region"],
                ["allowHighlights", "Enable highlights"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <span className="text-sm text-slate-700">{label}</span>
                  <input
                    type="checkbox"
                    checked={formData.settings[key]}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    className="h-4 w-4 accent-slate-900"
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Case Study"}
          </button>
        </div>

        <div className="xl:col-span-12">
          <div className={sectionCard}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-700" />
                <h2 className="text-base font-semibold text-slate-900">
                  Dynamic Article Builder
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addTextBlock}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Type size={16} />
                  Add Text
                </button>

                <button
                  type="button"
                  onClick={addImageToLatestSection}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ImagePlus size={16} />
                  Add Image
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {formData.sections.map((section, index) => {
                const imageNumber = imageNumberMap[section.id];

                return (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {section.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {section.hasImage ? "Text and image unit" : "Text content block"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveSection(index, -1)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-white"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(index, 1)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-white"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(section.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>

                    {!section.hasImage ? (
                      <div>
                        <label className={labelClass}>Text</label>
                        <textarea
                          rows={6}
                          className={textareaClass}
                          value={section.content}
                          onChange={(e) =>
                            updateSectionField(section.id, "content", e.target.value)
                          }
                          placeholder="Write this section here..."
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                        <div className="xl:col-span-3">
                          <label className={labelClass}>Text</label>
                          <textarea
                            rows={10}
                            className={textareaClass}
                            value={section.content}
                            onChange={(e) =>
                              updateSectionField(section.id, "content", e.target.value)
                            }
                            placeholder="Write this section here..."
                          />
                        </div>

                        <div className="xl:col-span-2">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  Image {imageNumber}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Attached to {section.label}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                {section.preview && (
                                  <label
                                    htmlFor={`section-image-${section.id}`}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                  >
                                    <RefreshCcw size={13} />
                                    Replace
                                  </label>
                                )}

                                <button
                                  type="button"
                                  onClick={() => removeSectionImage(section.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            </div>

                            <input
                              id={`section-image-${section.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSectionImageChange(e, section.id)}
                            />

                            {!section.preview ? (
                              <label
                                htmlFor={`section-image-${section.id}`}
                                className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-100"
                              >
                                <Upload size={20} className="mb-2 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">
                                  Upload Image {imageNumber}
                                </span>
                              </label>
                            ) : (
                              <div className="overflow-hidden rounded-2xl border border-slate-200">
                                <img
                                  src={section.preview}
                                  alt={`Image ${imageNumber}`}
                                  className="h-56 w-full object-cover"
                                />
                              </div>
                            )}

                            <div className="mt-3">
                              <label className={labelClass}>Caption</label>
                              <input
                                type="text"
                                className={inputClass}
                                value={section.caption}
                                onChange={(e) =>
                                  updateSectionField(section.id, "caption", e.target.value)
                                }
                                placeholder="Optional caption"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CaseStudyForm;