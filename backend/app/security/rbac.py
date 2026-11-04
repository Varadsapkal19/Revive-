"""
REVIVE Role-Based Access Control (RBAC) & Authorization Module
Defines enterprise roles, fine-grained permission matrix, and FastAPI authorization dependencies.
"""

from enum import Enum
from typing import Set, List, Dict
from fastapi import HTTPException, status, Depends

class Role(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    MERCHANT_OWNER = "MERCHANT_OWNER"
    MERCHANT_ADMIN = "MERCHANT_ADMIN"
    FINOPS_MANAGER = "FINOPS_MANAGER"
    DEVELOPER = "DEVELOPER"
    ANALYST = "ANALYST"
    AUDITOR = "AUDITOR"

# Fine-Grained Permissions
class Permission:
    CASES_READ = "cases:read"
    CASES_WRITE = "cases:write"
    CASES_EXECUTE = "cases:execute"
    
    EVENTS_CREATE = "events:create"
    
    POLICIES_READ = "policies:read"
    POLICIES_WRITE = "policies:write"
    POLICIES_TEST = "policies:test"
    
    AUDIT_READ = "audit:read"
    AUDIT_VERIFY = "audit:verify"
    
    METRICS_READ = "metrics:read"
    EXPERIMENTS_READ = "experiments:read"
    SIMULATOR_RUN = "simulator:run"
    
    USERS_READ = "users:read"
    USERS_MANAGE = "users:manage"
    MERCHANT_MANAGE = "merchant:manage"

# Permission Matrix (Least Privilege by Default)
ROLE_PERMISSIONS: Dict[Role, Set[str]] = {
    Role.SUPER_ADMIN: {
        Permission.CASES_READ, Permission.CASES_WRITE, Permission.CASES_EXECUTE,
        Permission.EVENTS_CREATE, Permission.POLICIES_READ, Permission.POLICIES_WRITE,
        Permission.POLICIES_TEST, Permission.AUDIT_READ, Permission.AUDIT_VERIFY,
        Permission.METRICS_READ, Permission.EXPERIMENTS_READ, Permission.SIMULATOR_RUN,
        Permission.USERS_READ, Permission.USERS_MANAGE, Permission.MERCHANT_MANAGE
    },
    Role.MERCHANT_OWNER: {
        Permission.CASES_READ, Permission.CASES_WRITE, Permission.CASES_EXECUTE,
        Permission.EVENTS_CREATE, Permission.POLICIES_READ, Permission.POLICIES_WRITE,
        Permission.POLICIES_TEST, Permission.AUDIT_READ, Permission.AUDIT_VERIFY,
        Permission.METRICS_READ, Permission.EXPERIMENTS_READ, Permission.SIMULATOR_RUN,
        Permission.USERS_READ, Permission.USERS_MANAGE, Permission.MERCHANT_MANAGE
    },
    Role.MERCHANT_ADMIN: {
        Permission.CASES_READ, Permission.CASES_WRITE, Permission.CASES_EXECUTE,
        Permission.EVENTS_CREATE, Permission.POLICIES_READ, Permission.POLICIES_WRITE,
        Permission.POLICIES_TEST, Permission.AUDIT_READ, Permission.AUDIT_VERIFY,
        Permission.METRICS_READ, Permission.EXPERIMENTS_READ, Permission.SIMULATOR_RUN,
        Permission.USERS_READ, Permission.USERS_MANAGE
    },
    Role.FINOPS_MANAGER: {
        Permission.CASES_READ, Permission.CASES_WRITE, Permission.CASES_EXECUTE,
        Permission.EVENTS_CREATE, Permission.POLICIES_READ, Permission.POLICIES_TEST,
        Permission.AUDIT_READ, Permission.METRICS_READ, Permission.EXPERIMENTS_READ,
        Permission.SIMULATOR_RUN, Permission.USERS_READ
    },
    Role.DEVELOPER: {
        Permission.CASES_READ, Permission.EVENTS_CREATE, Permission.POLICIES_READ,
        Permission.POLICIES_TEST, Permission.AUDIT_READ, Permission.EXPERIMENTS_READ,
        Permission.SIMULATOR_RUN
    },
    Role.ANALYST: {
        Permission.CASES_READ, Permission.AUDIT_READ, Permission.METRICS_READ,
        Permission.EXPERIMENTS_READ, Permission.SIMULATOR_RUN
    },
    Role.AUDITOR: {
        Permission.CASES_READ, Permission.AUDIT_READ, Permission.AUDIT_VERIFY,
        Permission.METRICS_READ, Permission.POLICIES_READ
    }
}

# Role normalizer to map legacy roles gracefully
LEGACY_ROLE_MAP = {
    "FINOPS_ADMIN": Role.FINOPS_MANAGER,
    "MERCHANT_OPERATOR": Role.FINOPS_MANAGER,
    "ADMIN": Role.MERCHANT_ADMIN
}

def normalize_role(role_str: str) -> Role:
    if not role_str:
        return Role.ANALYST
    upper = role_str.upper()
    if upper in LEGACY_ROLE_MAP:
        return LEGACY_ROLE_MAP[upper]
    try:
        return Role(upper)
    except ValueError:
        return Role.ANALYST

def check_permission(user_role: str, permission: str) -> bool:
    """Verifies whether the given role has the specified permission."""
    role_enum = normalize_role(user_role)
    allowed = ROLE_PERMISSIONS.get(role_enum, set())
    return permission in allowed
