from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Host, Attendance, Shift, Sale, Settlement, User
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.schemas.user import UserOut, UserCreate
from app.schemas.host import HostCreate, HostOut, HostUpdate
from app.schemas.attendance import AttendanceCreate, AttendanceOut, AttendanceUpdate
from app.schemas.shift import ShiftCreate, ShiftOut, ShiftUpdate
from app.schemas.sale import SaleCreate, SaleOut, SaleUpdate
from app.schemas.settlement import SettlementCreate, SettlementOut, SettlementUpdate

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    return user


def require_roles(*roles: str):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return checker


@router.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.username, user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user),
        "issued_at": datetime.utcnow().isoformat(),
    }


@router.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/auth/users", response_model=UserOut)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    exists = db.query(User).filter(User.username == payload.username).first()
    if exists:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        role=payload.role or "staff",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/hosts", response_model=list[HostOut])
def list_hosts(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Host).all()


@router.post("/hosts", response_model=HostOut)
def create_host(
    payload: HostCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    host = Host(**payload.model_dump())
    db.add(host)
    db.commit()
    db.refresh(host)
    return host


@router.put("/hosts/{host_id}", response_model=HostOut)
def update_host(
    host_id: int,
    payload: HostUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    host = db.get(Host, host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(host, key, value)
    db.commit()
    db.refresh(host)
    return host


@router.delete("/hosts/{host_id}", status_code=204)
def delete_host(
    host_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    host = db.get(Host, host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    db.query(Attendance).filter(Attendance.host_id == host_id).delete()
    db.query(Shift).filter(Shift.host_id == host_id).delete()
    db.query(Sale).filter(Sale.host_id == host_id).delete()
    db.query(Settlement).filter(Settlement.host_id == host_id).delete()
    db.delete(host)
    db.commit()
    return None


@router.get("/attendances", response_model=list[AttendanceOut])
def list_attendances(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Attendance).all()


@router.post("/attendances", response_model=AttendanceOut)
def create_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    attendance = Attendance(**payload.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.put("/attendances/{attendance_id}", response_model=AttendanceOut)
def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    attendance = db.get(Attendance, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(attendance, key, value)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.delete("/attendances/{attendance_id}", status_code=204)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    attendance = db.get(Attendance, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    db.delete(attendance)
    db.commit()
    return None


@router.get("/shifts", response_model=list[ShiftOut])
def list_shifts(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Shift).all()


@router.post("/shifts", response_model=ShiftOut)
def create_shift(
    payload: ShiftCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    shift = Shift(**payload.model_dump())
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.put("/shifts/{shift_id}", response_model=ShiftOut)
def update_shift(
    shift_id: int,
    payload: ShiftUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    shift = db.get(Shift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(shift, key, value)
    db.commit()
    db.refresh(shift)
    return shift


@router.delete("/shifts/{shift_id}", status_code=204)
def delete_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    shift = db.get(Shift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    db.delete(shift)
    db.commit()
    return None


@router.get("/sales", response_model=list[SaleOut])
def list_sales(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Sale).all()


@router.post("/sales", response_model=SaleOut)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    sale = Sale(**payload.model_dump())
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.put("/sales/{sale_id}", response_model=SaleOut)
def update_sale(
    sale_id: int,
    payload: SaleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    sale = db.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(sale, key, value)
    db.commit()
    db.refresh(sale)
    return sale


@router.delete("/sales/{sale_id}", status_code=204)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    sale = db.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    db.delete(sale)
    db.commit()
    return None


@router.get("/settlements", response_model=list[SettlementOut])
def list_settlements(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Settlement).all()


@router.post("/settlements", response_model=SettlementOut)
def create_settlement(
    payload: SettlementCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    settlement = Settlement(**payload.model_dump())
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement


@router.put("/settlements/{settlement_id}", response_model=SettlementOut)
def update_settlement(
    settlement_id: int,
    payload: SettlementUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    settlement = db.get(Settlement, settlement_id)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settlement, key, value)
    db.commit()
    db.refresh(settlement)
    return settlement


@router.delete("/settlements/{settlement_id}", status_code=204)
def delete_settlement(
    settlement_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    settlement = db.get(Settlement, settlement_id)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    db.delete(settlement)
    db.commit()
    return None
