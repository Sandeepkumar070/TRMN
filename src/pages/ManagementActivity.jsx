import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  addHistoryEntry,
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

import "./ManagementActivity.css";


const activityConfig = {
  "add-tag": {
    number: "01",
    eyebrow: "TAG MASTER",
    title: "ADD TAG",
    description:
      "Register a new Master or Slave tag.",
  },

  "update-tag": {
    number: "02",
    eyebrow: "TAG MASTER",
    title: "UPDATE TAG",
    description:
      "Update tag information and rack assignment.",
  },

  "delete-tag": {
    number: "03",
    eyebrow: "TAG MASTER",
    title: "DELETE TAG",
    description:
      "Delete a registered tag from the system.",
  },

  history: {
    number: "04",
    eyebrow: "TAG AUDIT",
    title: "TAG HISTORY",
    description:
      "View registration, update and deletion history.",
  },

  "create-location": {
    number: "05",
    eyebrow: "LOCATION MASTER",
    title: "CREATE AREA / LOCATION",
    description:
      "Create a new area or location.",
  },

  "create-rack": {
    number: "06",
    eyebrow: "RACK MASTER",
    title: "CREATE RACK / RACK POSITION",
    description:
      "Create a rack position under an existing location.",
  },
};


function ManagementActivity() {
  const { activity } =
    useParams();

  const config =
    activityConfig[
      activity
    ];


  const [tags, setTags] =
    useState(
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

  const [
    tagId,
    setTagId,
  ] = useState("");

  const [
    tagType,
    setTagType,
  ] = useState(
    "MASTER"
  );

  const [
    locationCode,
    setLocationCode,
  ] = useState("");

  const [
    rackPosition,
    setRackPosition,
  ] = useState("");

  const [
    locationName,
    setLocationName,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("");

  const [
    deleteConfirm,
    setDeleteConfirm,
  ] = useState(false);


  const refresh = () => {
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


  const rackPositions =
    useMemo(
      () =>
        getRackPositions(
          locationCode
        ),

      [
        locationCode,
        locations,
      ]
    );


  /* =======================================================
     AUTO LOAD UPDATE DATA
  ======================================================= */

  useEffect(() => {
    if (
      activity !==
        "update-tag" ||
      !tagId
    ) {
      return;
    }


    const tag =
      getTags()
        .find(
          (item) =>
            item.tagId ===
            tagId
        );


    if (!tag) {
      return;
    }


    setTagType(
      tag.tagType
    );


    const assignment =
      findAssignmentByTag(
        getTagAssignments(),
        tagId
      );


    setLocationCode(
      assignment?.location ??
      tag.location ??
      ""
    );


    setRackPosition(
      assignment?.rackNumber
        ? String(
            assignment.rackNumber
          )
        : ""
    );
  }, [
    tagId,
    activity,
  ]);


  const showMessage = (
    text,
    type
  ) => {
    setMessage(text);
    setMessageType(type);
  };


  /* =======================================================
     ADD TAG
  ======================================================= */

  const handleAddTag =
    () => {
      if (!tagId.trim()) {
        showMessage(
          "Enter Tag ID.",
          "error"
        );

        return;
      }


      if (!locationCode) {
        showMessage(
          "Select Area / Location.",
          "error"
        );

        return;
      }


      const result =
        registerTag({
          tagId,
          tagType,
          location:
            locationCode,
        });


      if (!result.success) {
        showMessage(
          result.message,
          "error"
        );

        return;
      }


      showMessage(
        `${result.record.tagId} registered successfully.`,
        "success"
      );


      setTagId("");

      refresh();
    };


  /* =======================================================
     UPDATE TAG
  ======================================================= */

  const handleUpdateTag =
    () => {
      if (!tagId) {
        showMessage(
          "Select Tag ID.",
          "error"
        );

        return;
      }


      if (!locationCode) {
        showMessage(
          "Select Area / Location.",
          "error"
        );

        return;
      }


      if (!rackPosition) {
        showMessage(
          "Select Rack Position.",
          "error"
        );

        return;
      }


      const assignments =
        getTagAssignments();


      const rackExisting =
        findAssignmentByRack(
          assignments,
          locationCode,
          rackPosition
        );


      if (
        rackExisting &&
        rackExisting.tagCode !==
          tagId
      ) {
        showMessage(
          `Rack already assigned to ${rackExisting.tagCode}.`,
          "error"
        );

        return;
      }


      const location =
        locations.find(
          (item) =>
            item.code ===
            locationCode
        );


      const rackLabel =
        `${locationCode} ${location?.totalRacks ?? rackPositions.length}/${rackPosition}`;


      const oldAssignment =
        findAssignmentByTag(
          assignments,
          tagId
        );


      upsertTagAssignment({
        id:
          oldAssignment?.id ??
          globalThis.crypto
            ?.randomUUID?.() ??
          `ASSIGN-${Date.now()}`,

        tagCode:
          tagId,

        tagType,

        location:
          locationCode,

        rackNumber:
          Number(
            rackPosition
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


      updateTagRecord(
        tagId,
        {
          tagType,

          location:
            locationCode,

          details:
            `Updated to ${locationCode}, Rack ${rackPosition}`,
        }
      );


      showMessage(
        `${tagId} updated successfully.`,
        "success"
      );


      refresh();
    };


  /* =======================================================
     DELETE TAG
  ======================================================= */

  const handleDeleteTag =
    () => {
      const result =
        deleteTagRecord(
          tagId
        );


      if (!result.success) {
        showMessage(
          result.message,
          "error"
        );

        return;
      }


      removeAssignmentsByTag(
        tagId
      );


      setDeleteConfirm(false);

      showMessage(
        `${tagId} deleted successfully.`,
        "success"
      );


      setTagId("");

      refresh();
    };


  /* =======================================================
     CREATE LOCATION
  ======================================================= */

  const handleCreateLocation =
    () => {
      if (!locationCode.trim()) {
        showMessage(
          "Enter Location Code.",
          "error"
        );

        return;
      }


      const result =
        createLocationRecord({
          code:
            locationCode,

          name:
            locationName,
        });


      if (!result.success) {
        showMessage(
          result.message,
          "error"
        );

        return;
      }


      showMessage(
        `${result.record.code} created successfully.`,
        "success"
      );


      setLocationCode("");
      setLocationName("");

      refresh();
    };


  /* =======================================================
     CREATE RACK
  ======================================================= */

  const handleCreateRack =
    () => {
      if (!locationCode) {
        showMessage(
          "Select Area / Location.",
          "error"
        );

        return;
      }


      if (!rackPosition) {
        showMessage(
          "Enter Rack Position.",
          "error"
        );

        return;
      }


      const result =
        createRackPositionRecord({
          locationCode,

          rackPosition,
        });


      if (!result.success) {
        showMessage(
          result.message,
          "error"
        );

        return;
      }


      showMessage(
        `${locationCode} Rack Position ${rackPosition} created successfully.`,
        "success"
      );


      setRackPosition("");

      refresh();
    };


  if (!config) {
    return (
      <div className="activity-page">
        Invalid management activity.
      </div>
    );
  }


  return (
    <div className="activity-page">

      <div className="activity-background">
        <span></span>
      </div>


      <div className="activity-container">

        {/* HEADER */}

        <div className="activity-heading">

          <div className="activity-number">
            {config.number}
          </div>

          <div>
            <span>
              {config.eyebrow}
            </span>

            <h1>
              {config.title}
            </h1>

            <p>
              {config.description}
            </p>
          </div>

        </div>


        {message && (
          <div
            className={`activity-message ${messageType}`}
          >
            {message}
          </div>
        )}


        {/* =================================================
            ADD TAG
        ================================================= */}

        {activity ===
          "add-tag" && (

          <div className="activity-form">

            <div className="activity-field">
              <label>
                TAG ID
              </label>

              <input
                value={tagId}
                onChange={
                  (event) =>
                    setTagId(
                      event.target.value
                        .toUpperCase()
                    )
                }
                placeholder="Enter Tag ID"
              />
            </div>


            <div className="activity-field">
              <label>
                TAG TYPE
              </label>

              <select
                value={tagType}
                onChange={
                  (event) =>
                    setTagType(
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


            <div className="activity-field full">
              <label>
                AREA / LOCATION
              </label>

              <select
                value={locationCode}
                onChange={
                  (event) =>
                    setLocationCode(
                      event.target.value
                    )
                }
              >
                <option value="">
                  Select Area / Location
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={
                        location.code
                      }
                      value={
                        location.code
                      }
                    >
                      {location.code}
                      {" — "}
                      {location.name}
                    </option>
                  )
                )}
              </select>
            </div>


            <button
              className="activity-primary-btn"
              onClick={
                handleAddTag
              }
            >
              REGISTER TAG
            </button>

          </div>
        )}


        {/* =================================================
            UPDATE TAG
        ================================================= */}

        {activity ===
          "update-tag" && (

          <div className="activity-form">

            <div className="activity-field full">
              <label>
                SELECT TAG ID
              </label>

              <select
                value={tagId}
                onChange={
                  (event) =>
                    setTagId(
                      event.target.value
                    )
                }
              >
                <option value="">
                  Select Registered Tag
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


            <div className="activity-field">
              <label>
                TAG TYPE
              </label>

              <select
                value={tagType}
                onChange={
                  (event) =>
                    setTagType(
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


            <div className="activity-field">
              <label>
                AREA / LOCATION
              </label>

              <select
                value={locationCode}
                onChange={
                  (event) => {
                    setLocationCode(
                      event.target.value
                    );

                    setRackPosition("");
                  }
                }
              >
                <option value="">
                  Select Location
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={
                        location.code
                      }
                      value={
                        location.code
                      }
                    >
                      {location.code}
                    </option>
                  )
                )}
              </select>
            </div>


            <div className="activity-field full">
              <label>
                RACK POSITION
              </label>

              <select
                value={rackPosition}
                disabled={
                  !locationCode
                }
                onChange={
                  (event) =>
                    setRackPosition(
                      event.target.value
                    )
                }
              >
                <option value="">
                  Select Rack Position
                </option>

                {rackPositions.map(
                  (position) => (
                    <option
                      key={position}
                      value={position}
                    >
                      {locationCode}
                      {" / "}
                      {position}
                    </option>
                  )
                )}
              </select>
            </div>


            <button
              className="activity-primary-btn"
              onClick={
                handleUpdateTag
              }
            >
              UPDATE TAG
            </button>

          </div>
        )}


        {/* =================================================
            DELETE TAG
        ================================================= */}

        {activity ===
          "delete-tag" && (

          <div className="activity-form delete-form">

            <div className="activity-field full">

              <label>
                TAG ID
              </label>

              <input
                list="registered-tag-list"
                value={tagId}
                onChange={
                  (event) =>
                    setTagId(
                      event.target.value
                        .toUpperCase()
                    )
                }
                placeholder="Type Tag ID"
              />

              <datalist id="registered-tag-list">
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


            <button
              className="activity-delete-btn"
              onClick={() => {
                if (!tagId) {
                  showMessage(
                    "Enter Tag ID.",
                    "error"
                  );

                  return;
                }

                setDeleteConfirm(true);
              }}
            >
              DELETE TAG
            </button>

          </div>
        )}


        {/* =================================================
            HISTORY
        ================================================= */}

        {activity ===
          "history" && (

          <div className="history-panel">

            <div className="history-table-wrapper">

              <table className="history-table">

                <thead>
                  <tr>
                    <th>DATE / TIME</th>
                    <th>ACTION</th>
                    <th>TAG ID</th>
                    <th>DETAILS</th>
                  </tr>
                </thead>

                <tbody>

                  {history.length ===
                    0 ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="history-empty"
                      >
                        No Tag History Available
                      </td>
                    </tr>

                  ) : (

                    history.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            {new Date(
                              item.createdAt
                            ).toLocaleString()}
                          </td>

                          <td>
                            <span
                              className={`history-action ${
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
                            >
                              {item.action}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {item.tagId}
                            </strong>
                          </td>

                          <td>
                            {item.details}
                          </td>
                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}


        {/* =================================================
            CREATE LOCATION
        ================================================= */}

        {activity ===
          "create-location" && (

          <div className="activity-form">

            <div className="activity-field">
              <label>
                LOCATION CODE
              </label>

              <input
                value={locationCode}
                onChange={
                  (event) =>
                    setLocationCode(
                      event.target.value
                        .toUpperCase()
                    )
                }
                placeholder="Example: FG-D1"
              />
            </div>


            <div className="activity-field">
              <label>
                LOCATION NAME
              </label>

              <input
                value={locationName}
                onChange={
                  (event) =>
                    setLocationName(
                      event.target.value
                    )
                }
                placeholder="Example: Finished Goods D1"
              />
            </div>


            <button
              className="activity-primary-btn"
              onClick={
                handleCreateLocation
              }
            >
              CREATE LOCATION
            </button>

          </div>
        )}


        {/* =================================================
            CREATE RACK
        ================================================= */}

        {activity ===
          "create-rack" && (

          <div className="activity-form">

            <div className="activity-field full">
              <label>
                AREA / LOCATION
              </label>

              <select
                value={locationCode}
                onChange={
                  (event) =>
                    setLocationCode(
                      event.target.value
                    )
                }
              >
                <option value="">
                  Select Area / Location
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={
                        location.code
                      }
                      value={
                        location.code
                      }
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


            <div className="activity-field full">
              <label>
                RACK POSITION NUMBER
              </label>

              <input
                type="number"
                min="1"
                value={rackPosition}
                onChange={
                  (event) =>
                    setRackPosition(
                      event.target.value
                    )
                }
                placeholder="Example: 21"
              />
            </div>


            <button
              className="activity-primary-btn"
              onClick={
                handleCreateRack
              }
            >
              CREATE RACK POSITION
            </button>

          </div>
        )}

      </div>


      {/* DELETE CONFIRMATION */}

      {deleteConfirm && (

        <div className="activity-modal-overlay">

          <div className="activity-delete-modal">

            <span>
              DELETE TAG
            </span>

            <h2>
              {tagId}
            </h2>

            <p>
              This will permanently remove the tag and its current rack assignment.
            </p>

            <div>
              <button
                onClick={() =>
                  setDeleteConfirm(
                    false
                  )
                }
              >
                CANCEL
              </button>

              <button
                className="confirm-delete"
                onClick={
                  handleDeleteTag
                }
              >
                DELETE
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ManagementActivity;