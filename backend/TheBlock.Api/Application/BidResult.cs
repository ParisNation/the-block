namespace TheBlock.Api.Application
{
    public class BidResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public decimal? CurrentBid { get; set; }
    }
}