"""Upload router: handles file upload, AI analysis, and email delivery."""

import logging
from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import EmailStr
from app.middleware.security import verify_api_key, validate_file, validate_file_size
from app.services.parser import parse_file
from app.services.ai_engine import generate_summary
from app.services.email_service import send_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Sales Analysis"])


@router.post(
    "/analyze",
    summary="Analyze Sales Data & Email Report",
    description=(
        "Upload a `.csv` or `.xlsx` sales data file along with a recipient email. "
        "The system will parse the data, generate an AI-powered executive summary "
        "using Google Gemini, and send the report to the specified email address."
    ),
    response_description="Analysis result with summary preview.",
)
async def analyze_sales_data(
    file: UploadFile = File(
        ..., description="Sales data file (.csv or .xlsx, max 10 MB)"
    ),
    email: str = Form(..., description="Recipient email address for the report"),
    api_key: str = Depends(verify_api_key),
):
    """
    **End-to-end sales analysis pipeline:**

    1. Validates the uploaded file (type, size)
    2. Parses the data into structured insights
    3. Sends data to Google Gemini for AI-powered narrative summary
    4. Emails the professional report to the recipient
    5. Returns a preview of the generated summary
    """
    # Validate email format
    try:
        EmailStr._validate(email)
    except Exception:
        return {"success": False, "error": "Invalid email address format"}

    # Validate file type
    validate_file(file)

    # Read and validate file size
    contents = await validate_file_size(file)

    logger.info(f"Processing file: {file.filename} for {email}")

    try:
        # Step 1: Parse the data
        data_summary = parse_file(contents, file.filename)
        logger.info(f"Parsed {data_summary['total_rows']} rows from {file.filename}")

        # Step 2: Generate AI summary
        ai_summary = generate_summary(data_summary)
        logger.info("AI summary generated successfully")

        # Step 3: Send email
        send_email(email, ai_summary, file.filename)
        logger.info(f"Report emailed to {email}")

        return {
            "success": True,
            "message": f"Report generated and sent to {email}",
            "filename": file.filename,
            "rows_analyzed": data_summary["total_rows"],
            "columns": data_summary["columns"],
            "summary_preview": ai_summary[:500] + "..."
            if len(ai_summary) > 500
            else ai_summary,
        }

    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"Processing error: {e}")
        return {
            "success": False,
            "error": f"An error occurred while processing: {str(e)}",
        }
