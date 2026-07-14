using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheBlock.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Vin = table.Column<string>(type: "text", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Make = table.Column<string>(type: "text", nullable: false),
                    Model = table.Column<string>(type: "text", nullable: false),
                    Trim = table.Column<string>(type: "text", nullable: false),
                    BodyStyle = table.Column<string>(type: "text", nullable: false),
                    ExteriorColor = table.Column<string>(type: "text", nullable: false),
                    InteriorColor = table.Column<string>(type: "text", nullable: false),
                    Engine = table.Column<string>(type: "text", nullable: false),
                    Transmission = table.Column<string>(type: "text", nullable: false),
                    Drivetrain = table.Column<string>(type: "text", nullable: false),
                    OdometerKm = table.Column<int>(type: "integer", nullable: false),
                    FuelType = table.Column<string>(type: "text", nullable: false),
                    ConditionGrade = table.Column<double>(type: "double precision", nullable: false),
                    ConditionReport = table.Column<string>(type: "text", nullable: false),
                    DamageNotes = table.Column<List<string>>(type: "text[]", nullable: false),
                    TitleStatus = table.Column<string>(type: "text", nullable: false),
                    Province = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    AuctionStart = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    StartingBid = table.Column<decimal>(type: "numeric", nullable: false),
                    ReservePrice = table.Column<decimal>(type: "numeric", nullable: true),
                    BuyNowPrice = table.Column<decimal>(type: "numeric", nullable: true),
                    Images = table.Column<List<string>>(type: "text[]", nullable: false),
                    SellingDealership = table.Column<string>(type: "text", nullable: false),
                    Lot = table.Column<string>(type: "text", nullable: false),
                    CurrentBid = table.Column<decimal>(type: "numeric", nullable: true),
                    BidCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Vehicles");
        }
    }
}
