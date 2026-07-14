import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getVehicleById, placeBid } from "../api/vehicles";
import type { BidResult, Vehicle } from "../types/vehicle";

function VehicleDetailPage() {
    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    // Vehicle id comes off the route: /vehicles/:id
    const { id } = useParams();

    // Null until the fetch comes back. Drives the loading check below.
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);

    const [bidderName, setBidderName] = useState<string>("");
    const [bidAmount, setBidAmount] = useState<number>(0);

    // Whatever the API said about the last bid attempt.
    const [bidResult, setBidResult] = useState<BidResult | null>(null);

    const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
    const [isBidOpen, setIsBidOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---------------------------------------------------------------------
    // Data loading
    // ---------------------------------------------------------------------

    useEffect(() => {
        if (id) {
            getVehicleById(id).then((data) => setVehicle(data));
        }
    }, [id]);

    // ---------------------------------------------------------------------
    // Bidding
    // ---------------------------------------------------------------------

    async function handleBidSubmit() {
        if (!vehicle) return;
        setIsSubmitting(true);

        const result = await placeBid(vehicle.id, { bidderName, amount: bidAmount });
        setBidResult(result);

        // Only re-pull if the bid landed, so the number on screen is what the
        // server has and not what I typed.
        if (result.success) {
            const updatedVehicle = await getVehicleById(vehicle.id);
            setVehicle(updatedVehicle);
            setIsBidOpen(false);
        }

        setIsSubmitting(false);
    }

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------

    if (!vehicle) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-2 text-openlane-navy">
                {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-lg text-openlane-silver-medium mb-6">{vehicle.trim}</p>

            {/* Index as key is fine, the gallery never reorders */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {vehicle.images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Vehicle photo ${index + 1}`}
                        className="rounded-card-sm object-cover w-full h-40"
                    />
                ))}
            </div>

            {/* Spec sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <span className="font-semibold">Body Style:</span> {vehicle.bodyStyle}
                </div>
                <div>
                    <span className="font-semibold">Engine:</span> {vehicle.engine}
                </div>

                <div>
                    <span className="font-semibold">Transmission:</span> {vehicle.transmission}
                </div>
                <div>
                    <span className="font-semibold">Drivetrain:</span> {vehicle.drivetrain}
                </div>

                <div>
                    <span className="font-semibold">Odometer:</span> {vehicle.odometerKm.toLocaleString()} km
                </div>
                <div>
                    <span className="font-semibold">Condition Grade:</span> {vehicle.conditionGrade}
                </div>

                <div>
                    <span className="font-semibold">Exterior:</span> {vehicle.exteriorColor}
                </div>
                <div>
                    <span className="font-semibold">Interior:</span> {vehicle.interiorColor}
                </div>

                <div>
                    <span className="font-semibold">Fuel Type:</span> {vehicle.fuelType}
                </div>
                <div>
                    {/* Mono so it's readable character by character for a history report */}
                    <span className="font-semibold">VIN:</span>{" "}
                    <span className="font-mono">{vehicle.vin}</span>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-openlane-navy">Condition Report</h2>
                <p className="text-openlane-silver-medium">{vehicle.conditionReport}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-openlane-navy">Damage Notes</h2>
                <ul className="list-disc list-inside text-openlane-silver-medium">
                    {vehicle.damageNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                    ))}
                </ul>
            </div>

            {/* Seller on the left, money on the right. Stacks on mobile. */}
            <div className="border-t pt-6 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                        <p className="text-sm text-openlane-silver-medium">Selling Dealership</p>
                        <p className="font-semibold text-openlane-navy">{vehicle.sellingDealership}</p>
                        <p className="text-sm text-openlane-silver-medium">
                            {vehicle.city}, {vehicle.province} · Lot {vehicle.lot}
                        </p>
                    </div>

                    <div className="sm:text-right">
                        <p className="text-sm text-openlane-silver-medium">
                            {vehicle.currentBid ? "Current Bid" : "Starting Bid"}
                        </p>
                        <p className="text-3xl font-bold text-openlane-blue">
                            ${(vehicle.currentBid ?? vehicle.startingBid).toLocaleString()}
                        </p>
                        <p className="text-sm text-openlane-silver-medium">
                            {vehicle.bidCount === 0
                                ? "No bids yet"
                                : `${vehicle.bidCount} bid${vehicle.bidCount === 1 ? "" : "s"}`}
                        </p>
                    </div>
                </div>

                {/* Reserve status only, never the amount. Real auctions hide the number,
                    showing it lets a buyer snipe the floor. A null reserve means no
                    reserve, so it sells to the highest bidder regardless. */}
                <div className="flex items-center gap-3 flex-wrap">
                    {vehicle.reservePrice === null ? (
                        <span className="bg-openlane-blue-50 text-openlane-blue text-xs font-semibold px-3 py-1 rounded-button">
                            No Reserve
                        </span>
                    ) : (vehicle.currentBid ?? 0) >= vehicle.reservePrice ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-button">
                            Reserve Met
                        </span>
                    ) : (
                        <span className="bg-openlane-silver-light-2 text-openlane-silver-medium text-xs font-semibold px-3 py-1 rounded-button">
                            Reserve Not Met
                        </span>
                    )}

                    {vehicle.titleStatus !== "clean" && (
                        <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-button uppercase">
                            {vehicle.titleStatus} title
                        </span>
                    )}

                    {vehicle.buyNowPrice && (
                        <span className="sm:ml-auto text-sm text-openlane-silver-medium">
                            Buy Now{" "}
                            <span className="font-bold text-openlane-navy">
                                ${vehicle.buyNowPrice.toLocaleString()}
                            </span>
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={() => setIsBidOpen(true)}
                className="mt-6 w-full bg-openlane-blue text-white font-semibold px-8 py-3 rounded-button hover:bg-openlane-navy transition"
            >
                Place a Bid
            </button>

            {/* Outlined, not filled. Bidding is the primary action, this is the
                escape hatch. Only renders when the lot actually has a buy now price. */}
            {vehicle.buyNowPrice && (
                <button
                    onClick={() => setIsBuyNowOpen(true)}
                    className="mt-3 w-full border-2 border-openlane-blue text-openlane-blue font-semibold px-8 py-3 rounded-button hover:bg-openlane-blue-25 transition"
                >
                    Buy Now · ${vehicle.buyNowPrice.toLocaleString()}
                </button>
            )}

            {/* Bid modal */}
            {isBidOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setIsBidOpen(false)}
                >
                    {/* stopPropagation so clicking inside the card doesn't close it */}
                    <div
                        className="bg-white rounded-card-lg p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-semibold text-openlane-navy mb-1">Place a Bid</h2>
                        <p className="text-sm text-openlane-silver-medium mb-4">
                            {vehicle.year} {vehicle.make} {vehicle.model} · Lot {vehicle.lot}
                        </p>
                        <p className="text-sm text-openlane-silver-medium mb-4">
                            Current bid{" "}
                            <span className="font-bold text-openlane-navy">
                                ${(vehicle.currentBid ?? vehicle.startingBid).toLocaleString()}
                            </span>
                        </p>

                        <input
                            type="text"
                            placeholder="Your name"
                            value={bidderName}
                            onChange={(e) => setBidderName(e.target.value)}
                            className="border border-openlane-silver rounded-card-sm px-4 py-3 w-full mb-3 focus:outline-none focus:border-openlane-blue"
                        />

                        {/* A number input can't show a $ or commas, so this is a text input
                            I format myself. Strips everything but digits on the way back
                            into state so bidAmount stays a real number for placeBid. */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-openlane-silver-medium">$</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Bid amount"
                                value={bidAmount ? bidAmount.toLocaleString() : ""}
                                onChange={(e) =>
                                    setBidAmount(Number(e.target.value.replace(/[^0-9]/g, "")))
                                }
                                className="border border-openlane-silver rounded-card-sm pl-8 pr-4 py-3 w-full focus:outline-none focus:border-openlane-blue"
                            />
                        </div>

                        {bidResult && !bidResult.success && (
                            <p className="text-red-600 text-sm mt-3">{bidResult.message}</p>
                        )}

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setIsBidOpen(false)}
                                className="flex-1 border border-openlane-silver text-openlane-navy px-6 py-3 rounded-button"
                            >
                                Cancel
                            </button>
                            {/* Disabled while in flight so a double click can't fire two bids */}
                            <button
                                onClick={handleBidSubmit}
                                disabled={isSubmitting || !bidderName || !bidAmount}
                                className="flex-1 bg-openlane-blue text-white font-semibold px-6 py-3 rounded-button hover:bg-openlane-navy transition disabled:opacity-40"
                            >
                                {isSubmitting ? "Submitting..." : "Confirm Bid"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success modal */}
            {bidResult?.success && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-card-lg p-8 w-full max-w-md text-center">
                        <div className="w-14 h-14 rounded-full bg-openlane-blue-50 text-openlane-blue text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                            ✓
                        </div>
                        <h2 className="text-xl font-semibold text-openlane-navy mb-2">Bid Placed</h2>
                        <p className="text-openlane-silver-medium mb-1">
                            Your bid of{" "}
                            <span className="font-bold text-openlane-navy">
                                ${bidAmount.toLocaleString()}
                            </span>{" "}
                            is in.
                        </p>
                        <p className="text-sm text-openlane-silver-medium mb-6">
                            Current bid is now $
                            {(vehicle.currentBid ?? vehicle.startingBid).toLocaleString()} ·{" "}
                            {vehicle.bidCount} bids
                        </p>
                        <button
                            onClick={() => setBidResult(null)}
                            className="w-full bg-openlane-blue text-white font-semibold px-6 py-3 rounded-button hover:bg-openlane-navy transition"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Buy Now modal. The transaction itself is out of scope, the challenge
                excludes checkout and payments, so this confirms the price and says
                where the boundary is. */}
            {isBuyNowOpen && vehicle.buyNowPrice && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setIsBuyNowOpen(false)}
                >
                    <div
                        className="bg-white rounded-card-lg p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-semibold text-openlane-navy mb-1">
                            Buy Now
                        </h2>
                        <p className="text-sm text-openlane-silver-medium mb-4">
                            {vehicle.year} {vehicle.make} {vehicle.model} · Lot {vehicle.lot}
                        </p>

                        <div className="bg-openlane-blue-25 rounded-card-sm p-4 mb-4 text-center">
                            <p className="text-xs text-openlane-silver-medium">Purchase Price</p>
                            <p className="text-3xl font-bold text-openlane-blue">
                                ${vehicle.buyNowPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-openlane-silver-medium mt-1">
                                Ends the auction immediately
                            </p>
                        </div>

                        <p className="text-sm text-openlane-silver-medium mb-5">
                            Buying now closes this lot at the listed price. Checkout, payment,
                            and transport are handled outside this prototype.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsBuyNowOpen(false)}
                                className="flex-1 border border-openlane-silver text-openlane-navy px-6 py-3 rounded-button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsBuyNowOpen(false)}
                                className="flex-1 bg-openlane-blue text-white font-semibold px-6 py-3 rounded-button hover:bg-openlane-navy transition"
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VehicleDetailPage;