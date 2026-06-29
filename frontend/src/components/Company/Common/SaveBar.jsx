import PropTypes from "prop-types";

/* =========================
   SAVE BAR (FULL WIDTH)
========================= */
export default function SaveBar({
  onSave,
  onSaveClose,
  onCancel,
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-300 border-t border-slate-400 shadow-md px-4 py-2 flex items-center justify-end gap-2 z-50">

      <button
        onClick={onSave}
        className="px-3 py-1 rounded-sm bg-white border border-slate-400 text-[11px] hover:bg-slate-100"
      >
        Save
      </button>

      <button
        onClick={onSaveClose}
        className="px-3 py-1 rounded-sm bg-white border border-slate-400 text-[11px] hover:bg-slate-100"
      >
        Save &amp; Close
      </button>

      <button
        onClick={onCancel}
        className="px-3 py-1 rounded-sm bg-white border border-slate-400 text-[11px] hover:bg-slate-100"
      >
        Cancel
      </button>

    </div>
  );
}

/* =========================
   PROPS
========================= */
SaveBar.propTypes = {
  onSave: PropTypes.func,
  onSaveClose: PropTypes.func,
  onCancel: PropTypes.func,
};