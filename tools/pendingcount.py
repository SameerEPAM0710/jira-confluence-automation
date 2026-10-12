"""Count tickets whose status is not exactly Done."""

import argparse


def main() -> None:
    parser = argparse.ArgumentParser(description="Count tickets not marked Done.")
    parser.add_argument(
        "statuses",
        nargs="+",
        help="One status per ticket; quote statuses containing spaces",
    )
    arguments = parser.parse_args()

    pending_count = sum(status != "Done" for status in arguments.statuses)
    print(f"Pending ticket count: {pending_count}")


if __name__ == "__main__":
    main()
