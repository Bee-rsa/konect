import PropTypes from "prop-types";
import {
  ChevronDown,
  GripVertical,
  CircleHelp,
  Settings2,
  Save,
  RotateCcw,
  Layers3,
  Plus,
} from "lucide-react";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* =========================
   SCHEMA
========================= */
const filterModels = [
  { label: "Company Name", value: "companyName", type: "text" },
  { label: "City", value: "city", type: "text" },
  { label: "Province", value: "province", type: "text" },

  {
    label: "Zone",
    value: "courierRates.zone",
    type: "enum",
    options: ["local", "regional", "national"],
  },
  {
    label: "Service Level",
    value: "courierRates.serviceLevel",
    type: "enum",
    options: ["economy", "express", "same-day"],
  },
  {
    label: "Vehicle Type",
    value: "truckRates.vehicleType",
    type: "enum",
    options: [
      "bakkie",
      "half-ton",
      "1-ton",
      "4-ton",
      "8-ton",
      "superlink",
      "flatbed",
      "refrigerated",
      "container",
    ],
  },
];

/* =========================
   STYLES
========================= */
const inputBase =
  "h-[22px] border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-md";

const iconButton =
  "flex h-[22px] items-center gap-[3px] rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700";

/* =========================
   ROW
========================= */
const SortableFilterRow = ({
  id,
  label,
  shortValue,
  longValue,
  onLabelChange,
  onShortChange,
  onLongChange,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const selectedField = filterModels.find((f) => f.value === label);

  const style = {
    transform: CSS.Transform.toString({
      x: 0,
      y: transform?.y || 0,
      scaleX: 1,
      scaleY: 1,
    }),
    transition,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-md px-[2px] py-[2px] ${
        isDragging ? "bg-white" : ""
      }`}
    >
      {/* DRAG */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-[22px] w-[18px] cursor-grab items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400"
      >
        <GripVertical size={11} />
      </button>

      {/* FIELD DROPDOWN */}
      <div className="relative w-[160px] overflow-visible">
        <select
          value={label}
          onChange={(e) => {
            const newVal = e.target.value;

            onLabelChange(newVal);
            onShortChange("");
            onLongChange("");
          }}
          className={`${inputBase} w-full appearance-none pr-6`}
        >
          <option value="">Select field</option>
          {filterModels.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>

      {/* SECOND COLUMN (ENUM OR TEXT) */}
      <div className="relative w-[120px] overflow-visible">
        {selectedField?.type === "enum" ? (
          <>
            <select
              value={shortValue}
              onChange={(e) => onShortChange(e.target.value)}
              className={`${inputBase} w-full appearance-none pr-6`}
            >
              <option value="">Select</option>
              {selectedField.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </>
        ) : (
          <input
            type="text"
            value={shortValue}
            onChange={(e) => onShortChange(e.target.value)}
            className={`${inputBase} w-full`}
          />
        )}
      </div>

      {/* THIRD COLUMN */}
      <input
        type="text"
        value={longValue}
        onChange={(e) => onLongChange(e.target.value)}
        className={`${inputBase} w-[260px]`}
      />

      {/* REMOVE */}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-[20px] w-[24px] items-center justify-center rounded-md border border-slate-200 bg-white text-[12px] text-slate-400"
      >
        −
      </button>
    </div>
  );
};

/* =========================
   MAIN FILTER
========================= */
const Filter = ({
  rows = [],
  setRows,
  onShortChange,
  onLongChange,
  onRemove,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);

    setRows((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        label: "",
        shortValue: "",
        longValue: "",
      },
    ]);
  };

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-[8px] py-[10px]">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={rows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-[4px]">
            {rows.map((row) => (
              <SortableFilterRow
                key={row.id}
                id={row.id}
                label={row.label}
                shortValue={row.shortValue}
                longValue={row.longValue}
                onLabelChange={(val) =>
                  setRows((prev) =>
                    prev.map((r) =>
                      r.id === row.id ? { ...r, label: val } : r
                    )
                  )
                }
                onShortChange={(val) => onShortChange(row.id, val)}
                onLongChange={(val) => onLongChange(row.id, val)}
                onRemove={() => onRemove(row.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* FOOTER */}
      <div className="mt-[10px] flex justify-between border-t border-slate-200 pt-[6px]">
        <div className="flex gap-[5px]">
          <button className={iconButton}>
            <CircleHelp size={11} /> Help
          </button>
          <button className={iconButton}>
            <Settings2 size={11} /> Manage
          </button>
          <button className={iconButton}>
            <Save size={11} /> Save
          </button>
        </div>

        <div className="flex gap-[5px]">
          <button className={iconButton}>
            <RotateCcw size={11} /> Reset
          </button>

          <button className={iconButton}>
            <Layers3 size={11} /> Group
          </button>

          <button
            onClick={handleAddRow}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-md border border-slate-200 bg-white"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   PROPS
========================= */
SortableFilterRow.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  shortValue: PropTypes.string.isRequired,
  longValue: PropTypes.string.isRequired,
  onLabelChange: PropTypes.func.isRequired,
  onShortChange: PropTypes.func.isRequired,
  onLongChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

Filter.propTypes = {
  rows: PropTypes.array,
  setRows: PropTypes.func.isRequired,
  onShortChange: PropTypes.func.isRequired,
  onLongChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default Filter;