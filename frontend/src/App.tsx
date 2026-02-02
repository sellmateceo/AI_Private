import React, { useEffect, useMemo, useState } from "react";
import {
  Attendance,
  Host,
  Sale,
  Settlement,
  Shift,
  User,
  createAttendance,
  createHost,
  createSale,
  createSettlement,
  createShift,
  deleteAttendance,
  deleteHost,
  deleteSale,
  deleteSettlement,
  deleteShift,
  getMe,
  login,
  listAttendances,
  listHosts,
  listSales,
  listSettlements,
  listShifts,
  setToken,
  updateAttendance,
  updateHost,
  updateSale,
  updateSettlement,
  updateShift,
} from "./api";

const formatCurrency = (value: number) =>
  value.toLocaleString("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  });

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [hostName, setHostName] = useState("");
  const [hostNickname, setHostNickname] = useState("");
  const [hostStatus, setHostStatus] = useState("active");
  const [editingHostId, setEditingHostId] = useState<number | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [editingAttendanceId, setEditingAttendanceId] = useState<number | null>(
    null,
  );
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [editingSettlementId, setEditingSettlementId] = useState<number | null>(
    null,
  );
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
  const [hostSearch, setHostSearch] = useState("");
  const [hostStatusFilter, setHostStatusFilter] = useState("all");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [shiftSearch, setShiftSearch] = useState("");
  const [saleSearch, setSaleSearch] = useState("");
  const [settlementSearch, setSettlementSearch] = useState("");
  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
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

  const filteredHosts = useMemo(() => {
    const keyword = hostSearch.trim().toLowerCase();
    return hosts.filter((host) => {
      const matchesKeyword =
        !keyword ||
        host.name.toLowerCase().includes(keyword) ||
        (host.nickname ?? "").toLowerCase().includes(keyword);
      const matchesStatus =
        hostStatusFilter === "all" || host.status === hostStatusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [hosts, hostSearch, hostStatusFilter]);

  const filteredAttendances = useMemo(() => {
    const keyword = attendanceSearch.trim().toLowerCase();
    return attendances.filter((attendance) => {
      if (!keyword) return true;
      const hostName = resolveHostName(attendance.host_id).toLowerCase();
      return (
        hostName.includes(keyword) ||
        attendance.date.includes(keyword) ||
        (attendance.status ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [attendances, attendanceSearch, resolveHostName]);

  const filteredShifts = useMemo(() => {
    const keyword = shiftSearch.trim().toLowerCase();
    return shifts.filter((shift) => {
      if (!keyword) return true;
      const hostName = resolveHostName(shift.host_id).toLowerCase();
      return (
        hostName.includes(keyword) ||
        shift.date.includes(keyword) ||
        (shift.status ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [shifts, shiftSearch, resolveHostName]);

  const filteredSales = useMemo(() => {
    const keyword = saleSearch.trim().toLowerCase();
    return sales.filter((sale) => {
      if (!keyword) return true;
      const hostName = resolveHostName(sale.host_id).toLowerCase();
      return (
        hostName.includes(keyword) ||
        sale.date.includes(keyword) ||
        (sale.category ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [sales, saleSearch, resolveHostName]);

  const filteredSettlements = useMemo(() => {
    const keyword = settlementSearch.trim().toLowerCase();
    return settlements.filter((settlement) => {
      if (!keyword) return true;
      const hostName = resolveHostName(settlement.host_id).toLowerCase();
      return (
        hostName.includes(keyword) ||
        settlement.period_start.includes(keyword) ||
        settlement.period_end.includes(keyword) ||
        (settlement.status ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [settlements, settlementSearch, resolveHostName]);

  const monthlyReport = useMemo(() => {
    const [year, month] = reportMonth.split("-").map(Number);
    if (!year || !month) return [] as Array<{
      hostId: number;
      hostName: string;
      totalSales: number;
      attendanceCount: number;
    }>;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const reportMap = new Map<number, { totalSales: number; attendanceCount: number }>();

    sales.forEach((sale) => {
      const date = new Date(`${sale.date}T00:00:00Z`);
      if (date >= start && date < end) {
        const entry = reportMap.get(sale.host_id) ?? { totalSales: 0, attendanceCount: 0 };
        entry.totalSales += Number(sale.amount ?? 0);
        reportMap.set(sale.host_id, entry);
      }
    });

    attendances.forEach((attendance) => {
      const date = new Date(`${attendance.date}T00:00:00Z`);
      if (date >= start && date < end) {
        const entry = reportMap.get(attendance.host_id) ?? { totalSales: 0, attendanceCount: 0 };
        entry.attendanceCount += 1;
        reportMap.set(attendance.host_id, entry);
      }
    });

    return Array.from(reportMap.entries()).map(([hostId, data]) => ({
      hostId,
      hostName: resolveHostName(hostId),
      totalSales: data.totalSales,
      attendanceCount: data.attendanceCount,
    }));
  }, [attendances, reportMonth, resolveHostName, sales]);

  const loadData = async () => {
    const [hostsData, shiftsData, salesData, attendanceData, settlementData] =
      await Promise.all([
        listHosts(),
        listShifts(),
        listSales(),
        listAttendances(),
        listSettlements(),
      ]);
    setHosts(hostsData);
    setShifts(shiftsData);
    setSales(salesData);
    setAttendances(attendanceData);
    setSettlements(settlementData);
  };

  useEffect(() => {
    let ignore = false;

    const bootstrap = async () => {
      setIsLoading(true);
      setError("");
      try {
        const me = await getMe();
        if (!ignore) {
          setCurrentUser(me);
          await loadData();
        }
      } catch (err) {
        if (!ignore) {
          setCurrentUser(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      ignore = true;
    };
  }, []);

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) return;
    setIsAuthLoading(true);
    setAuthError("");
    try {
      const result = await login(loginId.trim(), loginPassword);
      setToken(result.access_token);
      setCurrentUser(result.user);
      await loadData();
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "ログインに失敗しました。",
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setHosts([]);
    setShifts([]);
    setSales([]);
    setAttendances([]);
    setSettlements([]);
  };

  const addHost = async () => {
    if (!hostName.trim()) return;
    try {
      if (editingHostId) {
        const updated = await updateHost(editingHostId, {
          name: hostName.trim(),
          nickname: hostNickname.trim() || null,
          status: hostStatus,
        });
        setHosts((prev) =>
          prev.map((host) => (host.id === editingHostId ? updated : host)),
        );
      } else {
        const created = await createHost({
          name: hostName.trim(),
          nickname: hostNickname.trim() || null,
          status: hostStatus,
        });
        setHosts((prev) => [created, ...prev]);
      }
      setHostName("");
      setHostNickname("");
      setHostStatus("active");
      setEditingHostId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "登録に失敗しました。",
      );
    }
  };

  const editHost = (host: Host) => {
    setEditingHostId(host.id);
    setHostName(host.name);
    setHostNickname(host.nickname ?? "");
    setHostStatus(host.status);
  };

  const removeHost = async (hostId: number) => {
    try {
      await deleteHost(hostId);
      setHosts((prev) => prev.filter((host) => host.id !== hostId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "削除に失敗しました。",
      );
    }
  };

  const addShift = async () => {
    if (!shiftHostId || !shiftDate) return;
    try {
      if (editingShiftId) {
        const updated = await updateShift(editingShiftId, {
          host_id: Number(shiftHostId),
          date: shiftDate,
          start_time: shiftStart,
          end_time: shiftEnd,
          status: shiftStatus,
        });
        setShifts((prev) =>
          prev.map((shift) => (shift.id === editingShiftId ? updated : shift)),
        );
      } else {
        const created = await createShift({
          host_id: Number(shiftHostId),
          date: shiftDate,
          start_time: shiftStart,
          end_time: shiftEnd,
          status: shiftStatus,
        });
        setShifts((prev) => [created, ...prev]);
      }
      setShiftHostId("");
      setEditingShiftId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "シフト登録に失敗しました。",
      );
    }
  };

  const editShift = (shift: Shift) => {
    setEditingShiftId(shift.id);
    setShiftHostId(String(shift.host_id));
    setShiftDate(shift.date);
    setShiftStart(shift.start_time ?? "");
    setShiftEnd(shift.end_time ?? "");
    setShiftStatus(shift.status ?? "scheduled");
  };

  const removeShift = async (shiftId: number) => {
    try {
      await deleteShift(shiftId);
      setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "削除に失敗しました。",
      );
    }
  };

  const addSale = async () => {
    if (!saleHostId || !saleDate || !saleAmount) return;
    try {
      if (editingSaleId) {
        const updated = await updateSale(editingSaleId, {
          host_id: Number(saleHostId),
          date: saleDate,
          amount: Number(saleAmount),
          category: saleCategory,
          note: saleNote || null,
        });
        setSales((prev) =>
          prev.map((sale) => (sale.id === editingSaleId ? updated : sale)),
        );
      } else {
        const created = await createSale({
          host_id: Number(saleHostId),
          date: saleDate,
          amount: Number(saleAmount),
          category: saleCategory,
          note: saleNote || null,
        });
        setSales((prev) => [created, ...prev]);
      }
      setSaleHostId("");
      setSaleAmount("120000");
      setSaleCategory("table");
      setSaleNote("");
      setEditingSaleId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "売上登録に失敗しました。",
      );
    }
  };

  const editSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setSaleHostId(String(sale.host_id));
    setSaleDate(sale.date);
    setSaleAmount(String(sale.amount ?? "0"));
    setSaleCategory(sale.category ?? "table");
    setSaleNote(sale.note ?? "");
  };

  const removeSale = async (saleId: number) => {
    try {
      await deleteSale(saleId);
      setSales((prev) => prev.filter((sale) => sale.id !== saleId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "削除に失敗しました。",
      );
    }
  };

  const addAttendance = async () => {
    if (!attendanceHostId || !attendanceDate) return;
    try {
      if (editingAttendanceId) {
        const updated = await updateAttendance(editingAttendanceId, {
          host_id: Number(attendanceHostId),
          date: attendanceDate,
          status: attendanceStatus,
          note: attendanceNote || null,
        });
        setAttendances((prev) =>
          prev.map((attendance) =>
            attendance.id === editingAttendanceId ? updated : attendance,
          ),
        );
      } else {
        const created = await createAttendance({
          host_id: Number(attendanceHostId),
          date: attendanceDate,
          status: attendanceStatus,
          note: attendanceNote || null,
        });
        setAttendances((prev) => [created, ...prev]);
      }
      setAttendanceHostId("");
      setAttendanceStatus("present");
      setAttendanceNote("");
      setEditingAttendanceId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "勤怠登録に失敗しました。",
      );
    }
  };

  const editAttendance = (attendance: Attendance) => {
    setEditingAttendanceId(attendance.id);
    setAttendanceHostId(String(attendance.host_id));
    setAttendanceDate(attendance.date);
    setAttendanceStatus(attendance.status ?? "present");
    setAttendanceNote(attendance.note ?? "");
  };

  const removeAttendance = async (attendanceId: number) => {
    try {
      await deleteAttendance(attendanceId);
      setAttendances((prev) =>
        prev.filter((attendance) => attendance.id !== attendanceId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "削除に失敗しました。",
      );
    }
  };

  const addSettlement = async () => {
    if (!settlementHostId || !settlementStart || !settlementEnd) return;
    try {
      if (editingSettlementId) {
        const updated = await updateSettlement(editingSettlementId, {
          host_id: Number(settlementHostId),
          period_start: settlementStart,
          period_end: settlementEnd,
          total_sales: Number(settlementSales),
          total_payout: Number(settlementPayout),
          status: settlementStatus,
        });
        setSettlements((prev) =>
          prev.map((settlement) =>
            settlement.id === editingSettlementId ? updated : settlement,
          ),
        );
      } else {
        const created = await createSettlement({
          host_id: Number(settlementHostId),
          period_start: settlementStart,
          period_end: settlementEnd,
          total_sales: Number(settlementSales),
          total_payout: Number(settlementPayout),
          status: settlementStatus,
        });
        setSettlements((prev) => [created, ...prev]);
      }
      setSettlementHostId("");
      setSettlementSales("0");
      setSettlementPayout("0");
      setSettlementStatus("pending");
      setEditingSettlementId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "精算登録に失敗しました。",
      );
    }
  };

  const editSettlement = (settlement: Settlement) => {
    setEditingSettlementId(settlement.id);
    setSettlementHostId(String(settlement.host_id));
    setSettlementStart(settlement.period_start);
    setSettlementEnd(settlement.period_end);
    setSettlementSales(String(settlement.total_sales ?? 0));
    setSettlementPayout(String(settlement.total_payout ?? 0));
    setSettlementStatus(settlement.status ?? "pending");
  };

  const removeSettlement = async (settlementId: number) => {
    try {
      await deleteSettlement(settlementId);
      setSettlements((prev) =>
        prev.filter((settlement) => settlement.id !== settlementId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "削除に失敗しました。",
      );
    }
  };

  if (!currentUser) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>ホスト管理ダッシュボード</h1>
            <p>ログインして管理を開始してください。</p>
          </div>
        </header>
        <section className="card">
          <h2>ログイン</h2>
          <div className="form-row">
            <input
              placeholder="ユーザーID"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
            />
            <input
              type="password"
              placeholder="パスワード"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
            />
            <button onClick={handleLogin} disabled={isAuthLoading}>
              ログイン
            </button>
          </div>
          {authError && <p className="empty">{authError}</p>}
          <p className="empty">初期アカウント: admin / admin123</p>
        </section>
      </div>
    );
  }

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
          <div>
            <span>ログイン</span>
            <strong>{currentUser.username}</strong>
          </div>
        </div>
        <div className="actions">
          <button onClick={handleLogout}>ログアウト</button>
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
            {editingHostId ? "更新" : "登録"}
          </button>
          {editingHostId && (
            <button
              onClick={() => {
                setEditingHostId(null);
                setHostName("");
                setHostNickname("");
                setHostStatus("active");
              }}
              disabled={isLoading}
            >
              キャンセル
            </button>
          )}
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
              {editingAttendanceId ? "勤怠更新" : "勤怠登録"}
            </button>
            {editingAttendanceId && (
              <button
                onClick={() => {
                  setEditingAttendanceId(null);
                  setAttendanceHostId("");
                  setAttendanceStatus("present");
                  setAttendanceNote("");
                }}
                disabled={isLoading}
              >
                キャンセル
              </button>
            )}
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
              {editingShiftId ? "シフト更新" : "シフト登録"}
            </button>
            {editingShiftId && (
              <button
                onClick={() => {
                  setEditingShiftId(null);
                  setShiftHostId("");
                  setShiftStatus("scheduled");
                }}
                disabled={isLoading}
              >
                キャンセル
              </button>
            )}
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
              {editingSaleId ? "売上更新" : "売上登録"}
            </button>
            {editingSaleId && (
              <button
                onClick={() => {
                  setEditingSaleId(null);
                  setSaleHostId("");
                  setSaleCategory("table");
                  setSaleNote("");
                }}
                disabled={isLoading}
              >
                キャンセル
              </button>
            )}
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
              {editingSettlementId ? "精算更新" : "精算登録"}
            </button>
            {editingSettlementId && (
              <button
                onClick={() => {
                  setEditingSettlementId(null);
                  setSettlementHostId("");
                  setSettlementSales("0");
                  setSettlementPayout("0");
                  setSettlementStatus("pending");
                }}
                disabled={isLoading}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>ホスト一覧</h2>
          <div className="form-row">
            <input
              placeholder="検索 (名前/ニックネーム)"
              value={hostSearch}
              onChange={(event) => setHostSearch(event.target.value)}
            />
            <select
              value={hostStatusFilter}
              onChange={(event) => setHostStatusFilter(event.target.value)}
            >
              <option value="all">すべて</option>
              <option value="active">在籍</option>
              <option value="inactive">休止</option>
              <option value="retired">退店</option>
            </select>
          </div>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : filteredHosts.length === 0 ? (
            <p className="empty">ホストが登録されていません。</p>
          ) : (
            <ul className="list">
              {filteredHosts.map((host) => (
                <li key={host.id}>
                  <div>
                    <strong>{host.name}</strong>
                    {host.nickname && <span>{host.nickname}</span>}
                    <span>ステータス: {host.status}</span>
                  </div>
                  <div className="actions">
                    <button onClick={() => editHost(host)} disabled={isLoading}>
                      編集
                    </button>
                    <button onClick={() => removeHost(host.id)} disabled={isLoading}>
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>勤怠</h2>
          <div className="form-row">
            <input
              placeholder="検索 (ホスト名/日付/ステータス)"
              value={attendanceSearch}
              onChange={(event) => setAttendanceSearch(event.target.value)}
            />
          </div>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : filteredAttendances.length === 0 ? (
            <p className="empty">勤怠記録がありません。</p>
          ) : (
            <ul className="list">
              {filteredAttendances.map((attendance) => (
                <li key={attendance.id}>
                  <span>
                    {attendance.date} / {resolveHostName(attendance.host_id)}
                  </span>
                  <span>
                    {attendance.status}
                    {attendance.note ? ` (${attendance.note})` : ""}
                  </span>
                  <div className="actions">
                    <button
                      onClick={() => editAttendance(attendance)}
                      disabled={isLoading}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => removeAttendance(attendance.id)}
                      disabled={isLoading}
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>シフト</h2>
          <div className="form-row">
            <input
              placeholder="検索 (ホスト名/日付/状態)"
              value={shiftSearch}
              onChange={(event) => setShiftSearch(event.target.value)}
            />
          </div>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : filteredShifts.length === 0 ? (
            <p className="empty">シフトが登録されていません。</p>
          ) : (
            <ul className="list">
              {filteredShifts.map((shift) => (
                <li key={shift.id}>
                  <span>
                    {shift.date} / {resolveHostName(shift.host_id)}
                  </span>
                  <span>
                    {shift.start_time} - {shift.end_time} ({shift.status})
                  </span>
                  <div className="actions">
                    <button onClick={() => editShift(shift)} disabled={isLoading}>
                      編集
                    </button>
                    <button onClick={() => removeShift(shift.id)} disabled={isLoading}>
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>売上</h2>
          <div className="form-row">
            <input
              placeholder="検索 (ホスト名/日付/カテゴリ)"
              value={saleSearch}
              onChange={(event) => setSaleSearch(event.target.value)}
            />
          </div>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : filteredSales.length === 0 ? (
            <p className="empty">売上が登録されていません。</p>
          ) : (
            <ul className="list">
              {filteredSales.map((sale) => (
                <li key={sale.id}>
                  <span>
                    {sale.date} / {resolveHostName(sale.host_id)}
                  </span>
                  <span>
                    {formatCurrency(Number(sale.amount ?? 0))} / {sale.category}
                    {sale.note ? ` (${sale.note})` : ""}
                  </span>
                  <div className="actions">
                    <button onClick={() => editSale(sale)} disabled={isLoading}>
                      編集
                    </button>
                    <button onClick={() => removeSale(sale.id)} disabled={isLoading}>
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>精算</h2>
          <div className="form-row">
            <input
              placeholder="検索 (ホスト名/期間/状態)"
              value={settlementSearch}
              onChange={(event) => setSettlementSearch(event.target.value)}
            />
          </div>
          {isLoading ? (
            <p className="empty">読み込み中...</p>
          ) : filteredSettlements.length === 0 ? (
            <p className="empty">精算が登録されていません。</p>
          ) : (
            <ul className="list">
              {filteredSettlements.map((settlement) => (
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
                  <div className="actions">
                    <button
                      onClick={() => editSettlement(settlement)}
                      disabled={isLoading}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => removeSettlement(settlement.id)}
                      disabled={isLoading}
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>月別リポート</h2>
          <div className="form-row">
            <input
              type="month"
              value={reportMonth}
              onChange={(event) => setReportMonth(event.target.value)}
            />
          </div>
          {monthlyReport.length === 0 ? (
            <p className="empty">対象月のデータがありません。</p>
          ) : (
            <ul className="list">
              {monthlyReport.map((item) => (
                <li key={item.hostId}>
                  <span>{item.hostName}</span>
                  <span>
                    売上 {formatCurrency(item.totalSales)} / 出勤 {item.attendanceCount}回
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
