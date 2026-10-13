# Module 12 Completion Report

## Instruction File
- Filename: use-pendingcount.agent.md

```markdown
- Use `tools/pendingcount.py` when the user needs the total number of tickets whose status is not exactly `Done`.
- Run it from the project root with one positional argument per ticket, for example: `python tools/pendingcount.py Done Done "In Progress" "To Do"`.
- Quote each status containing spaces so it is passed as one argument.
- The script counts all supplied values except case-sensitive `Done`; values such as `done` or `DONE` count as pending.
- Report the output as `Pending ticket count: <count>` and do not infer statuses for tickets that were not supplied.
```

## Script File
- Filename: pendingcount.py
- Language: Python

```python
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
```

## Script Execution Output

```text
usage: pendingcount.py [-h] statuses [statuses ...]

Count tickets not marked Done.

positional arguments:
  statuses    One status per ticket; quote statuses containing spaces

options:
  -h, --help  show this help message and exit
```
