"""Calculate compound interest from command-line inputs."""

import argparse


def calculate_compound_interest(
    principal: float,
    annual_rate: float,
    compounds_per_year: int,
    years: float,
) -> tuple[float, float]:
    """Return the final balance and interest earned; annual_rate is a percentage."""
    final_amount = principal * (1 + annual_rate / (100 * compounds_per_year)) ** (
        compounds_per_year * years
    )
    return final_amount, final_amount - principal


def main() -> None:
    parser = argparse.ArgumentParser(description="Calculate compound interest.")
    parser.add_argument("--principal", type=float, required=True, help="Starting principal amount")
    parser.add_argument(
        "--annual-rate",
        type=float,
        required=True,
        help="Annual interest rate as a percentage (for example, 5 for 5%%)",
    )
    parser.add_argument(
        "--compounds-per-year",
        type=int,
        required=True,
        help="Number of compounding periods per year",
    )
    parser.add_argument("--years", type=float, required=True, help="Total investment duration in years")
    arguments = parser.parse_args()

    if arguments.principal < 0:
        parser.error("principal must be non-negative")
    if arguments.annual_rate < 0:
        parser.error("annual-rate must be non-negative")
    if arguments.compounds_per_year <= 0:
        parser.error("compounds-per-year must be greater than zero")
    if arguments.years < 0:
        parser.error("years must be non-negative")

    final_amount, interest_earned = calculate_compound_interest(
        arguments.principal,
        arguments.annual_rate,
        arguments.compounds_per_year,
        arguments.years,
    )
    print(f"Final amount: {final_amount:.2f}")
    print(f"Interest earned: {interest_earned:.2f}")


if __name__ == "__main__":
    main()
