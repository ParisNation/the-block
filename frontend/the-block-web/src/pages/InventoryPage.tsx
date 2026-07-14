import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getVehicles } from "../api/vehicles";
import type { Vehicle } from "../types/vehicle";

function InventoryPage() {
    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [searchTerm, setSearchTerm] = useState<string>("");

    // Dropdown filters. These cascade off each other.
    const [selectedMake, setSelectedMake] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedBodyStyle, setSelectedBodyStyle] = useState<string>("");
    const [selectedEngine, setSelectedEngine] = useState<string>("");
    const [selectedTrim, setSelectedTrim] = useState<string>("");
    const [selectedProvince, setSelectedProvince] = useState<string>("");

    // Boolean toggle, not a facet. Deliberately kept out of the cascade below.
    const [buyNowOnly, setBuyNowOnly] = useState<boolean>(false);

    // Strings so the number inputs stay controlled.
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [minYear, setMinYear] = useState<string>("");
    const [maxYear, setMaxYear] = useState<string>("");

    // ---------------------------------------------------------------------
    // Data loading
    // ---------------------------------------------------------------------

    useEffect(() => {
        getVehicles().then((data) => setVehicles(data));
    }, []);

    // ---------------------------------------------------------------------
    // Filtering
    // ---------------------------------------------------------------------

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesSearch = `${vehicle.make} ${vehicle.model} ${vehicle.year}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        // Empty selection means no filter on that field.
        const matchesMake = !selectedMake || vehicle.make === selectedMake;
        const matchesModel = !selectedModel || vehicle.model === selectedModel;
        const matchesBodyStyle = !selectedBodyStyle || vehicle.bodyStyle === selectedBodyStyle;
        const matchesEngine = !selectedEngine || vehicle.engine === selectedEngine;
        const matchesTrim = !selectedTrim || vehicle.trim === selectedTrim;
        const matchesProvince = !selectedProvince || vehicle.province === selectedProvince;

        const matchesBuyNow = !buyNowOnly || Boolean(vehicle.buyNowPrice);

        // Price is the current bid if there is one, otherwise the starting bid.
        const price = vehicle.currentBid ?? vehicle.startingBid;
        const matchesMinPrice = !minPrice || price >= Number(minPrice);
        const matchesMaxPrice = !maxPrice || price <= Number(maxPrice);

        const matchesMinYear = !minYear || vehicle.year >= Number(minYear);
        const matchesMaxYear = !maxYear || vehicle.year <= Number(maxYear);

        return (
            matchesSearch &&
            matchesMake &&
            matchesModel &&
            matchesBodyStyle &&
            matchesEngine &&
            matchesTrim &&
            matchesProvince &&
            matchesBuyNow &&
            matchesMinPrice &&
            matchesMaxPrice &&
            matchesMinYear &&
            matchesMaxYear
        );
    });

    // ---------------------------------------------------------------------
    // Filter controls
    // ---------------------------------------------------------------------

    const hasActiveFilters =
        searchTerm ||
        selectedMake ||
        selectedModel ||
        selectedBodyStyle ||
        selectedEngine ||
        selectedTrim ||
        selectedProvince ||
        buyNowOnly ||
        minPrice ||
        maxPrice ||
        minYear ||
        maxYear;

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedMake("");
        setSelectedModel("");
        setSelectedBodyStyle("");
        setSelectedEngine("");
        setSelectedTrim("");
        setSelectedProvince("");
        setBuyNowOnly(false);
        setMinPrice("");
        setMaxPrice("");
        setMinYear("");
        setMaxYear("");
    };

    // ---------------------------------------------------------------------
    // Cascading dropdown options
    // ---------------------------------------------------------------------

    // Skips one field on purpose so each dropdown can build its option list from
    // vehicles matching every other active selection. Pick a Make and the Model
    // list narrows, but the Make list doesn't collapse to just the one I picked.
    const vehiclesMatchingExcept = (excludeField: string) => {
        return vehicles.filter((v) => {
            if (excludeField !== "make" && selectedMake && v.make !== selectedMake) return false;
            if (excludeField !== "model" && selectedModel && v.model !== selectedModel) return false;
            if (excludeField !== "bodyStyle" && selectedBodyStyle && v.bodyStyle !== selectedBodyStyle) return false;
            if (excludeField !== "engine" && selectedEngine && v.engine !== selectedEngine) return false;
            if (excludeField !== "trim" && selectedTrim && v.trim !== selectedTrim) return false;
            if (excludeField !== "province" && selectedProvince && v.province !== selectedProvince) return false;
            return true;
        });
    };

    // Set strips the duplicates.
    const uniqueMakes = [...new Set(vehiclesMatchingExcept("make").map((v) => v.make))];
    const availableModels = [...new Set(vehiclesMatchingExcept("model").map((v) => v.model))];
    const availableBodyStyles = [...new Set(vehiclesMatchingExcept("bodyStyle").map((v) => v.bodyStyle))];
    const availableEngines = [...new Set(vehiclesMatchingExcept("engine").map((v) => v.engine))];
    const availableTrims = [...new Set(vehiclesMatchingExcept("trim").map((v) => v.trim))];
    const availableProvinces = [...new Set(vehiclesMatchingExcept("province").map((v) => v.province))];

    // Grade is the first thing a buyer looks at, so it gets its own color scale.
    const gradeColor = (grade: number) =>
        grade >= 4 ? "bg-green-600"
        : grade >= 3 ? "bg-openlane-blue"
        : grade >= 2 ? "bg-amber-500"
        : "bg-red-600";

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-openlane-silver rounded-card-sm px-4 py-3 w-full mb-6 focus:outline-none focus:border-openlane-blue focus:ring-2 focus:ring-openlane-blue-100"
            />

            {/* Filters stack above the grid on mobile, sit beside it from md up */}
            <div className="flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-64 flex-shrink-0 space-y-3">
                    <select
                        value={selectedMake}
                        onChange={(e) => setSelectedMake(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    >
                        <option value="">All Makes</option>
                        {uniqueMakes.map((make) => (
                            <option key={make} value={make}>
                                {make}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    >
                        <option value="">All Models</option>
                        {availableModels.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedBodyStyle}
                        onChange={(e) => setSelectedBodyStyle(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    >
                        <option value="">All Body Styles</option>
                        {availableBodyStyles.map((bodyStyle) => (
                            <option key={bodyStyle} value={bodyStyle}>
                                {bodyStyle}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedEngine}
                        onChange={(e) => setSelectedEngine(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    >
                        <option value="">All Engines</option>
                        {availableEngines.map((engine) => (
                            <option key={engine} value={engine}>
                                {engine}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedTrim}
                        onChange={(e) => setSelectedTrim(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    >
                        <option value="">All Trim Levels</option>
                        {availableTrims.map((trim) => (
                            <option key={trim} value={trim}>
                                {trim}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    >
                        <option value="">All Provinces</option>
                        {availableProvinces.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    {/* Price range */}
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    />

                    <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    />

                    {/* Year range */}
                    <input
                        type="number"
                        placeholder="Min Year"
                        value={minYear}
                        onChange={(e) => setMinYear(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    />

                    <input
                        type="number"
                        placeholder="Max Year"
                        value={maxYear}
                        onChange={(e) => setMaxYear(e.target.value)}
                        className="border border-openlane-silver rounded-card-sm px-3 py-2 w-full bg-white focus:outline-none focus:border-openlane-blue"
                    />

                    <label className="flex items-center gap-2 text-sm text-openlane-navy px-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={buyNowOnly}
                            onChange={(e) => setBuyNowOnly(e.target.checked)}
                            className="accent-openlane-blue w-4 h-4"
                        />
                        Buy Now available
                    </label>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="w-full border border-openlane-silver text-openlane-navy text-sm font-semibold px-4 py-2 rounded-button hover:bg-openlane-blue-25 transition"
                        >
                            Clear All Filters
                        </button>
                    )}
                </aside>

                {/* Results grid */}
                <div className="flex-1">
                    {/* filteredVehicles recalculates on every render, so the count
                        updates the moment a filter changes. No extra state. */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-6">
                        <h1 className="text-3xl font-bold text-openlane-navy">Inventory</h1>
                        <p className="text-sm text-openlane-silver-medium">
                            Showing {filteredVehicles.length} of {vehicles.length} vehicles
                        </p>
                    </div>

                    {filteredVehicles.length === 0 ? (
                        <p className="text-openlane-silver-medium">
                            No vehicles match your current filters.
                        </p>
                    ) : (
                        // One card per row on phones, two on laptops, three on wide screens.
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredVehicles.map((vehicle) => (
                                <Link
                                    key={vehicle.id}
                                    to={`/vehicles/${vehicle.id}`}
                                    className="group block border border-openlane-silver-light-2 rounded-card-lg overflow-hidden bg-white hover:shadow-lg hover:border-openlane-blue-200 transition"
                                >
                                    <div className="relative aspect-video bg-openlane-silver-light-2 overflow-hidden">
                                        <img
                                            src={vehicle.images[0]}
                                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        />

                                        <span className={`absolute top-3 left-3 ${gradeColor(vehicle.conditionGrade)} text-white text-xs font-semibold px-3 py-1 rounded-button`}>
                                            Grade {vehicle.conditionGrade}
                                        </span>

                                        {/* Only flag non-clean titles. Clean is the default. */}
                                        {vehicle.titleStatus !== "clean" && (
                                            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-button uppercase tracking-wide">
                                                {vehicle.titleStatus}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <p className="font-semibold text-lg leading-tight">
                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                        </p>
                                        <p className="text-sm text-openlane-silver-medium mb-3">
                                            {vehicle.trim}
                                        </p>

                                        {/* Enough spec to qualify or disqualify a lot at a glance.
                                            Full sheet is on the detail page. */}
                                        <div className="flex flex-wrap gap-2 mb-4 text-xs text-openlane-silver-medium">
                                            <span className="border border-openlane-silver-light-2 bg-openlane-blue-25 text-openlane-silver-dark rounded-button px-3 py-1">
                                                {vehicle.odometerKm.toLocaleString()} km
                                            </span>
                                            <span className="border border-openlane-silver-light-2 bg-openlane-blue-25 text-openlane-silver-dark rounded-button px-3 py-1">
                                                {vehicle.engine}
                                            </span>
                                            <span className="border border-openlane-silver-light-2 bg-openlane-blue-25 text-openlane-silver-dark rounded-button px-3 py-1">
                                                {vehicle.transmission}
                                            </span>
                                            <span className="border border-openlane-silver-light-2 bg-openlane-blue-25 text-openlane-silver-dark rounded-button px-3 py-1">
                                                {vehicle.drivetrain}
                                            </span>
                                        </div>

                                        {/* Money on the left, seller on the right */}
                                        <div className="flex items-end justify-between border-t pt-3">
                                            <div>
                                                <p className="text-xs text-openlane-silver-medium">
                                                    {vehicle.currentBid
                                                        ? "Current Bid"
                                                        : "Starting Bid"}
                                                </p>
                                                <p className="text-xl font-bold text-openlane-navy">
                                                    $
                                                    {(
                                                        vehicle.currentBid ??
                                                        vehicle.startingBid
                                                    ).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-openlane-silver-medium">
                                                    {vehicle.bidCount === 0
                                                        ? "No bids yet"
                                                        : `${vehicle.bidCount} bid${vehicle.bidCount === 1 ? "" : "s"}`}
                                                </p>
                                                {vehicle.buyNowPrice && (
                                                    <p className="text-xs font-semibold text-openlane-blue">
                                                        Buy Now ${vehicle.buyNowPrice.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right text-xs text-openlane-silver-medium max-w-[50%]">
                                                <p className="truncate">{vehicle.sellingDealership}</p>
                                                <p>{vehicle.city}, {vehicle.province}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InventoryPage;