import enum


class Role(str, enum.Enum):
    TENANT = "TENANT"
    OWNER = "OWNER"
    UNASSIGNED = "UNASSIGNED"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"


class GenderPreference(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    ANY = "ANY"


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

