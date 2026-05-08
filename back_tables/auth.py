from passlib.context import CryptContext
from pathlib import Path
from dotenv import load_dotenv
from jose import jwt
from datetime import datetime, timedelta, timezone
import os

load_dotenv()

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

print("SECRET_KEY:", SECRET_KEY, type(SECRET_KEY))

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    truncated_password = password[:72]
    return pwd_context.hash(truncated_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)