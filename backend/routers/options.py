from fastapi import APIRouter
from backend.providers.os_catalog import get_os_list_by_type

router = APIRouter(prefix="/options", tags=["options"])

@router.get("/os")
async def get_os_options(type: str = "windows"):
    """Get available OS versions for a given type (windows/linux)"""
    return get_os_list_by_type(type)
