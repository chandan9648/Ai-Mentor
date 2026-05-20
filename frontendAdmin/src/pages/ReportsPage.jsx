import { useEffect, useState } from "react";
import {
  Flag,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { callApi } from "../utils/api";

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("course"); // "course" or "community"
  const [courseReports, setCourseReports] = useState([]);
  const [communityReports, setCommunityReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [courseRes, communityRes] = await Promise.allSettled([
        callApi("/admin/coures-reports"),
        callApi("/admin/reports")
      ]);

      if (courseRes.status === "fulfilled") {
        const data = Array.isArray(courseRes.value?.data) ? courseRes.value.data : [];
        setCourseReports(data);
      } else {
        console.error("Error fetching course reports:", courseRes.reason);
      }

      if (communityRes.status === "fulfilled") {
        const response = communityRes.value;
        const reportsList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setCommunityReports(reportsList);
      } else {
        console.error("Error fetching community reports:", communityRes.reason);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const coursePendingCount = courseReports.filter((r) => r.status !== "resolved").length;
  const courseResolvedCount = courseReports.filter((r) => r.status === "resolved").length;

  const communityPendingCount = communityReports.filter((r) => r.status !== "resolved").length;
  const communityResolvedCount = communityReports.filter((r) => r.status === "resolved").length;

  const pendingCount = activeTab === "course" ? coursePendingCount : communityPendingCount;
  const resolvedCount = activeTab === "course" ? courseResolvedCount : communityResolvedCount;

  if (loading) {
    return (
      <div className="p-10 text-center text-muted">Loading reports...</div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reports Dashboard
          </h2>
          <p className="text-muted text-sm">
            Monitor and manage all user and course reports
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-500">
              Pending: {pendingCount}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-green-500">
              Resolved: {resolvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("course")}
          className={`pb-4 text-sm font-semibold transition-all ${
            activeTab === "course"
              ? "border-b-2 border-teal-500 text-teal-500"
              : "text-muted hover:text-white"
          }`}
        >
          Course Reports ({courseReports.length})
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`pb-4 text-sm font-semibold transition-all ${
            activeTab === "community"
              ? "border-b-2 border-teal-500 text-teal-500"
              : "text-muted hover:text-white"
          }`}
        >
          Community Reports ({communityReports.length})
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="rounded-2xl border border-border overflow-hidden bg-canvas-alt/20 backdrop-blur-xl">
        <table className="w-full min-w-[800px]">
          {activeTab === "course" ? (
            <>
              <thead className="text-left text-[11px] uppercase tracking-widest text-muted bg-black/20">
                <tr className="border-b border-border">
                  <th className="p-5">User</th>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {courseReports.length > 0 ? (
                  courseReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-border hover:bg-white/5 transition-all"
                    >
                      {/* USER */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-500" />
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {report.user?.name || "Unknown User"}
                            </div>
                            <div className="text-[11px] text-muted">
                              {report.userId}
                            </div>
                            <div className="text-[10px] text-muted uppercase">
                              Reporter
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* COURSE */}
                      <td className="text-sm text-muted">{report.courseName}</td>
                      {/* TYPE */}
                      <td>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                          {report.reportType}
                        </span>
                      </td>
                      {/* DESCRIPTION */}
                      <td className="text-muted text-sm max-w-[250px] truncate">
                        {report.description || "No description"}
                      </td>
                      {/* STATUS */}
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            report.status === "resolved"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      {/* DATE */}
                      <td className="text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      {/* ACTION */}
                      <td className="pr-6 text-right">
                        <button className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-20 text-center text-muted">
                      <Flag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      No course reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          ) : (
            <>
              <thead className="text-left text-[11px] uppercase tracking-widest text-muted bg-black/20">
                <tr className="border-b border-border">
                  <th className="p-5">Reporter</th>
                  <th>Reported Content</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {communityReports.length > 0 ? (
                  communityReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-border hover:bg-white/5 transition-all"
                    >
                      {/* REPORTER */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-500" />
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {report.reporter?.name || "Unknown"}
                            </div>
                            <div className="text-[11px] text-muted">
                              {report.reporter?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* CONTENT */}
                      <td className="max-w-xs">
                        <div className="truncate font-semibold text-white">
                          {report.post?.content || "N/A"}
                        </div>
                        <div className="text-[11px] text-muted">
                          Author: {report.post?.author?.name || "Unknown"}
                        </div>
                      </td>
                      {/* REASON */}
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                            {report.reason}
                          </span>
                          {report.description && (
                            <span className="text-[11px] text-muted italic max-w-[200px] truncate">
                              "{report.description}"
                            </span>
                          )}
                        </div>
                      </td>
                      {/* STATUS */}
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            report.status === "resolved"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      {/* DATE */}
                      <td className="text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      {/* ACTION */}
                      <td className="pr-6 text-right">
                        <button className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center text-muted">
                      <Flag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      No community reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
