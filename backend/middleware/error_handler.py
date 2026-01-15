from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from backend.core.logger import logger
import traceback

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            # Log the full exception with stack trace
            await logger.error(
                "unhandled_exception",
                error=str(e),
                error_type=type(e).__name__,
                traceback=traceback.format_exc()
            )
            
            # Return standardized error response
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred. Our team has been notified.",
                        "request_id": request.headers.get("X-Request-ID")
                    }
                }
            )
