const TAGS_KEY =
  "rms-registered-tags-v1";

const LOCATIONS_KEY =
  "rms-management-locations-v1";

const HISTORY_KEY =
  "rms-tag-history-v1";


const defaultLocations = [
  { code: "FG-A1", name: "FG-A1", totalRacks: 20 },
  { code: "FG-A2", name: "FG-A2", totalRacks: 15 },
  { code: "FG-A3", name: "FG-A3", totalRacks: 18 },

  { code: "FG-B1", name: "FG-B1", totalRacks: 22 },
  { code: "FG-B2", name: "FG-B2", totalRacks: 16 },
  { code: "FG-B3", name: "FG-B3", totalRacks: 24 },

  { code: "FG-C1", name: "FG-C1", totalRacks: 14 },
  { code: "FG-C2", name: "FG-C2", totalRacks: 19 },
  { code: "FG-C3", name: "FG-C3", totalRacks: 21 },
];


function readJson(key, fallback) {
  try {
    const value =
      localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : fallback;
  } catch {
    return fallback;
  }
}


function saveJson(key, value) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );

  window.dispatchEvent(
    new Event(
      "rackManagementUpdated"
    )
  );
}


function ensureLocations() {
  const stored =
    localStorage.getItem(
      LOCATIONS_KEY
    );

  if (stored) {
    return;
  }

  const initial =
    defaultLocations.map(
      (location) => ({
        ...location,

        rackPositions:
          Array.from(
            {
              length:
                location.totalRacks,
            },

            (_, index) =>
              index + 1
          ),
      })
    );

  saveJson(
    LOCATIONS_KEY,
    initial
  );
}


/* =========================================================
   TAGS
========================================================= */

export function getTags() {
  return readJson(
    TAGS_KEY,
    []
  );
}


export function registerTag({
  tagId,
  tagType,
  location,
}) {
  const cleanId =
    tagId.trim().toUpperCase();

  const tags =
    getTags();

  const exists =
    tags.some(
      (tag) =>
        tag.tagId === cleanId
    );

  if (exists) {
    return {
      success: false,
      message:
        "Tag ID already registered.",
    };
  }


  const record = {
    id:
      globalThis.crypto
        ?.randomUUID?.() ??
      `TAG-${Date.now()}`,

    tagId:
      cleanId,

    tagCode:
      cleanId,

    tagType,

    location,

    status:
      "REGISTERED",

    createdAt:
      new Date()
        .toISOString(),

    updatedAt:
      new Date()
        .toISOString(),
  };


  saveJson(
    TAGS_KEY,
    [...tags, record]
  );


  addHistoryEntry({
    action:
      "ADD TAG",

    tagId:
      cleanId,

    details:
      `${tagType} tag registered for ${location || "No Location"}`,
  });


  return {
    success: true,
    record,
  };
}


export function updateTagRecord(
  tagId,
  updates
) {
  const cleanId =
    tagId
      .trim()
      .toUpperCase();

  const tags =
    getTags();

  const exists =
    tags.some(
      (tag) =>
        tag.tagId === cleanId
    );

  if (!exists) {
    return {
      success: false,
      message:
        "Tag ID not found.",
    };
  }


  const updated =
    tags.map(
      (tag) =>
        tag.tagId === cleanId
          ? {
              ...tag,
              ...updates,
              updatedAt:
                new Date()
                  .toISOString(),
            }
          : tag
    );


  saveJson(
    TAGS_KEY,
    updated
  );


  addHistoryEntry({
    action:
      "UPDATE TAG",

    tagId:
      cleanId,

    details:
      updates.details ??
      "Tag information updated.",
  });


  return {
    success: true,
  };
}


export function deleteTagRecord(
  tagId
) {
  const cleanId =
    tagId
      .trim()
      .toUpperCase();

  const tags =
    getTags();

  const existing =
    tags.find(
      (tag) =>
        tag.tagId === cleanId
    );


  if (!existing) {
    return {
      success: false,
      message:
        "Tag ID not found.",
    };
  }


  saveJson(
    TAGS_KEY,
    tags.filter(
      (tag) =>
        tag.tagId !== cleanId
    )
  );


  addHistoryEntry({
    action:
      "DELETE TAG",

    tagId:
      cleanId,

    details:
      `${existing.tagType} tag deleted from system.`,
  });


  return {
    success: true,
    record:
      existing,
  };
}


/* =========================================================
   LOCATIONS
========================================================= */

export function getManagementLocations() {
  ensureLocations();

  return readJson(
    LOCATIONS_KEY,
    []
  );
}


export function createLocationRecord({
  code,
  name,
}) {
  const cleanCode =
    code.trim().toUpperCase();

  const cleanName =
    name.trim();


  const locations =
    getManagementLocations();


  const exists =
    locations.some(
      (location) =>
        location.code ===
        cleanCode
    );


  if (exists) {
    return {
      success: false,
      message:
        "Location already exists.",
    };
  }


  const record = {
    code:
      cleanCode,

    name:
      cleanName ||
      cleanCode,

    totalRacks: 0,

    rackPositions: [],

    createdAt:
      new Date()
        .toISOString(),
  };


  saveJson(
    LOCATIONS_KEY,
    [
      ...locations,
      record,
    ]
  );


  return {
    success: true,
    record,
  };
}


/* =========================================================
   RACK POSITIONS
========================================================= */

export function getRackPositions(
  locationCode
) {
  const location =
    getManagementLocations()
      .find(
        (item) =>
          item.code ===
          locationCode
      );


  return (
    location?.rackPositions ??
    []
  );
}


export function createRackPositionRecord({
  locationCode,
  rackPosition,
}) {
  const numericPosition =
    Number(
      rackPosition
    );


  if (
    !Number.isInteger(
      numericPosition
    ) ||
    numericPosition <= 0
  ) {
    return {
      success: false,
      message:
        "Rack Position must be a positive number.",
    };
  }


  const locations =
    getManagementLocations();


  const location =
    locations.find(
      (item) =>
        item.code ===
        locationCode
    );


  if (!location) {
    return {
      success: false,
      message:
        "Location not found.",
    };
  }


  if (
    location.rackPositions.includes(
      numericPosition
    )
  ) {
    return {
      success: false,
      message:
        "Rack Position already exists.",
    };
  }


  const rackPositions = [
    ...location.rackPositions,
    numericPosition,
  ].sort(
    (a, b) => a - b
  );


  const updated =
    locations.map(
      (item) =>
        item.code ===
        locationCode
          ? {
              ...item,

              rackPositions,

              totalRacks:
                rackPositions.length,
            }
          : item
    );


  saveJson(
    LOCATIONS_KEY,
    updated
  );


  return {
    success: true,
  };
}


/* =========================================================
   HISTORY
========================================================= */

export function getTagHistory() {
  return readJson(
    HISTORY_KEY,
    []
  ).sort(
    (a, b) =>
      new Date(
        b.createdAt
      ) -
      new Date(
        a.createdAt
      )
  );
}


export function addHistoryEntry({
  action,
  tagId,
  details,
  tagType = "",
  location = "",
  rackPosition = "",
  status = "",
}) {
  const history =
    readJson(
      HISTORY_KEY,
      []
    );


  const entry = {
    id:
      globalThis.crypto
        ?.randomUUID?.() ??
      `HISTORY-${Date.now()}`,

    action,

    tagId,

    details,

    tagType,

    location,

    rackPosition,

    status,

    createdAt:
      new Date()
        .toISOString(),
  };


  saveJson(
    HISTORY_KEY,
    [
      ...history,
      entry,
    ]
  );
}