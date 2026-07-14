import type { Vehicle, PlaceBidRequest, BidResult } from "../types/vehicle";

const API_BASE_URL = "http://localhost:5148/api";

export async function getVehicles(): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    const data = await response.json();
    return data;
}

export async function getVehicleById(id: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
    const data = await response.json();
    return data;
}

export async function placeBid(id: string, request: PlaceBidRequest): Promise<BidResult> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}/bid`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
}