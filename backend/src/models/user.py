import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from ..db.base import Base


class User(Base):
    """User model - stores users authenticated via SSO/ADFS."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sso_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(255))
    department = Column(String(255))
    job_title = Column(String(255))
    ad_groups = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    last_login_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
