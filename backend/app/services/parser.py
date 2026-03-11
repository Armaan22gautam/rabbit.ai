"""Data parser service: reads CSV/XLSX files and produces structured summaries."""

import io
import pandas as pd


def parse_file(contents: bytes, filename: str) -> dict:
    """Parse uploaded file into a structured data summary for the AI engine.
    
    Args:
        contents: Raw file bytes.
        filename: Original filename (used for extension detection).
    
    Returns:
        Dictionary with parsed data summary.
    """
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "csv":
        df = pd.read_csv(io.BytesIO(contents))
    elif ext == "xlsx":
        df = pd.read_excel(io.BytesIO(contents), engine="openpyxl")
    else:
        raise ValueError(f"Unsupported file extension: .{ext}")

    # Build a comprehensive summary for the AI
    summary = {
        "filename": filename,
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": list(df.columns),
        "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "sample_rows": df.head(10).to_dict(orient="records"),
        "statistics": {},
        "null_counts": df.isnull().sum().to_dict(),
    }

    # Numeric statistics
    numeric_cols = df.select_dtypes(include=["number"]).columns
    if len(numeric_cols) > 0:
        stats = df[numeric_cols].describe().to_dict()
        summary["statistics"]["numeric"] = {
            col: {k: round(v, 2) for k, v in stat.items()}
            for col, stat in stats.items()
        }

    # Categorical breakdowns
    cat_cols = df.select_dtypes(include=["object"]).columns
    for col in cat_cols:
        if df[col].nunique() <= 20:
            summary["statistics"][col] = df[col].value_counts().to_dict()

    # Revenue/aggregation insights
    if "Revenue" in df.columns:
        summary["total_revenue"] = round(float(df["Revenue"].sum()), 2)
    if "Units_Sold" in df.columns:
        summary["total_units_sold"] = int(df["Units_Sold"].sum())

    return summary
