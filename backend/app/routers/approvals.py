from fastapi import APIRouter, Depends
from typing import Annotated
from app.dependencies import require_any_approver
from app.models.user import User

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("/pending", summary="Get requests pending my approval")
async def get_pending(approver: Annotated[User, Depends(require_any_approver)]):
    # TODO: filter requests by current approver's role in the workflow
    return {"message": "Pending approvals — coming soon"}


@router.post("/{request_id}/decide", summary="Approve / Reject / Query a request")
async def decide(request_id: str, approver: Annotated[User, Depends(require_any_approver)]):
    # TODO: record decision, advance workflow, send notifications
    return {"message": f"Decision on {request_id} — coming soon"}
