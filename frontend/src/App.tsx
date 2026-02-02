import React, { useEffect, useMemo, useState } from "react";
import {
  Attendance,
  Host,
  Sale,
  Shift,
  createAttendance,
  createHost,
  createSale,
  createShift,
  listAttendances,
  listHosts,
  listSales,
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
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const totalSales = useMemo(
    () => sales.reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0),
    [sales],
  );

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [hostsData, shiftsData, salesData, attendanceData] =
          await Promise.all([
            listHosts(),
            listShifts(),
            listSales(),
            listAttendances(),
          ]);
        if (!ignore) {
          setHosts(hostsData);
          setShifts(shiftsData);
          setSales(salesData);
          setAttendances(attendanceData);
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
        status: "active",
      });
      setHosts((prev) => [created, ...prev]);
      setHostName("");
      setHostNickname("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "登録に失敗しました。",
      );
    }
  };

  const addShift = async (hostId: number) => {
    try {
      const created = await createShift({
        host_id: hostId,
        date: new Date().toISOString().slice(0, 10),
        start_time: "18:00",
        end_time: "01:00",
        status: "scheduled",
      });
      setShifts((prev) => [created, ...prev]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "シフト登録に失敗しました。",
      );
    }
  };

  const addSale = async (hostId: number) => {
    try {
      const created = await createSale({
        host_id: hostId,
        date: new Date().toISOString().slice(0, 10),
        amount: 120000,
        category: "table",
      });
      setSales((prev) => [created, ...prev]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "売上登録に失敗しました。",
      );
    }
  };

  const addAttendance = async (hostId: number) => {
    try {
      const created = await createAttendance({
        host_id: hostId,
        date: new Date().toISOString().slice(0, 10),
        status: "present",
      });
      setAttendances((prev) => [created, ...prev]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "勤怠登録に失敗しました。",
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
          <button onClick={addHost} disabled={isLoading}>
            登録
          </button>
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
                  </div>
                  <div className="actions">
                    <button onClick={() => addShift(host.id)} disabled={isLoading}>
                      シフト追加
                    </button>
                    <button
                      onClick={() => addAttendance(host.id)}
                      disabled={isLoading}
                    >
                      勤怠追加
                    </button>
                    <button onClick={() => addSale(host.id)} disabled={isLoading}>
                      売上追加
                    </button>
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
                    {attendance.date} / #{attendance.host_id}
                  </span>
                  <span>{attendance.status}</span>
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
                    {shift.date} / #{shift.host_id}
                  </span>
                  <span>
                    {shift.start_time} - {shift.end_time}
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
                    {sale.date} / #{sale.host_id}
                  </span>
                  <span>{formatCurrency(Number(sale.amount ?? 0))}</span>
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
