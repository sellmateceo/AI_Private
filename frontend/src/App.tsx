import React, { useEffect, useMemo, useState } from "react";
import {
  Attendance,
  Host,
  Sale,
  Settlement,
  Shift,
  createAttendance,
  createHost,
  createSale,
  createSettlement,
  createShift,
  listAttendances,
  listHosts,
  listSales,
  listSettlements,
  listShifts,
} from "./api";

const formatCurrency = (value: number) =>
  value.toLocaleString("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  });

const App: React.FC = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [hostName, setHostName] = useState("");
  const [hostNickname, setHostNickname] = useState("");
  const [hostStatus, setHostStatus] = useState("active");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [shiftHostId, setShiftHostId] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().slice(0, 10));
  const [shiftStart, setShiftStart] = useState("18:00");
  const [shiftEnd, setShiftEnd] = useState("01:00");
  const [shiftStatus, setShiftStatus] = useState("scheduled");
  const [attendanceHostId, setAttendanceHostId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [attendanceNote, setAttendanceNote] = useState("");
  const [saleHostId, setSaleHostId] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleAmount, setSaleAmount] = useState("120000");
  const [saleCategory, setSaleCategory] = useState("table");
  const [saleNote, setSaleNote] = useState("");
  const [settlementHostId, setSettlementHostId] = useState("");
  const [settlementStart, setSettlementStart] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [settlementEnd, setSettlementEnd] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [settlementSales, setSettlementSales] = useState("0");
  const [settlementPayout, setSettlementPayout] = useState("0");
  const [settlementStatus, setSettlementStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const totalSales = useMemo(
    () => sales.reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0),
    [sales],
  );

  const hostNameMap = useMemo(() => {
    const map = new Map<number, string>();
    hosts.forEach((host) => map.set(host.id, host.name));
    return map;
  }, [hosts]);

  const hostOptions = useMemo(
    () => hosts.map((host) => ({ value: String(host.id), label: host.name })),
    [hosts],
  );

  const resolveHostName = (hostId: number) =>
    hostNameMap.get(hostId) ?? `#${hostId}`;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [hostsData, shiftsData, salesData, attendanceData, settlementData] =
          await Promise.all([
            listHosts(),
            listShifts(),
            listSales(),
            listAttendances(),
            listSettlements(),
          ]);
        if (!ignore) {
          setHosts(hostsData);
          setShifts(shiftsData);
          setSales(salesData);
          setAttendances(attendanceData);
          setSettlements(settlementData);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "データの取得に失敗しました。",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const addHost = async () => {
    if (!hostName.trim()) return;
    try {
      const created = await createHost({
        name: hostName.trim(),
        nickname: hostNickname.trim() || null,
        status: hostStatus,
      });
      setHosts((prev) => [created, ...prev]);
      setHostName("");
      setHostNickname("");
      setHostStatus("active");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "登録に失敗しました。",
      );
    }
  };

  const addShift = async () => {
    if (!shiftHostId || !shiftDate) return;
    try {
      const created = await createShift({
        host_id: Number(shiftHostId),
        date: shiftDate,
        start_time: shiftStart,
        end_time: shiftEnd,
        status: shiftStatus,
      });
      setShifts((prev) => [created, ...prev]);
      setShiftHostId("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "シフト登録に失敗しました。",
      );
    }
  };

  const addSale = async () => {
    if (!saleHostId || !saleDate || !saleAmount) return;
    try {
      const created = await createSale({
        host_id: Number(saleHostId),
        date: saleDate,
        amount: Number(saleAmount),
        category: saleCategory,
        note: saleNote || null,
      });
      setSales((prev) => [created, ...prev]);
      setSaleHostId("");
      setSaleAmount("120000");
      setSaleCategory("table");
      setSaleNote("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "売上登録に失敗しました。",
      );
    }
  };

  const addAttendance = async () => {
    if (!attendanceHostId || !attendanceDate) return;
    try {
      const created = await createAttendance({
        host_id: Number(attendanceHostId),
        date: attendanceDate,
        status: attendanceStatus,
        note: attendanceNote || null,
      });
      setAttendances((prev) => [created, ...prev]);
      setAttendanceHostId("");
      setAttendanceStatus("present");
      setAttendanceNote("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "勤怠登録に失敗しました。",
      );
    }
  };

  const addSettlement = async () => {
    if (!settlementHostId || !settlementStart || !settlementEnd) return;
    try {
      const created = await createSettlement({
        host_id: Number(settlementHostId),
        period_start: settlementStart,
        period_end: settlementEnd,
        total_sales: Number(settlementSales),
        total_payout: Number(settlementPayout),
        status: settlementStatus,
      });
      setSettlements((prev) => [created, ...prev]);
      setSettlementHostId("");
      setSettlementSales("0");
      setSettlementPayout("0");
      setSettlementStatus("pending");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "精算登録に失敗しました。",
      );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>ホスト管理ダッシュボード</h1>
          <p>ホスト登録 / 勤怠 / シフト / 売上 / 精算</p>
          {error && <p className="empty">{error}</p>}
        </div>
        <div className="summary">
          <div>
            <span>総売上</span>
            <strong>{formatCurrency(totalSales)}</strong>
          </div>
          <div>
            <span>登録ホスト</span>
            <strong>{hosts.length}名</strong>
          </div>
        </div>
      </header>

      <section className="card">
        <h2>ホスト登録</h2>
        <div className="form-row">
          <input
            placeholder="ホスト名"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
          />
          <input
            placeholder="ニックネーム"
            value={hostNickname}
            onChange={(event) => setHostNickname(event.target.value)}
          />
          <select
            value={hostStatus}
            onChange={(event) => setHostStatus(event.target.value)}
          >
            <option value="active">在籍</option>
            <option value="inactive">休止</option>
            <option value="retired">退店</option>
          </select>
          <button onClick={addHost} disabled={isLoading}>
            登録
          </button>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>勤怠登録</h2>
          <div className="form-row">
            <select
              value={attendanceHostId}
              onChange={(event) => setAttendanceHostId(event.target.value)}
            >
              <option value="">ホスト選択</option>
              {hostOptions.map((host) => (
                <option key={host.value} value={host.value}>
                  {host.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={attendanceDate}
              onChange={(event) => setAttendanceDate(event.target.value)}
            />
            <select
              value={attendanceStatus}
              onChange={(event) => setAttendanceStatus(event.target.value)}
            >
              <option value="present">出勤</option>
              <option value="late">遅刻</option>
              <option value="absent">欠勤</option>
            </select>
            <input
              placeholder="メモ"
              value={attendanceNote}
              onChange={(event) => setAttendanceNote(event.target.value)}
            />
            <button onClick={addAttendance} disabled={isLoading}>
              勤怠登録
            </button>
          </div>
        </div>
        <div className="card">
          <h2>シフト登録</h2>
          <div className="form-row">
            <select
              value={shiftHostId}
              onChange={(event) => setShiftHostId(event.target.value)}
            >
              <option value="">ホスト選択</option>
              {hostOptions.map((host) => (
                <option key={host.value} value={host.value}>
                  {host.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={shiftDate}
              onChange={(event) => setShiftDate(event.target.value)}
            />
            <input
              type="time"
              value={shiftStart}
              onChange={(event) => setShiftStart(event.target.value)}
            />
            <input
              type="time"
              value={shiftEnd}
              onChange={(event) => setShiftEnd(event.target.value)}
            />
            <select
              value={shiftStatus}
              onChange={(event) => setShiftStatus(event.target.value)}
            >
              <option value="scheduled">予定</option>
              <option value="completed">完了</option>
              <option value="canceled">キャンセル</option>
            </select>
            <button onClick={addShift} disabled={isLoading}>
              シフト登録
            </button>
          </div>
        </div>
        <div className="card">
          <h2>売上登録</h2>
          <div className="form-row">
            <select
              value={saleHostId}
              onChange={(event) => setSaleHostId(event.target.value)}
            >
              <option value="">ホスト選択</option>
              {hostOptions.map((host) => (
                <option key={host.value} value={host.value}>
                  {host.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={saleDate}
              onChange={(event) => setSaleDate(event.target.value)}
            />
            <input
              type="number"
              min="0"
              value={saleAmount}
              onChange={(event) => setSaleAmount(event.target.value)}
            />
            <select
              value={saleCategory}
              onChange={(event) => setSaleCategory(event.target.value)}
            >
              <option value="table">テーブル</option>
              <option value="bottle">ボトル</option>
              <option value="event">イベント</option>
            </select>
            <input
              placeholder="メモ"
              value={saleNote}
              onChange={(event) => setSaleNote(event.target.value)}
            />
            <button onClick={addSale} disabled={isLoading}>
              売上登録
            </button>
          </div>
        </div>
        <div className="card">
          <h2>精算登録</h2>
          <div className="form-row">
            <select
              value={settlementHostId}
              onChange={(event) => setSettlementHostId(event.target.value)}
            >
              <option value="">ホスト選択</option>
              {hostOptions.map((host) => (
                <option key={host.value} value={host.value}>
                  {host.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={settlementStart}
              onChange={(event) => setSettlementStart(event.target.value)}
            />
            <input
              type="date"
              value={settlementEnd}
              onChange={(event) => setSettlementEnd(event.target.value)}
            />
            <input
              type="number"
              min="0"
              value={settlementSales}
              onChange={(event) => setSettlementSales(event.target.value)}
            />
            <input
              type="number"
              min="0"
              value={settlementPayout}
              onChange={(event) => setSettlementPayout(event.target.value)}
            />
            <select
              value={settlementStatus}
              onChange={(event) => setSettlementStatus(event.target.value)}
            >
              <option value="pending">未確定</option>
              <option value="approved">確定</option>
              <option value="paid">支払済</option>
            </select>
            <button onClick={addSettlement} disabled={isLoading}>
              精算登録
            </button>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>ホスト一覧</h2>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : hosts.length === 0 ? (
            <p className="empty">ホストが登録されていません。</p>
          ) : (
            <ul className="list">
              {hosts.map((host) => (
                <li key={host.id}>
                  <div>
                    <strong>{host.name}</strong>
                    {host.nickname && <span>{host.nickname}</span>}
                    <span>ステータス: {host.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>勤怠</h2>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : attendances.length === 0 ? (
            <p className="empty">勤怠記録がありません。</p>
          ) : (
            <ul className="list">
              {attendances.map((attendance) => (
                <li key={attendance.id}>
                  <span>
                    {attendance.date} / {resolveHostName(attendance.host_id)}
                  </span>
                  <span>
                    {attendance.status}
                    {attendance.note ? ` (${attendance.note})` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>シフト</h2>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : shifts.length === 0 ? (
            <p className="empty">シフトが登録されていません。</p>
          ) : (
            <ul className="list">
              {shifts.map((shift) => (
                <li key={shift.id}>
                  <span>
                    {shift.date} / {resolveHostName(shift.host_id)}
                  </span>
                  <span>
                    {shift.start_time} - {shift.end_time} ({shift.status})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>売上</h2>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : sales.length === 0 ? (
            <p className="empty">売上が登録されていません。</p>
          ) : (
            <ul className="list">
              {sales.map((sale) => (
                <li key={sale.id}>
                  <span>
                    {sale.date} / {resolveHostName(sale.host_id)}
                  </span>
                  <span>
                    {formatCurrency(Number(sale.amount ?? 0))} / {sale.category}
                    {sale.note ? ` (${sale.note})` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>精算</h2>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : settlements.length === 0 ? (
            <p className="empty">精算が登録されていません。</p>
          ) : (
            <ul className="list">
              {settlements.map((settlement) => (
                <li key={settlement.id}>
                  <span>
                    {settlement.period_start}〜{settlement.period_end} / {" "}
                    {resolveHostName(settlement.host_id)}
                  </span>
                  <span>
                    {formatCurrency(Number(settlement.total_sales ?? 0))} / 支払
                    {formatCurrency(Number(settlement.total_payout ?? 0))} ({" "}
                    {settlement.status})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;
