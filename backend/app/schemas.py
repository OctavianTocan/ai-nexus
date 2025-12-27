import uuid
from fastapi_users import schemas


# What the API returns when you ask for a user
class UserRead(schemas.BaseUser[uuid.UUID]):
    pass  # Inherits: id, email, is_active, is_superuser, is_verified


# What you send when registering a new user
class UserCreate(schemas.BaseUserCreate):
    pass  # Inherits: email, password


# What you send when updating a user
class UserUpdate(schemas.BaseUserUpdate):
    pass  # Inherits: password, email, is_active, is_superuser, is_verified
