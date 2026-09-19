import {
  useMemo,
  useState,
} from "react";

import {
  createLocationRecord,
  createRackPositionRecord,
  deleteTagRecord,
  getManagementLocations,
  getRackPositions,
  getTagHistory,
  getTags,
  registerTag,
  updateTagRecord,
} from "../services/rackManagementStorage";

import {
  findAssignmentByRack,
  findAssignmentByTag,
  getTagAssignments,
  removeAssignmentsByTag,
  upsertTagAssignment,
} from "../services/tagAssignmentStorage";

import "./TagManagement.css";


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


function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}


function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}


function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}


function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
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
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
      />

      <path d="M4 9h16" />
      <path d="M4 15h16" />

      <path d="M8 6h1" />
      <path d="M8 12h1" />
      <path d="M8 18h1" />
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


/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  number,
  title,
  subtitle,
  icon,
  danger = false,
}) {
  return (
    <div className="management-card-header">

      <div
        className={`management-card-icon ${
          danger
            ? "danger-icon"
            : ""
        }`}
      >
        {icon}
      </div>


      <div className="management-card-heading">

        <span>
          ACTIVITY {number}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {subtitle}
        </p>

      </div>


      <span className="management-card-number">
        {number}
      </span>

    </div>
  );
}


/* =========================================================
   TAG MANAGEMENT
========================================================= */

function TagManagement() {

  /* =======================================================
     DATA
  ======================================================= */

  const [
    tags,
    setTags,
  ] = useState(
    () => getTags()
  );


  const [
    locations,
    setLocations,
  ] = useState(
    () =>
      getManagementLocations()
  );


  const [
    history,
    setHistory,
  ] = useState(
    () =>
      getTagHistory()
  );


  /* =======================================================
     ADD TAG

     LOCATION REMOVED
  ======================================================= */

  const [
    addTagId,
    setAddTagId,
  ] = useState("");


  const [
    addTagType,
    setAddTagType,
  ] = useState("MASTER");


  /* =======================================================
     UPDATE TAG
  ======================================================= */

  const [
    updateTagId,
    setUpdateTagId,
  ] = useState("");


  const [
    updateTagType,
    setUpdateTagType,
  ] = useState("MASTER");


  const [
    updateLocation,
    setUpdateLocation,
  ] = useState("");


  const [
    updateRack,
    setUpdateRack,
  ] = useState("");


  /* =======================================================
     DELETE TAG
  ======================================================= */

  const [
    deleteTagId,
    setDeleteTagId,
  ] = useState("");


  const [
    deleteConfirm,
    setDeleteConfirm,
  ] = useState(false);


  /* =======================================================
     CREATE LOCATION

     LOCATION NAME REMOVED
  ======================================================= */

  const [
    newLocationCode,
    setNewLocationCode,
  ] = useState("");


  /* =======================================================
     CREATE RACK
  ======================================================= */

  const [
    rackLocation,
    setRackLocation,
  ] = useState("");


  const [
    newRackPosition,
    setNewRackPosition,
  ] = useState("");


  /* =======================================================
     MESSAGES
  ======================================================= */

  const [
    messages,
    setMessages,
  ] = useState({});


  const showMessage = (
    card,
    text,
    type = "success"
  ) => {

    setMessages(
      (previous) => ({
        ...previous,

        [card]: {
          text,
          type,
        },
      })
    );
  };


  const clearMessage =
    (card) => {

      setMessages(
        (previous) => ({
          ...previous,

          [card]: null,
        })
      );
    };


  /* =======================================================
     REFRESH DATA
  ======================================================= */

  const refreshData =
    () => {

      setTags(
        getTags()
      );

      setLocations(
        getManagementLocations()
      );

      setHistory(
        getTagHistory()
      );
    };


  /* =======================================================
     UPDATE RACK POSITIONS
  ======================================================= */

  const updateRackPositions =
    useMemo(
      () => {

        if (!updateLocation) {
          return [];
        }

        return getRackPositions(
          updateLocation
        );
      },

      [
        updateLocation,
        locations,
      ]
    );


  /* =======================================================
     SELECTED LOCATION FOR CREATE RACK
  ======================================================= */

  const rackLocationRecord =
    useMemo(
      () =>
        locations.find(
          (location) =>
            location.code ===
            rackLocation
        ) || null,

      [
        rackLocation,
        locations,
      ]
    );


  /* =======================================================
     UPDATE TAG SELECTION
  ======================================================= */

  const handleUpdateTagSelection =
    (tagId) => {

      setUpdateTagId(
        tagId
      );

      clearMessage(
        "update"
      );


      if (!tagId) {

        setUpdateTagType(
          "MASTER"
        );

        setUpdateLocation("");

        setUpdateRack("");

        return;
      }


      const tag =
        tags.find(
          (item) =>
            item.tagId ===
            tagId
        );


      if (tag) {

        setUpdateTagType(
          tag.tagType
        );
      }


      const assignment =
        findAssignmentByTag(
          getTagAssignments(),
          tagId
        );


      setUpdateLocation(
        assignment?.location ??
        tag?.location ??
        ""
      );


      setUpdateRack(
        assignment?.rackNumber
          ? String(
              assignment.rackNumber
            )
          : ""
      );
    };


  /* =======================================================
     ADD TAG

     ONLY TAG ID + TAG TYPE
  ======================================================= */

  const handleAddTag =
    () => {

      clearMessage(
        "add"
      );


      if (
        !addTagId.trim()
      ) {

        showMessage(
          "add",
          "Enter Tag ID.",
          "error"
        );

        return;
      }


      const result =
        registerTag({
          tagId:
            addTagId,

          tagType:
            addTagType,

          /*
             No location while registering tag.
             Location will be assigned later.
          */
          location: "",
        });


      if (
        !result.success
      ) {

        showMessage(
          "add",
          result.message,
          "error"
        );

        return;
      }


      showMessage(
        "add",
        `${result.record.tagId} registered successfully.`
      );


      setAddTagId("");

      refreshData();
    };


  /* =======================================================
     UPDATE TAG
  ======================================================= */

  const handleUpdate =
    () => {

      clearMessage(
        "update"
      );


      if (
        !updateTagId
      ) {

        showMessage(
          "update",
          "Select Tag ID.",
          "error"
        );

        return;
      }


      if (
        !updateLocation
      ) {

        showMessage(
          "update",
          "Select Location.",
          "error"
        );

        return;
      }


      if (
        !updateRack
      ) {

        showMessage(
          "update",
          "Select Rack Position.",
          "error"
        );

        return;
      }


      const assignments =
        getTagAssignments();


      const existingRack =
        findAssignmentByRack(
          assignments,
          updateLocation,
          updateRack
        );


      if (
        existingRack &&
        existingRack.tagCode !==
          updateTagId
      ) {

        showMessage(
          "update",
          `Rack already assigned to ${existingRack.tagCode}.`,
          "error"
        );

        return;
      }


      const locationRecord =
        locations.find(
          (item) =>
            item.code ===
            updateLocation
        );


      const rackLabel =
        `${updateLocation} ${
          locationRecord?.totalRacks ??
          updateRackPositions.length
        }/${updateRack}`;


      const oldAssignment =
        findAssignmentByTag(
          assignments,
          updateTagId
        );


      upsertTagAssignment({

        id:
          oldAssignment?.id ??
          globalThis.crypto
            ?.randomUUID?.() ??
          `ASSIGN-${Date.now()}`,

        tagCode:
          updateTagId,

        tagType:
          updateTagType,

        location:
          updateLocation,

        rackNumber:
          Number(
            updateRack
          ),

        rackPosition:
          rackLabel,

        assignedAt:
          oldAssignment?.assignedAt ??
          new Date()
            .toISOString(),

        updatedAt:
          new Date()
            .toISOString(),
      });


      const result =
        updateTagRecord(
          updateTagId,
          {
            tagType:
              updateTagType,

            location:
              updateLocation,

            details:
              `Updated to ${updateLocation}, Rack ${updateRack}`,
          }
        );


      if (
        !result.success
      ) {

        showMessage(
          "update",
          result.message,
          "error"
        );

        return;
      }


      showMessage(
        "update",
        `${updateTagId} updated successfully.`
      );


      refreshData();
    };


  /* =======================================================
     DELETE TAG
  ======================================================= */

  const handleDelete =
    () => {

      clearMessage(
        "delete"
      );


      const cleanId =
        deleteTagId
          .trim()
          .toUpperCase();


      if (!cleanId) {

        showMessage(
          "delete",
          "Enter Tag ID.",
          "error"
        );

        return;
      }


      const exists =
        tags.some(
          (tag) =>
            tag.tagId ===
            cleanId
        );


      if (!exists) {

        showMessage(
          "delete",
          "Tag ID not found.",
          "error"
        );

        return;
      }


      setDeleteConfirm(
        true
      );
    };


  const confirmDelete =
    () => {

      const result =
        deleteTagRecord(
          deleteTagId
        );


      if (
        !result.success
      ) {

        showMessage(
          "delete",
          result.message,
          "error"
        );

        return;
      }


      removeAssignmentsByTag(
        deleteTagId
      );


      showMessage(
        "delete",
        `${deleteTagId.toUpperCase()} deleted successfully.`
      );


      setDeleteTagId("");

      setDeleteConfirm(
        false
      );


      refreshData();
    };


  /* =======================================================
     CREATE LOCATION

     ONLY LOCATION CODE
  ======================================================= */

  const handleCreateLocation =
    () => {

      clearMessage(
        "location"
      );


      if (
        !newLocationCode.trim()
      ) {

        showMessage(
          "location",
          "Enter Location Code.",
          "error"
        );

        return;
      }


      /*
         Location name automatically uses
         same value as Location Code.
      */

      const result =
        createLocationRecord({

          code:
            newLocationCode,

          name:
            newLocationCode,
        });


      if (
        !result.success
      ) {

        showMessage(
          "location",
          result.message,
          "error"
        );

        return;
      }


      showMessage(
        "location",
        `${result.record.code} created successfully.`
      );


      setNewLocationCode("");

      refreshData();
    };


  /* =======================================================
     CREATE RACK
  ======================================================= */

  const handleCreateRack =
    () => {

      clearMessage(
        "rack"
      );


      if (
        !rackLocation
      ) {

        showMessage(
          "rack",
          "Select Location.",
          "error"
        );

        return;
      }


      if (
        !newRackPosition
      ) {

        showMessage(
          "rack",
          "Enter Rack Position.",
          "error"
        );

        return;
      }


      const result =
        createRackPositionRecord({

          locationCode:
            rackLocation,

          rackPosition:
            newRackPosition,
        });


      if (
        !result.success
      ) {

        showMessage(
          "rack",
          result.message,
          "error"
        );

        return;
      }


      showMessage(
        "rack",
        `${rackLocation}/${newRackPosition} created successfully.`
      );


      setNewRackPosition("");

      refreshData();
    };


  /* =======================================================
     RECENT HISTORY
  ======================================================= */

  const recentHistory =
    history.slice(
      0,
      7
    );


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="tag-management-page">

      <div className="tag-management-background">
        <span></span>
      </div>


      <div className="tag-operation-grid">

        {/* =================================================
            01 ADD TAG

            LOCATION REMOVED
        ================================================= */}

        <section className="management-operation-card">

          <CardHeader
            number="01"
            title="ADD TAG"
            subtitle="Register a new Master or Slave tag."
            icon={<TagIcon />}
          />


          <div className="operation-form">

            {/* TAG ID */}

            <div className="operation-field full">

              <label>
                TAG ID
              </label>

              <input
                value={addTagId}
                onChange={
                  (event) =>
                    setAddTagId(
                      event.target.value
                        .toUpperCase()
                    )
                }
                placeholder="Enter Tag ID"
              />

            </div>


            {/* TAG TYPE */}

            <div className="operation-field full">

              <label>
                TAG TYPE
              </label>

              <select
                value={addTagType}
                onChange={
                  (event) =>
                    setAddTagType(
                      event.target.value
                    )
                }
              >

                <option value="MASTER">
                  MASTER
                </option>

                <option value="SLAVE">
                  SLAVE
                </option>

              </select>

            </div>

          </div>


          {messages.add && (

            <div
              className={`operation-message ${messages.add.type}`}
            >
              {messages.add.text}
            </div>

          )}


          <button
            type="button"
            className="operation-button"
            onClick={
              handleAddTag
            }
          >

            <SaveIcon />

            REGISTER TAG

          </button>

        </section>


        {/* =================================================
            02 UPDATE TAG
        ================================================= */}

        <section className="management-operation-card">

          <CardHeader
            number="02"
            title="UPDATE TAG"
            subtitle="Update tag type, location and rack."
            icon={<EditIcon />}
          />


          <div className="operation-form">

            <div className="operation-field full">

              <label>
                REGISTERED TAG
              </label>

              <select
                value={updateTagId}
                onChange={
                  (event) =>
                    handleUpdateTagSelection(
                      event.target.value
                    )
                }
              >

                <option value="">
                  Select Tag
                </option>


                {tags.map(
                  (tag) => (

                    <option
                      key={tag.id}
                      value={tag.tagId}
                    >
                      {tag.tagId}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="operation-field">

              <label>
                TAG TYPE
              </label>

              <select
                value={updateTagType}
                onChange={
                  (event) =>
                    setUpdateTagType(
                      event.target.value
                    )
                }
              >

                <option value="MASTER">
                  MASTER
                </option>

                <option value="SLAVE">
                  SLAVE
                </option>

              </select>

            </div>


            <div className="operation-field">

              <label>
                LOCATION
              </label>

              <select
                value={updateLocation}
                onChange={
                  (event) => {

                    setUpdateLocation(
                      event.target.value
                    );

                    setUpdateRack("");
                  }
                }
              >

                <option value="">
                  Select Location
                </option>


                {locations.map(
                  (location) => (

                    <option
                      key={location.code}
                      value={location.code}
                    >
                      {location.code}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="operation-field full">

              <label>
                RACK POSITION
              </label>

              <select
                value={updateRack}
                disabled={
                  !updateLocation
                }
                onChange={
                  (event) =>
                    setUpdateRack(
                      event.target.value
                    )
                }
              >

                <option value="">
                  Select Rack Position
                </option>


                {updateRackPositions.map(
                  (position) => (

                    <option
                      key={position}
                      value={position}
                    >
                      {updateLocation}
                      {" / "}
                      {position}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {messages.update && (

            <div
              className={`operation-message ${messages.update.type}`}
            >
              {messages.update.text}
            </div>

          )}


          <button
            type="button"
            className="operation-button"
            onClick={
              handleUpdate
            }
          >

            <SaveIcon />

            UPDATE TAG

          </button>

        </section>


        {/* =================================================
            03 DELETE TAG
        ================================================= */}

        <section className="management-operation-card delete-operation-card">

          <CardHeader
            number="03"
            title="DELETE TAG"
            subtitle="Remove a registered tag and rack assignment."
            icon={<DeleteIcon />}
            danger
          />


          <div className="delete-card-content">

            <div className="operation-field full">

              <label>
                TAG ID
              </label>

              <input
                list="delete-tag-list"
                value={deleteTagId}
                onChange={
                  (event) => {

                    setDeleteTagId(
                      event.target.value
                        .toUpperCase()
                    );

                    setDeleteConfirm(
                      false
                    );
                  }
                }
                placeholder="Type Tag ID"
              />


              <datalist id="delete-tag-list">

                {tags.map(
                  (tag) => (

                    <option
                      key={tag.id}
                      value={tag.tagId}
                    />

                  )
                )}

              </datalist>

            </div>


            {deleteTagId && (

              <div className="delete-tag-preview">

                <span>
                  SELECTED TAG
                </span>

                <strong>
                  {deleteTagId}
                </strong>

              </div>

            )}


            {deleteConfirm && (

              <div className="inline-delete-confirm">

                <p>
                  Delete{" "}

                  <strong>
                    {deleteTagId}
                  </strong>

                  ?
                </p>


                <div>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm(
                        false
                      )
                    }
                  >
                    CANCEL
                  </button>


                  <button
                    type="button"
                    className="confirm-delete-button"
                    onClick={
                      confirmDelete
                    }
                  >
                    CONFIRM DELETE
                  </button>

                </div>

              </div>

            )}

          </div>


          {messages.delete && (

            <div
              className={`operation-message ${messages.delete.type}`}
            >
              {messages.delete.text}
            </div>

          )}


          {!deleteConfirm && (

            <button
              type="button"
              className="operation-button delete-button"
              onClick={
                handleDelete
              }
            >

              <DeleteIcon />

              DELETE TAG

            </button>

          )}

        </section>


        {/* =================================================
            04 TAG HISTORY
        ================================================= */}

        <section className="management-operation-card history-operation-card">

          <CardHeader
            number="04"
            title="VIEW TAG HISTORY"
            subtitle="Recent add, update and delete activity."
            icon={<HistoryIcon />}
          />


          <div className="history-list">

            {recentHistory.length === 0 ? (

              <div className="history-card-empty">

                <HistoryIcon />

                <strong>
                  NO HISTORY
                </strong>

                <span>
                  Tag activities will appear here.
                </span>

              </div>

            ) : (

              recentHistory.map(
                (item) => (

                  <div
                    className="history-list-row"
                    key={item.id}
                  >

                    <span
                      className={`history-status-dot ${
                        item.action.includes(
                          "DELETE"
                        )
                          ? "delete"
                          : item.action.includes(
                              "UPDATE"
                            )
                            ? "update"
                            : "add"
                      }`}
                    ></span>


                    <div className="history-row-main">

                      <strong>
                        {item.tagId}
                      </strong>

                      <span>
                        {item.action}
                      </span>

                    </div>


                    <time>

                      {new Date(
                        item.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "2-digit",

                          minute:
                            "2-digit",
                        }
                      )}

                    </time>

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            05 CREATE AREA / LOCATION

            LOCATION NAME REMOVED
        ================================================= */}

        <section className="management-operation-card">

          <CardHeader
            number="05"
            title="CREATE AREA / LOCATION"
            subtitle="Create a new rack storage location."
            icon={<LocationIcon />}
          />


          <div className="operation-form">

            <div className="operation-field full">

              <label>
                LOCATION CODE
              </label>

              <input
                value={newLocationCode}
                onChange={
                  (event) =>
                    setNewLocationCode(
                      event.target.value
                        .toUpperCase()
                    )
                }
                placeholder="Example: FG-D1"
              />

            </div>

          </div>


          {messages.location && (

            <div
              className={`operation-message ${messages.location.type}`}
            >
              {messages.location.text}
            </div>

          )}


          <button
            type="button"
            className="operation-button"
            onClick={
              handleCreateLocation
            }
          >

            <LocationIcon />

            CREATE LOCATION

          </button>

        </section>


        {/* =================================================
            06 CREATE RACK
        ================================================= */}

        <section className="management-operation-card">

          <CardHeader
            number="06"
            title="CREATE RACK / POSITION"
            subtitle="Add rack positions under a location."
            icon={<RackIcon />}
          />


          <div className="operation-form">

            <div className="operation-field full">

              <label>
                AREA / LOCATION
              </label>

              <select
                value={rackLocation}
                onChange={
                  (event) =>
                    setRackLocation(
                      event.target.value
                    )
                }
              >

                <option value="">
                  Select Location
                </option>


                {locations.map(
                  (location) => (

                    <option
                      key={location.code}
                      value={location.code}
                    >
                      {location.code}
                      {" — "}
                      {location.totalRacks}
                      {" Racks"}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="operation-field full">

              <label>
                NEW RACK POSITION
              </label>

              <input
                type="number"
                min="1"
                value={newRackPosition}
                onChange={
                  (event) =>
                    setNewRackPosition(
                      event.target.value
                    )
                }
                placeholder={
                  rackLocationRecord
                    ? `Next suggested: ${
                        rackLocationRecord.totalRacks +
                        1
                      }`
                    : "Example: 21"
                }
              />

            </div>

          </div>


          {rackLocationRecord && (

            <div className="rack-location-info">

              <span>
                CURRENT RACKS
              </span>

              <strong>
                {
                  rackLocationRecord.totalRacks
                }
              </strong>

              <small>
                in {rackLocationRecord.code}
              </small>

            </div>

          )}


          {messages.rack && (

            <div
              className={`operation-message ${messages.rack.type}`}
            >
              {messages.rack.text}
            </div>

          )}


          <button
            type="button"
            className="operation-button"
            onClick={
              handleCreateRack
            }
          >

            <RackIcon />

            CREATE RACK POSITION

          </button>

        </section>

      </div>

    </div>
  );
}

export default TagManagement;