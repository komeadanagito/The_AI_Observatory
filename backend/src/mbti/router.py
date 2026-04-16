"""MBTI API 路由。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.mbti.schemas import (
    CompletedMBTIResponse,
    MBTIResult,
    MBTITypeInfo,
    NextMBTIQuestionResponse,
    ResumeMBTISessionResponse,
    StartMBTISessionResponse,
    SubmitMBTIAnswerRequest,
)
from src.mbti.service import MBTIService

router = APIRouter(prefix="/api/mbti", tags=["MBTI"])


@router.post(
    "/session/start",
    response_model=StartMBTISessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_mbti_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StartMBTISessionResponse:
    service = MBTIService(db)
    return await service.start_session(current_user)


@router.get("/session/{session_id}/resume", response_model=ResumeMBTISessionResponse)
async def resume_mbti_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeMBTISessionResponse:
    service = MBTIService(db)
    try:
        return await service.resume_session(current_user, session_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post(
    "/session/{session_id}/answer",
    response_model=NextMBTIQuestionResponse | CompletedMBTIResponse,
)
async def submit_mbti_answer(
    session_id: str,
    request: SubmitMBTIAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MBTIService(db)
    try:
        return await service.submit_answer(
            current_user, session_id, request.question_id, request.selected_option
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.get("/session/{session_id}/result", response_model=MBTIResult)
async def get_mbti_result(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MBTIResult:
    service = MBTIService(db)
    try:
        return await service.get_result(current_user, session_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.get("/types", response_model=list[MBTITypeInfo])
async def get_mbti_types() -> list[MBTITypeInfo]:
    return MBTIService(None).get_type_list()  # type: ignore[arg-type]


@router.get("/types/{type_code}", response_model=MBTITypeInfo)
async def get_mbti_type_detail(type_code: str) -> MBTITypeInfo:
    try:
        return MBTIService(None).get_type_detail(type_code.upper())  # type: ignore[arg-type]
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
