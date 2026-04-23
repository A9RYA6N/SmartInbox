"""
Backend/services/cache_service.py
-------------------------------
Structured caching layer for SmartInbox.
Supports In-memory (default) and is architected for Redis.
"""

import time
import json
import logging
from typing import Any, Optional, Dict

logger = logging.getLogger("app.cache")

class CacheManager:
    def __init__(self, ttl: int = 300):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = ttl

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            return None
        
        # Check expiration
        if time.time() > entry["expires_at"]:
            del self._cache[key]
            return None
            
        return entry["data"]

    def set(self, key: str, data: Any, ttl: Optional[int] = None):
        expire_in = ttl if ttl is not None else self.default_ttl
        self._cache[key] = {
            "data": data,
            "expires_at": time.time() + expire_in
        }

    def delete(self, key: str):
        if key in self._cache:
            del self._cache[key]

    def clear(self):
        self._cache.clear()

# Global Singleton
cache_manager = CacheManager()
