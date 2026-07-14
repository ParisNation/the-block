namespace TheBlock.Api.Domain
{
    public class Vehicle
    {
        public Guid Id { get; set; }
        public string Vin { get; set; }
        public int Year { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public string Trim { get; set; }
        public string BodyStyle { get; set; }
        public string ExteriorColor { get; set; }
        public string InteriorColor { get; set; }
        public string Engine { get; set; }
        public string Transmission { get; set; }
        public string Drivetrain { get; set; }
        public int OdometerKm { get; set; }
        public string FuelType { get; set; }
        public double ConditionGrade { get; set; }
        public string ConditionReport { get; set; }
        public List<string> DamageNotes { get; set; }
        public string TitleStatus { get; set; }
        public string Province { get; set; }
        public string City { get; set; }
        public DateTime AuctionStart { get; set; }
        public decimal StartingBid { get; set; }
        public decimal? ReservePrice { get; set; }
        public decimal? BuyNowPrice { get; set; }
        public List<string> Images { get; set; }
        public string SellingDealership { get; set; }
        public string Lot { get; set; }
        public decimal? CurrentBid { get; set; }
        public int BidCount { get; set; }
    }
}