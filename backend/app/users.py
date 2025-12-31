from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users import UUIDIDMixin, BaseUserManager, FastAPIUsers
import os
import uuid
from typing import Optional
from app.db import User, get_user_db
from fastapi import Request
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi import Depends

import dotenv


dotenv.load_dotenv()
# Get the secret from the environment variable. This is used to sign the JWT tokens.
SECRET = os.environ.get("AUTH_SECRET")
if not SECRET:
    raise RuntimeError("AUTH_SECRET environment variable is not set")


# UserManager: Manages user creation, authentication, and password reset
class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    """
    This class manages user creation, authentication, and password reset.
    Inherits from:
        UUIDIDMixin: Mixin for UUID-based user IDs.
        BaseUserManager[User, uuid.UUID]: Base class for user managers that handles password hashing and verification.
    """

    # The secret used to sign the reset password token.
    reset_password_token_secret = SECRET
    # The secret used to sign the verification token.
    verification_token_secret = SECRET

    async def on_after_register(
        self, user: User, request: Optional[Request] = None
    ) -> None:
        """
        This function is called after a user is registered.
        Args:
            user: The user who was registered.
            request: The request object.
        """
        print(f"User {user.id} has registered.")

    async def on_after_login(
        self, user: User, request: Optional[Request] = None
    ) -> None:
        """
        This function is called after a user logs in.
        Args:
            user: The user who logged in.
            request: The request object.
        """
        print(f"User {user.id} has logged in.")


async def get_user_manager(
    user_db: SQLAlchemyUserDatabase[User, uuid.UUID] = Depends(get_user_db),
) -> UserManager:
    """
    This function is a dependency that returns the user manager.
    Args:
        user_db: The user database.
    Returns:
        A UserManager instance.
    """
    yield UserManager(user_db)


should_secure_cookie = os.environ.get("ENV") == "prod"
# Transport: How the token is sent (Bearer header)
cookie_transport = CookieTransport(
    cookie_name="session_token",
    cookie_httponly=True,
    cookie_secure=should_secure_cookie,
    cookie_samesite="lax",
    cookie_max_age=3600,
)


# Strategy: How the token is created (JWT)
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)


# Combine transport + strategy into an auth backend
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

# We use FastAPIUsers to manage users and authentication.
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

# Current active user: A dependency that returns the current active user.
current_active_user = fastapi_users.current_user(active=True)
