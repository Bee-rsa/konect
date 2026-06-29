import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    navigate(`/search?q=${searchTerm}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={handleSearchToggle}
        className="flex items-center justify-center p-2 text-white hover:text-custom-sage transition"
      >
        <HiMagnifyingGlass className="h-5 w-5" />
      </button>

      {/* Search Input */}
      {isOpen && (
        <form
          onSubmit={handleSearch}
          className="absolute right-0 mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-2"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="outline-none px-2 py-1 text-sm text-gray-700 placeholder-gray-400 w-40"
          />

          <button
            type="submit"
            className="px-3 py-1 text-sm text-white bg-custom-sage rounded-md hover:opacity-90 transition"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
};

export default SearchBar;