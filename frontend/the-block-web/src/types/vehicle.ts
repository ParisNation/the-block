export interface Vehicle {
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    bodyStyle: string;
    exteriorColor: string;
    interiorColor: string;
    engine: string;
    transmission: string;
    drivetrain: string;
    odometerKm: number;
    fuelType: string;
    conditionGrade: number;
    conditionReport: string;
    damageNotes: string[];
    titleStatus: string;
    province: string;
    city: string;
    auctionStart: string;
    startingBid: number;
    reservePrice: number | null;
    buyNowPrice: number | null;
    images: string[];
    sellingDealership: string;
    lot: string;
    currentBid: number | null;
    bidCount: number
}


export interface PlaceBidRequest {
    bidderName: string;
    amount: number;
}

export interface BidResult {
    success: boolean;
    message: string;
    currentBid: number | null;
}