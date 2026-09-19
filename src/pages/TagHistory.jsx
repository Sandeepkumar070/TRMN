import { useEffect, useMemo, useState } from "react";
import { registeredTags } from "../data/tagData";
import { getManagementLocations, getTagHistory, getTags } from "../services/rackManagementStorage";
import { getTagAssignments } from "../services/tagAssignmentStorage";
import "./TagHistory.css";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeDate(value, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function TagHistory() {
  const [version, setVersion] = useState(0);
  const [tagId, setTagId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener("rackManagementUpdated", refresh);
    window.addEventListener("tagAssignmentsUpdated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("rackManagementUpdated", refresh);
      window.removeEventListener("tagAssignmentsUpdated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const { rows, locations } = useMemo(() => {
    void version;
    const dynamicTags = getTags();
    const history = getTagHistory();
    const assignments = getTagAssignments();
    const managementLocations = getManagementLocations();

    const tagMap = new Map();
    registeredTags.forEach((tag) => {
      tagMap.set(tag.tagCode.toUpperCase(), {
        tagId: tag.tagCode,
        tagCode: tag.tagCode,
        tagType: tag.tagType,
        location: tag.location,
        status: "REGISTERED",
      });
    });
    dynamicTags.forEach((tag) => {
      tagMap.set((tag.tagId || tag.tagCode).toUpperCase(), tag);
    });

    const assignmentMap = new Map(
      assignments.map((item) => [(item.tagCode || "").toUpperCase(), item])
    );

    const historyTagIds = new Set();
    const historyRows = history.map((entry) => {
      const key = (entry.tagId || "").toUpperCase();
      historyTagIds.add(key);
      const tag = tagMap.get(key);
      const assignment = assignmentMap.get(key);
      return {
        id: entry.id,
        tagId: entry.tagId || tag?.tagId || tag?.tagCode || "—",
        tagType: entry.tagType || tag?.tagType || assignment?.tagType || "—",
        location: entry.location || assignment?.location || tag?.location || "—",
        rackPosition: entry.rackPosition || assignment?.rackPosition || "—",
        status: entry.status || (assignment ? "ASSIGNED" : (tag?.status || "REGISTERED")),
        action: entry.action || "ACTIVITY",
        details: entry.details || "—",
        createdAt: entry.createdAt || "",
      };
    });

    const snapshotRows = [...tagMap.entries()]
      .filter(([key]) => !historyTagIds.has(key))
      .map(([key, tag]) => {
        const assignment = assignmentMap.get(key);
        return {
          id: `CURRENT-${key}`,
          tagId: tag.tagId || tag.tagCode || key,
          tagType: tag.tagType || assignment?.tagType || "—",
          location: assignment?.location || tag.location || "—",
          rackPosition: assignment?.rackPosition || "—",
          status: assignment ? "ASSIGNED" : (tag.status || "REGISTERED"),
          action: assignment ? "CURRENT ASSIGNMENT" : "CURRENT TAG",
          details: assignment
            ? `Assigned to ${assignment.rackPosition}`
            : "Current registered tag record.",
          createdAt: assignment?.updatedAt || assignment?.assignedAt || tag.updatedAt || tag.createdAt || "",
        };
      });

    const allRows = [...historyRows, ...snapshotRows].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime || a.tagId.localeCompare(b.tagId);
    });

    const locationSet = new Set(
      managementLocations.map((item) => item.code).filter(Boolean)
    );
    allRows.forEach((row) => {
      if (row.location && row.location !== "—") locationSet.add(row.location);
    });

    return { rows: allRows, locations: [...locationSet].sort() };
  }, [version]);

  const filteredRows = useMemo(() => {
    const tagNeedle = tagId.trim().toUpperCase();
    const from = normalizeDate(fromDate, false);
    const to = normalizeDate(toDate, true);

    return rows.filter((row) => {
      if (tagNeedle && !row.tagId.toUpperCase().includes(tagNeedle)) return false;
      if (location && row.location !== location) return false;

      if (from || to) {
        if (!row.createdAt) return false;
        const rowDate = new Date(row.createdAt);
        if (Number.isNaN(rowDate.getTime())) return false;
        if (from && rowDate < from) return false;
        if (to && rowDate > to) return false;
      }

      return true;
    });
  }, [rows, tagId, fromDate, toDate, location]);

  const topRows = filteredRows.slice(0, 100);

  const clearFilters = () => {
    setTagId("");
    setFromDate("");
    setToDate("");
    setLocation("");
  };

  return (
    <section className="history-page">
      <div className="history-heading-row">
        <div>
          <span className="history-eyebrow">Tracking</span>
          <h1>Tag History</h1>
          <p>Latest tag activity with tag, rack, location and status details.</p>
        </div>
        <div className="history-count-card">
          <strong>{Math.min(filteredRows.length, 100)}</strong>
          <span>shown / top 100</span>
        </div>
      </div>

      <div className="history-filter-card">
        <div className="history-filter-field history-tag-filter">
          <label htmlFor="historyTagId">Tag ID</label>
          <input id="historyTagId" value={tagId} onChange={(e) => setTagId(e.target.value)} placeholder="Search Tag ID" />
        </div>
        <div className="history-filter-field">
          <label htmlFor="historyFromDate">From Date</label>
          <input id="historyFromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="history-filter-field">
          <label htmlFor="historyToDate">To Date</label>
          <input id="historyToDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate || undefined} />
        </div>
        <div className="history-filter-field">
          <label htmlFor="historyLocation">Location</label>
          <select id="historyLocation" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <button type="button" className="history-clear-btn" onClick={clearFilters}>Clear</button>
      </div>

      <div className="history-table-card">
        <div className="history-table-meta">
          <span>Matching records: <strong>{filteredRows.length}</strong></span>
          <span>Displaying maximum <strong>100</strong> records</span>
        </div>
        <div className="history-table-scroll">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tag ID</th>
                <th>Tag Type</th>
                <th>Location</th>
                <th>Rack Position</th>
                <th>Status</th>
                <th>Action</th>
                <th>Details</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {topRows.map((row, index) => (
                <tr key={row.id}>
                  <td className="history-index">{index + 1}</td>
                  <td><span className="history-tag-id">{row.tagId}</span></td>
                  <td><span className={`history-type-badge ${String(row.tagType).toLowerCase()}`}>{row.tagType}</span></td>
                  <td>{row.location}</td>
                  <td>{row.rackPosition}</td>
                  <td><span className="history-status-badge">{row.status}</span></td>
                  <td>{row.action}</td>
                  <td className="history-details" title={row.details}>{row.details}</td>
                  <td className="history-date">{formatDateTime(row.createdAt)}</td>
                </tr>
              ))}
              {topRows.length === 0 && (
                <tr>
                  <td colSpan="9" className="history-empty">No tag history matches the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TagHistory;
