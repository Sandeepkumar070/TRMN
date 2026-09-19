import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  locations,
} from "../data/locationData";

import {
  getRegisteredTags,
  registeredTags,
} from "../data/tagData";

import {
  findAssignmentByRack,
  findAssignmentByTag,
  getTagAssignments,
  saveTagAssignment,
} from "../services/tagAssignmentStorage";

import masterTagImage from "../assets/master-tag.png";
import slaveTagImage from "../assets/slave-tag.png";

import "./TagAssignment.css";


/* =========================================================
   ICONS
========================================================= */

function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13 11 22 2 13V4h9Z" />
      <circle cx="7.5" cy="9" r="1.5" />
    </svg>
  );
}


function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}


function RackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M8 6h1" />
      <path d="M8 12h1" />
      <path d="M8 18h1" />
    </svg>
  );
}


function LayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}


function SaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}


function BarcodeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 5v14" />
      <path d="M7 5v14" />
      <path d="M10 5v14" />
      <path d="M14 5v14" />
      <path d="M17 5v14" />
      <path d="M20 5v14" />
    </svg>
  );
}


function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Z" />
      <path d="M5 21h14" />
    </svg>
  );
}


function ChainIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.15-1.15" />
    </svg>
  );
}


function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}


/* =========================================================
   PAGE
========================================================= */

function TagAssignment() {
  const navigate = useNavigate();

  const [tagType, setTagType] =
    useState("");

  const [locationCode, setLocationCode] =
    useState("");

  const [selectedTag, setSelectedTag] =
    useState("");

  const [rackNumber, setRackNumber] =
    useState("");

  const [assignments, setAssignments] =
    useState(() => getTagAssignments());

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [duplicatePopup, setDuplicatePopup] =
    useState(null);


  /* =======================================================
     TOTAL COUNTS
  ======================================================= */

  const totalTags =
    registeredTags.length;

  const totalLocations =
    locations.length;

  const totalTagTypes = 2;


  /* =======================================================
     SELECTED LOCATION
  ======================================================= */

  const selectedLocation =
    useMemo(
      () =>
        locations.find(
          (item) =>
            item.location === locationCode
        ) || null,
      [locationCode]
    );


  /* =======================================================
     REGISTERED TAGS
  ======================================================= */

  const filteredTags =
    useMemo(
      () => {
        if (!tagType || !locationCode) {
          return [];
        }

        return getRegisteredTags(
          locationCode,
          tagType
        );
      },
      [
        tagType,
        locationCode,
      ]
    );


  /* =======================================================
     RACK POSITIONS
  ======================================================= */

  const rackPositions =
    useMemo(
      () => {
        if (!selectedLocation) {
          return [];
        }

        return Array.from(
          {
            length:
              selectedLocation.totalRacks,
          },
          (_, index) => {
            const rackNumber =
              index + 1;

            return {
              rackNumber,

              label:
                `${selectedLocation.location} ${selectedLocation.totalRacks}/${rackNumber}`,
            };
          }
        );
      },
      [selectedLocation]
    );


  /* =======================================================
     TAG TYPE
  ======================================================= */

  const handleTagTypeChange =
    (event) => {
      setTagType(event.target.value);

      setSelectedTag("");

      setMessage("");
    };


  /* =======================================================
     LOCATION
  ======================================================= */

  const handleLocationChange =
    (event) => {
      setLocationCode(
        event.target.value
      );

      setSelectedTag("");
      setRackNumber("");

      setMessage("");
    };


  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = () => {
    setMessage("");


    if (!tagType) {
      setMessageType("error");

      setMessage(
        "Please select Tag Type."
      );

      return;
    }


    if (!locationCode) {
      setMessageType("error");

      setMessage(
        "Please select Area / Location."
      );

      return;
    }


    if (!selectedTag) {
      setMessageType("error");

      setMessage(
        "Please select Registered Tag."
      );

      return;
    }


    if (!rackNumber) {
      setMessageType("error");

      setMessage(
        "Please select Rack Position."
      );

      return;
    }


    /* =====================================================
       CHECK TAG DUPLICATE
    ===================================================== */

    const tagAlreadyAssigned =
      findAssignmentByTag(
        assignments,
        selectedTag
      );


    if (tagAlreadyAssigned) {
      setDuplicatePopup({
        reason:
          "TAG_ALREADY_ASSIGNED",

        assignment:
          tagAlreadyAssigned,
      });

      return;
    }


    /* =====================================================
       CHECK RACK DUPLICATE
    ===================================================== */

    const rackAlreadyAssigned =
      findAssignmentByRack(
        assignments,
        locationCode,
        rackNumber
      );


    if (rackAlreadyAssigned) {
      setDuplicatePopup({
        reason:
          "RACK_ALREADY_ASSIGNED",

        assignment:
          rackAlreadyAssigned,
      });

      return;
    }


    /* =====================================================
       FIND TAG RECORD
    ===================================================== */

    const tagRecord =
      filteredTags.find(
        (tag) =>
          tag.tagCode === selectedTag
      );


    if (!tagRecord) {
      setMessageType("error");

      setMessage(
        "Selected tag not found."
      );

      return;
    }


    const rackPosition =
      `${selectedLocation.location} ${selectedLocation.totalRacks}/${rackNumber}`;


    /* =====================================================
       SAVE
    ===================================================== */

    const newAssignment = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        `ASSIGN-${Date.now()}`,

      tagCode:
        tagRecord.tagCode,

      tagType:
        tagRecord.tagType,

      location:
        locationCode,

      rackNumber:
        Number(rackNumber),

      rackPosition,

      assignedAt:
        new Date().toISOString(),
    };


    const updated =
      saveTagAssignment(
        newAssignment
      );


    setAssignments(updated);

    setMessageType("success");

    setMessage(
      `${tagRecord.tagCode} assigned successfully to ${rackPosition}.`
    );


    setSelectedTag("");
    setRackNumber("");
  };


  const popupAssignment =
    duplicatePopup?.assignment;


  return (
    <div className="tag-assignment-page">

      {/* ===================================================
          TOP STATISTICS
      =================================================== */}

      <div className="assignment-statistics">

        {/* TOTAL TAGS */}

        <div className="stat-card stat-tags">

          <div className="stat-icon">
            <TagIcon />
          </div>

          <div className="stat-information">

            <span>
              TOTAL TAGS
            </span>

            <strong>
              {totalTags.toLocaleString()}
            </strong>

            <small>
              Registered in system
            </small>

          </div>

          <div className="stat-decoration bars">
            <i></i>
            <i></i>
            <i></i>
          </div>

        </div>


        {/* TOTAL LOCATIONS */}

        <div className="stat-card stat-locations">

          <div className="stat-icon">
            <LocationIcon />
          </div>

          <div className="stat-information">

            <span>
              TOTAL LOCATIONS
            </span>

            <strong>
              {totalLocations}
            </strong>

            <small>
              Areas and locations
            </small>

          </div>

        </div>


        {/* TAG TYPES */}

        <div className="stat-card stat-types">

          <div className="stat-icon">
            <LayersIcon />
          </div>

          <div className="stat-information">

            <span>
              TOTAL TAG TYPES
            </span>

            <strong>
              {totalTagTypes}
            </strong>

            <small>
              Master & Slave
            </small>

          </div>

        </div>

      </div>


      {/* ===================================================
          BOTTOM MAIN AREA
      =================================================== */}

      <div className="assignment-main-layout">

        {/* =================================================
            LEFT FORM
        ================================================= */}

        <section className="assignment-form-panel">

          <div className="assignment-heading">

            <div className="assignment-heading-icon">
              <TagIcon />
            </div>

            <div>

              <span>
                TAG CONFIGURATION
              </span>

              <h1>
                Assign Tag
              </h1>

              <p>
                Assign a registered Master or Slave tag to a rack position.
              </p>

            </div>

          </div>


          {/* MESSAGE */}

          {message && (
            <div
              className={`assignment-message ${messageType}`}
            >
              {message}
            </div>
          )}


          {/* FORM */}

          <div className="assignment-form-grid">

            {/* TAG TYPE */}

            <div className="form-field">

              <label>
                <b>01</b>
                TAG TYPE
              </label>

              <div className="select-wrapper">

                <span className="select-icon">
                  <TagIcon />
                </span>

                <select
                  value={tagType}
                  onChange={
                    handleTagTypeChange
                  }
                >
                  <option value="">
                    Select Tag Type
                  </option>

                  <option value="MASTER">
                    Master
                  </option>

                  <option value="SLAVE">
                    Slave
                  </option>
                </select>

              </div>

              <small>
                Choose whether to assign a Master or Slave tag.
              </small>

            </div>


            {/* AREA LOCATION */}

            <div className="form-field">

              <label>
                <b>02</b>
                AREA / LOCATION
              </label>

              <div className="select-wrapper">

                <span className="select-icon">
                  <LocationIcon />
                </span>

                <select
                  value={locationCode}
                  onChange={
                    handleLocationChange
                  }
                >
                  <option value="">
                    Select Area / Location
                  </option>

                  {locations.map(
                    (location) => (
                      <option
                        key={
                          location.id
                        }
                        value={
                          location.location
                        }
                      >
                        {location.location}
                      </option>
                    )
                  )}

                </select>

              </div>

              <small>
                Select the area or location where the tag will be assigned.
              </small>

            </div>


            {/* REGISTERED TAG */}

            <div className="form-field">

              <label>
                <b>03</b>
                REGISTERED TAG
              </label>

              <div className="select-wrapper">

                <span className="select-icon">
                  <BarcodeIcon />
                </span>

                <select
                  value={selectedTag}
                  disabled={
                    !tagType ||
                    !locationCode
                  }
                  onChange={
                    (event) =>
                      setSelectedTag(
                        event.target.value
                      )
                  }
                >
                  <option value="">

                    {!tagType
                      ? "First select Tag Type"
                      : !locationCode
                        ? "First select Area / Location"
                        : "Select Registered Tag"}

                  </option>

                  {filteredTags.map(
                    (tag) => {

                      const existing =
                        findAssignmentByTag(
                          assignments,
                          tag.tagCode
                        );

                      return (
                        <option
                          key={
                            tag.id
                          }
                          value={
                            tag.tagCode
                          }
                        >
                          {tag.tagCode}

                          {existing
                            ? ` — Assigned`
                            : ""}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              <small>
                Select a registered tag from the available list.
              </small>

            </div>


            {/* RACK POSITION */}

            <div className="form-field">

              <label>
                <b>04</b>
                RACK POSITION
              </label>

              <div className="select-wrapper">

                <span className="select-icon">
                  <RackIcon />
                </span>

                <select
                  value={rackNumber}
                  disabled={
                    !selectedLocation
                  }
                  onChange={
                    (event) =>
                      setRackNumber(
                        event.target.value
                      )
                  }
                >
                  <option value="">

                    {selectedLocation
                      ? "Select Rack Position"
                      : "First select Area / Location"}

                  </option>

                  {rackPositions.map(
                    (rack) => {

                      const assigned =
                        findAssignmentByRack(
                          assignments,
                          locationCode,
                          rack.rackNumber
                        );

                      return (
                        <option
                          key={
                            rack.rackNumber
                          }
                          value={
                            rack.rackNumber
                          }
                        >
                          {rack.label}

                          {assigned
                            ? ` — ${assigned.tagCode}`
                            : ""}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              <small>
                Choose the rack position for this tag.
              </small>

            </div>

          </div>


          {/* SAVE BUTTON */}

          <button
            type="button"
            className="save-assignment-button"
            onClick={handleSave}
          >
            <SaveIcon />

            <span>
              Save Assignment
            </span>
          </button>

        </section>


        {/* =================================================
            RIGHT TAG PREVIEW
        ================================================= */}

        <aside className="tag-reference-panel">

          {/* MASTER */}

          <div className="tag-reference-card master-reference">

            <div className="reference-header">

              <div className="reference-title">

                <div className="reference-icon">
                  <CrownIcon />
                </div>

                <div>

                  <h2>
                    Master Tag
                  </h2>

                  <p>
                    Reference preview for Master tag
                  </p>

                </div>

              </div>


              <span className="reference-badge master-badge">
                <i></i>
                MASTER
              </span>

            </div>


            <div className="reference-image-wrapper">

              <img
                src={masterTagImage}
                alt="Master Tag"
              />

            </div>

          </div>


          {/* SLAVE */}

          <div className="tag-reference-card slave-reference">

            <div className="reference-header">

              <div className="reference-title">

                <div className="reference-icon slave-icon">
                  <ChainIcon />
                </div>

                <div>

                  <h2>
                    Slave Tag
                  </h2>

                  <p>
                    Reference preview for Slave tag
                  </p>

                </div>

              </div>


              <span className="reference-badge slave-badge">
                <i></i>
                SLAVE
              </span>

            </div>


            <div className="reference-image-wrapper">

              <img
                src={slaveTagImage}
                alt="Slave Tag"
              />

            </div>

          </div>

        </aside>

      </div>


      {/* ===================================================
          DUPLICATE POPUP
      =================================================== */}

      {duplicatePopup &&
        popupAssignment && (

          <div className="duplicate-overlay">

            <div className="duplicate-popup">

              <div className="duplicate-warning">
                <WarningIcon />
              </div>


              <span className="duplicate-heading-small">
                ASSIGNMENT NOT ALLOWED
              </span>


              <h2>

                {duplicatePopup.reason ===
                "TAG_ALREADY_ASSIGNED"
                  ? "Tag Already Assigned"
                  : "Rack Already Assigned"}

              </h2>


              <p>

                {duplicatePopup.reason ===
                "TAG_ALREADY_ASSIGNED"
                  ? "This tag is already assigned to another rack."
                  : "This rack already has a tag assigned."}

              </p>


              <div className="duplicate-information">

                <div>
                  <span>
                    Tag
                  </span>

                  <strong>
                    {
                      popupAssignment.tagCode
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Tag Type
                  </span>

                  <strong>
                    {
                      popupAssignment.tagType
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Area / Location
                  </span>

                  <strong>
                    {
                      popupAssignment.location
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Rack Position
                  </span>

                  <strong>
                    {
                      popupAssignment.rackPosition
                    }
                  </strong>
                </div>

              </div>


              <div className="duplicate-buttons">

                <button
                  type="button"
                  className="duplicate-close"
                  onClick={() =>
                    setDuplicatePopup(null)
                  }
                >
                  Close
                </button>


                <button
                  type="button"
                  className="duplicate-open"
                  onClick={() => {

                    setDuplicatePopup(null);

                    navigate(
                      `/location/${popupAssignment.location}`
                    );
                  }}
                >
                  Open Location
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default TagAssignment;