"""Count tickets by their supplied status values."""

import argparse
from collections import Counter


def main() -> None:
    parser = argparse.ArgumentParser(description="Count tickets for each supplied status.")
    parser.add_argument(
        "statuses",
        nargs="+",
        help="One status per ticket; quote statuses containing spaces",
    )
    arguments = parser.parse_args()

    for status, count in Counter(arguments.statuses).items():
        print(f"{status}: {count}")


if __name__ == "__main__":
    main()
