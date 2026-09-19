import { addHistoryEntry } from "./rackManagementStorage";

const STORAGE_KEY =
  "tag-management-rack-assignments-v1";

function notify() {
  window.dispatchEvent(
    new Event(
      "tagAssignmentsUpdated"
    )
  );
}

export function getTagAssignments() {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveAssignments(
  assignments
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      assignments
    )
  );

  notify();
}

function writeAssignmentHistory(action, assignment, details) {
  if (!assignment?.tagCode) return;

  addHistoryEntry({
    action,
    tagId: assignment.tagCode,
    tagType: assignment.tagType || "",
    location: assignment.location || "",
    rackPosition: assignment.rackPosition || "",
    status: action === "REMOVE ASSIGNMENT" ? "UNASSIGNED" : "ASSIGNED",
    details,
  });
}

export function saveTagAssignment(
  assignment
) {
  const updated = [
    ...getTagAssignments(),
    assignment,
  ];

  saveAssignments(
    updated
  );

  writeAssignmentHistory(
    "ASSIGN TAG",
    assignment,
    `${assignment.tagCode} assigned to ${assignment.rackPosition || assignment.location || "rack"}.`
  );

  return updated;
}

export function upsertTagAssignment(
  assignment
) {
  const current =
    getTagAssignments();

  const previous =
    current.find(
      (item) =>
        item.tagCode
          ?.toUpperCase() ===
        assignment.tagCode
          ?.toUpperCase()
    ) || null;

  const cleaned =
    current.filter(
      (item) =>
        item.tagCode
          ?.toUpperCase() !==
        assignment.tagCode
          ?.toUpperCase()
    );

  const updated = [
    ...cleaned,
    assignment,
  ];

  saveAssignments(
    updated
  );

  writeAssignmentHistory(
    previous ? "UPDATE ASSIGNMENT" : "ASSIGN TAG",
    assignment,
    previous
      ? `${assignment.tagCode} assignment updated to ${assignment.rackPosition || assignment.location || "rack"}.`
      : `${assignment.tagCode} assigned to ${assignment.rackPosition || assignment.location || "rack"}.`
  );

  return updated;
}

export function findAssignmentByTag(
  assignments,
  tagCode
) {
  if (!tagCode) {
    return null;
  }

  return (
    assignments.find(
      (item) =>
        item.tagCode
          ?.toUpperCase() ===
        tagCode
          .toUpperCase()
    ) || null
  );
}

export function findAssignmentByRack(
  assignments,
  location,
  rackNumber
) {
  return (
    assignments.find(
      (item) =>
        item.location ===
          location &&
        Number(
          item.rackNumber
        ) ===
          Number(
            rackNumber
          )
    ) || null
  );
}

export function removeTagAssignment(
  assignmentId
) {
  const current = getTagAssignments();
  const removed = current.find((item) => item.id === assignmentId);
  const updated =
    current.filter(
      (item) =>
        item.id !==
        assignmentId
    );

  saveAssignments(
    updated
  );

  if (removed) {
    writeAssignmentHistory(
      "REMOVE ASSIGNMENT",
      removed,
      `${removed.tagCode} removed from ${removed.rackPosition || removed.location || "rack"}.`
    );
  }

  return updated;
}

export function removeAssignmentsByTag(
  tagCode
) {
  const current = getTagAssignments();
  const removed = current.filter(
    (item) =>
      item.tagCode
        ?.toUpperCase() ===
      tagCode
        ?.toUpperCase()
  );

  const updated =
    current.filter(
      (item) =>
        item.tagCode
          ?.toUpperCase() !==
        tagCode
          ?.toUpperCase()
    );

  saveAssignments(
    updated
  );

  removed.forEach((assignment) => {
    writeAssignmentHistory(
      "REMOVE ASSIGNMENT",
      assignment,
      `${assignment.tagCode} assignment removed.`
    );
  });

  return updated;
}
