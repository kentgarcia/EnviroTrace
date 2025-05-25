from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class CORSExceptionMiddleware(BaseHTTPMiddleware):
    """
    Custom middleware to add CORS headers to exception responses
    """
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Create a JSON response for the exception
            error_response = JSONResponse(
                status_code=500,
                content={"detail": str(e)}
            )
            
            # Add CORS headers
            error_response.headers["Access-Control-Allow-Origin"] = "*"
            error_response.headers["Access-Control-Allow-Methods"] = "*"
            error_response.headers["Access-Control-Allow-Headers"] = "*"
            
            return error_response
