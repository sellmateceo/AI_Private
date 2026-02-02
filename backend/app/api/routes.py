from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Host, Attendance, Shift, Sale, Settlement
from app.schemas.host import HostCreate, HostOut, HostUpdate
from app.schemas.attendance import AttendanceCreate, AttendanceOut, AttendanceUpdate
from app.schemas.shift import ShiftCreate, ShiftOut, ShiftUpdate
from app.schemas.sale import SaleCreate, SaleOut, SaleUpdate
from app.schemas.settlement import SettlementCreate, SettlementOut, SettlementUpdate

router = APIRouter()


@router.get("/hosts", response_model=list[HostOut])
def list_hosts(db: Session = Depends(get_db)):
    return db.query(Host).all()


@router.post("/hosts", response_model=HostOut)
def create_host(payload: HostCreate, db: Session = Depends(get_db)):
    host = Host(**payload.model_dump())
    db.add(host)
    db.commit()
    db.refresh(host)
    return host


@router.put("/hosts/{host_id}", response_model=HostOut)
def update_host(host_id: int, payload: HostUpdate, db: Session = Depends(get_db)):
    host = db.get(Host, host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(host, key, value)
    db.commit()
    db.refresh(host)
    return host


@router.get("/attendances", response_model=list[AttendanceOut])
def list_attendances(db: Session = Depends(get_db)):
    return db.query(Attendance).all()


@router.post("/attendances", response_model=AttendanceOut)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
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
):
    attendance = db.get(Attendance, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(attendance, key, value)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/shifts", response_model=list[ShiftOut])
def list_shifts(db: Session = Depends(get_db)):
    return db.query(Shift).all()


@router.post("/shifts", response_model=ShiftOut)
def create_shift(payload: ShiftCreate, db: Session = Depends(get_db)):
    shift = Shift(**payload.model_dump())
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.put("/shifts/{shift_id}", response_model=ShiftOut)
def update_shift(shift_id: int, payload: ShiftUpdate, db: Session = Depends(get_db)):
    shift = db.get(Shift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(shift, key, value)
    db.commit()
    db.refresh(shift)
    return shift


@router.get("/sales", response_model=list[SaleOut])
def list_sales(db: Session = Depends(get_db)):
    return db.query(Sale).all()


@router.post("/sales", response_model=SaleOut)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    sale = Sale(**payload.model_dump())
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.put("/sales/{sale_id}", response_model=SaleOut)
def update_sale(sale_id: int, payload: SaleUpdate, db: Session = Depends(get_db)):
    sale = db.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(sale, key, value)
    db.commit()
    db.refresh(sale)
    return sale


@router.get("/settlements", response_model=list[SettlementOut])
def list_settlements(db: Session = Depends(get_db)):
    return db.query(Settlement).all()


@router.post("/settlements", response_model=SettlementOut)
def create_settlement(payload: SettlementCreate, db: Session = Depends(get_db)):
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
):
    settlement = db.get(Settlement, settlement_id)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settlement, key, value)
    db.commit()
    db.refresh(settlement)
    return settlement
