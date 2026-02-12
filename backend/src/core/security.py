"""
安全模块

包含:
- 密码哈希 (bcrypt)
- JWT 令牌生成与验证
- 敏感数据加密 (AES-256-GCM)
"""

import base64
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
from jose import JWTError, jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from src.core.config import get_settings


# ==========================================
# 密码哈希 (直接使用 bcrypt，避免 passlib 兼容性问题)
# ==========================================

# bcrypt 哈希轮数，平衡安全与性能
BCRYPT_ROUNDS = 12


def hash_password(password: str) -> str:
    """
    对密码进行哈希
    
    Args:
        password: 明文密码
        
    Returns:
        哈希后的密码字符串
    """
    # bcrypt 最大支持 72 字节，手动截断
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码是否匹配
    
    Args:
        plain_password: 明文密码
        hashed_password: 哈希后的密码
        
    Returns:
        密码是否匹配
    """
    try:
        # bcrypt 最大支持 72 字节，手动截断
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


# ==========================================
# JWT 令牌
# ==========================================

def create_access_token(
    data: dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    创建访问令牌 (Access Token)
    
    Args:
        data: 要编码到令牌中的数据
        expires_delta: 过期时间增量，默认使用配置值
        
    Returns:
        编码后的 JWT 字符串
    """
    settings = get_settings()
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    })
    
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(
    data: dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    创建刷新令牌 (Refresh Token)
    
    Args:
        data: 要编码到令牌中的数据
        expires_delta: 过期时间增量，默认使用配置值
        
    Returns:
        编码后的 JWT 字符串
    """
    settings = get_settings()
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
    })
    
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> Optional[dict[str, Any]]:
    """
    解码并验证 JWT 令牌
    
    Args:
        token: JWT 字符串
        
    Returns:
        解码后的数据字典，验证失败返回 None
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


def verify_token_type(token: str, expected_type: str) -> Optional[dict[str, Any]]:
    """
    验证令牌类型
    
    Args:
        token: JWT 字符串
        expected_type: 期望的令牌类型 ("access" 或 "refresh")
        
    Returns:
        验证通过返回解码数据，否则返回 None
    """
    payload = decode_token(token)
    if payload and payload.get("type") == expected_type:
        return payload
    return None


# ==========================================
# 敏感数据加密 (AES-256-GCM)
# ==========================================

def _get_encryption_key() -> bytes:
    """
    获取加密密钥
    
    从配置读取 Base64 编码的密钥并解码
    """
    settings = get_settings()
    try:
        key = base64.b64decode(settings.ENCRYPTION_KEY)
        if len(key) != 32:
            raise ValueError("加密密钥必须是 32 字节")
        return key
    except Exception as e:
        raise ValueError(f"无效的加密密钥: {e}")


def encrypt_sensitive_data(plaintext: str) -> bytes:
    """
    加密敏感数据
    
    使用 AES-256-GCM 模式加密，返回格式: nonce(12) + ciphertext + tag(16)
    
    Args:
        plaintext: 要加密的明文字符串
        
    Returns:
        加密后的字节串（包含 nonce）
    """
    key = _get_encryption_key()
    aesgcm = AESGCM(key)
    
    # 生成随机 nonce (96 bits = 12 bytes)
    nonce = os.urandom(12)
    
    # 加密
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
    
    # 返回 nonce + ciphertext
    return nonce + ciphertext


def decrypt_sensitive_data(encrypted_data: bytes) -> str:
    """
    解密敏感数据
    
    Args:
        encrypted_data: 加密后的字节串（包含 nonce）
        
    Returns:
        解密后的明文字符串
        
    Raises:
        ValueError: 解密失败
    """
    if len(encrypted_data) < 28:  # 12 (nonce) + 16 (tag) = 28 最小长度
        raise ValueError("加密数据格式无效")
    
    key = _get_encryption_key()
    aesgcm = AESGCM(key)
    
    # 分离 nonce 和密文
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    
    try:
        # 解密
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode("utf-8")
    except Exception as e:
        raise ValueError(f"解密失败: {e}")


def generate_encryption_key() -> str:
    """
    生成新的加密密钥
    
    用于初始化配置时生成 ENCRYPTION_KEY
    
    Returns:
        Base64 编码的 32 字节密钥
    """
    key = os.urandom(32)
    return base64.b64encode(key).decode("utf-8")
