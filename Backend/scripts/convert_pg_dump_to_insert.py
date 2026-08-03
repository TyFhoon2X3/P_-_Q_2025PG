from pathlib import Path
import re

SQL_PATH = Path(r"C:\Users\Fhoon_2003\Desktop\PQ 2026.sql")

pattern = re.compile(r"COPY\s+public\.([A-Za-z0-9_]+)\s*\((.*?)\)\s+FROM\s+stdin\s*", re.S)


def quote_value(value: str, column: str) -> str:
    value = value.strip()
    if value in {"", "\\N", "NULL"}:
        return "NULL"

    if column in {"transport_required"}:
        return "true" if value.lower() in {"t", "true", "y", "yes", "1"} else "false"

    if re.fullmatch(r"-?\d+(?:\.\d+)?", value):
        return value

    if column in {
        "booking_id",
        "vehicle_id",
        "status_id",
        "technician_id",
        "message_id",
        "review_id",
        "user_id",
        "quantity",
        "rating",
        "unit_price",
        "cost",
        "service",
        "freight",
    }:
        return value

    return "'" + value.replace("'", "''") + "'"


def convert_block(content: str, match: re.Match[str], start: int) -> tuple[str, int]:
    table = match.group(1)
    cols_block = match.group(2)
    cols = [c.strip() for c in cols_block.split(",") if c.strip()]

    terminator = content.find("\\.", match.end())
    if terminator == -1:
        return match.group(0), len(content)

    body = content[match.end():terminator]
    rows = []
    for raw_line in body.splitlines():
        line = raw_line.rstrip("\r")
        if not line.strip():
            continue
        if line.startswith("--"):
            continue
        parts = line.split("\t")
        if len(parts) != len(cols):
            continue
        row = ", ".join(quote_value(part, col) for part, col in zip(parts, cols))
        rows.append("(" + row + ")")

    if not rows:
        return f"-- no data for public.{table}\n", terminator + 2

    columns_sql = ", ".join(cols)
    values_sql = ",\n".join(rows)
    return (
        f"INSERT INTO public.{table} ({columns_sql}) VALUES\n{values_sql};\n",
        terminator + 2,
    )


def rewrite_file(path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    output = []
    pos = 0
    for match in pattern.finditer(content):
        output.append(content[pos:match.start()])
        block, pos = convert_block(content, match, pos)
        output.append(block)
    output.append(content[pos:])
    rewritten = "".join(output)
    rewritten = rewritten.replace("\n\\.\n", "\n")
    path.write_text(rewritten, encoding="utf-8")


if __name__ == "__main__":
    rewrite_file(SQL_PATH)
    print(f"Rewrote {SQL_PATH}")
    text = SQL_PATH.read_text(encoding="utf-8")
    print("remaining COPY blocks:", text.count("COPY public."))
    print("INSERT statements:", text.count("INSERT INTO public."))
