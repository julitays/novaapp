from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenPair(BaseModel):
    access: str
    refresh: str

class MeResponse(BaseModel):
    email: EmailStr
    role: str
