import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import { locations } from "../data/locationData";

import "./RackDetails.css";


/* =========================================================
   DUMMY BIN QUANTITY PATTERN

   This automatically repeats even if location has
   50 or 60 racks.
========================================================= */

const dummyBinPattern = [
  8,
  6,
  0,
  7,
  8,
  5,
  3,
  8,
  6,
  4,
  8,
  7,
  2,
  8,
  5,
  0,
  6,
  8,
  4,
  8,
  7,
  3,
  6,
  0,
];


/* =========================================================
   RACK ICON
========================================================= */

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


/* =========================================================
   GET CURRENT DUMMY BIN QTY

   Works automatically for 1 - 60 racks.
========================================================= */

function getDummyBinQty(
  rackIndex,
  locationId,
  capacity
) {
  const patternIndex =
    (
      rackIndex +
      locationId * 3
    ) %
    dummyBinPattern.length;

  const value =
    dummyBinPattern[
      patternIndex
    ];

  return Math.min(
    value,
    capacity
  );
}


/* =========================================================
   RACK STATUS
========================================================= */

function getRackStatus(
  capacity,
  currentQty
) {
  if (
    currentQty >=
    capacity
  ) {
    return {
      text: "FULL",
      className:
        "rack-full",
    };
  }

  if (
    currentQty <= 0
  ) {
    return {
      text: "EMPTY",
      className:
        "rack-empty",
    };
  }

  return {
    text: "PARTIAL",
    className:
      "rack-partial",
  };
}


/* =========================================================
   BIN STACK
========================================================= */

function BinStack({
  capacity,
  currentQty,
}) {
  const stackRows =
    Array.from(
      {
        length: capacity,
      },

      (_, index) => {
        const binNumber =
          capacity - index;

        const isFilled =
          binNumber <=
          currentQty;

        return {
          binNumber,
          isFilled,
        };
      }
    );


  return (
    <div
      className="bin-stack"
      style={{
        "--bin-count":
          capacity,
      }}
    >
      {stackRows.map(
        (bin) => (
          <div
            key={
              bin.binNumber
            }
            className={
              bin.isFilled
                ? "bin-stack-row filled"
                : "bin-stack-row empty"
            }
          >
            <span>
              {bin.binNumber}
            </span>
          </div>
        )
      )}
    </div>
  );
}


/* =========================================================
   AUTOMATIC GRID CALCULATION

   Automatically finds the best columns / rows based on:
   - number of racks
   - screen width
   - screen height

   Maximum 10 columns
   Maximum 6 rows
   => maximum 60 rack positions
========================================================= */

function calculateGrid(
  rackCount,
  viewportWidth,
  viewportHeight
) {
  const count =
    Math.min(
      Math.max(
        rackCount,
        1
      ),
      60
    );

  /*
     Approx available content area.
     The details page already excludes
     Header and Footer.
  */

  const availableWidth =
    Math.max(
      viewportWidth - 20,
      320
    );

  const availableHeight =
    Math.max(
      viewportHeight -
        74 -
        38 -
        58,
      250
    );


  let bestLayout = {
    columns: 5,
    rows: Math.ceil(
      count / 5
    ),
    cardWidth: 200,
    cardHeight: 150,
    score: Infinity,
  };


  /*
     Try all column combinations.

     Up to 10 columns.
     Up to 6 rows.
  */

  for (
    let columns = 3;
    columns <= 10;
    columns++
  ) {
    const rows =
      Math.ceil(
        count /
        columns
      );

    if (
      rows > 6
    ) {
      continue;
    }


    const gap = 6;


    const cardWidth =
      (
        availableWidth -
        gap *
          (
            columns - 1
          )
      ) /
      columns;


    const cardHeight =
      (
        availableHeight -
        gap *
          (
            rows - 1
          )
      ) /
      rows;


    /*
       Ideal shape for this rack card.
    */

    const cardAspect =
      cardWidth /
      Math.max(
        cardHeight,
        1
      );


    const targetAspect =
      1.55;


    let score =
      Math.abs(
        cardAspect -
        targetAspect
      );


    /*
       Avoid making cards unnecessarily tiny.
    */

    if (
      cardWidth < 115
    ) {
      score +=
        (
          115 -
          cardWidth
        ) /
        30;
    }


    if (
      cardHeight < 82
    ) {
      score +=
        (
          82 -
          cardHeight
        ) /
        20;
    }


    /*
       Small penalty for unused cells.
    */

    const emptyCells =
      columns *
        rows -
      count;


    score +=
      emptyCells *
      0.015;


    if (
      score <
      bestLayout.score
    ) {
      bestLayout = {
        columns,
        rows,
        cardWidth,
        cardHeight,
        score,
      };
    }
  }


  /*
     Determine card density.
  */

  let density =
    "normal";


  if (
    bestLayout.cardWidth <
      155 ||
    bestLayout.cardHeight <
      100
  ) {
    density =
      "ultra";
  }
  else if (
    bestLayout.cardWidth <
      190 ||
    bestLayout.cardHeight <
      125
  ) {
    density =
      "dense";
  }
  else if (
    bestLayout.cardWidth <
      235 ||
    bestLayout.cardHeight <
      155
  ) {
    density =
      "compact";
  }


  return {
    ...bestLayout,
    density,
  };
}


/* =========================================================
   RACK DETAILS PAGE
========================================================= */

function RackDetails() {
  const {
    locationCode,
  } = useParams();


  const [
    viewport,
    setViewport,
  ] = useState({
    width:
      window.innerWidth,

    height:
      window.innerHeight,
  });


  /* ==========================================
     SCREEN RESIZE
  ========================================== */

  useEffect(() => {
    const handleResize =
      () => {
        setViewport({
          width:
            window.innerWidth,

          height:
            window.innerHeight,
        });
      };


    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);


  /* ==========================================
     SELECT LOCATION
  ========================================== */

  const location =
    locations.find(
      (item) =>
        item.location
          .toLowerCase() ===
        locationCode
          ?.toLowerCase()
    );


  /* ==========================================
     CREATE RACKS
  ========================================== */

  const racks =
    useMemo(
      () => {
        if (
          !location
        ) {
          return [];
        }


        /*
           Maximum supported:
           60 racks.
        */

        const rackCount =
          Math.min(
            location.totalRacks,
            60
          );


        return Array.from(
          {
            length:
              rackCount,
          },

          (_, index) => {

            const currentQty =
              getDummyBinQty(
                index,
                location.id,
                location.binCapacity
              );


            return {
              id:
                index + 1,

              position:
                `${location.location} ${location.totalRacks}/${index + 1}`,

              capacity:
                location.binCapacity,

              currentQty,
            };
          }
        );
      },

      [location]
    );


  /* ==========================================
     AUTO GRID
  ========================================== */

  const layout =
    useMemo(
      () =>
        calculateGrid(
          racks.length,
          viewport.width,
          viewport.height
        ),

      [
        racks.length,
        viewport.width,
        viewport.height,
      ]
    );


  /* ==========================================
     INVALID LOCATION
  ========================================== */

  if (
    !location
  ) {
    return (
      <div className="rack-not-found">
        Location not found.
      </div>
    );
  }


  return (
    <div
      className={`rack-details-page density-${layout.density}`}
    >

      {/* =====================================
          BACKGROUND
      ===================================== */}

      <div className="rack-details-background">

        <span className="rack-background-grid"></span>

        <span className="rack-orb rack-orb-one"></span>

        <span className="rack-orb rack-orb-two"></span>

      </div>


      {/* =====================================
          TOP
      ===================================== */}

      <div className="rack-details-header">

        {/* LOCATION */}

        <div className="selected-location">

          <span>
            SELECTED LOCATION
          </span>

          <h1>
            {location.location}
          </h1>

        </div>


        {/* TOTAL RACK */}

        <div className="location-summary">

          <div className="summary-rack-icon">
            <RackIcon />
          </div>

          <strong>
            {location.totalRacks}
          </strong>

          <span>
            Total Racks
          </span>

        </div>


        {/* CAPACITY */}

        <div className="location-bin-capacity">

          <span>
            BIN CAPACITY / RACK
          </span>

          <strong>
            {location.binCapacity}
          </strong>

        </div>

      </div>


      {/* =====================================
          ALL RACKS
      ===================================== */}

      <div
        className="rack-details-grid"
        style={{
          "--rack-columns":
            layout.columns,

          "--rack-rows":
            layout.rows,
        }}
      >

        {racks.map(
          (
            rack,
            index
          ) => {

            const status =
              getRackStatus(
                rack.capacity,
                rack.currentQty
              );


            return (
              <div
                key={
                  rack.id
                }
                className={`rack-detail-card ${status.className}`}
                style={{
                  "--rack-index":
                    index,
                }}
              >

                {/* SHINE */}

                <span className="rack-card-shine"></span>


                {/* =========================
                    LEFT SIDE
                ========================= */}

                <div className="rack-detail-left">

                  <div className="rack-top-row">

                    <div className="rack-icon-box">

                      <RackIcon />

                    </div>


                    <span className="rack-sequence">

                      #
                      {String(
                        rack.id
                      ).padStart(
                        2,
                        "0"
                      )}

                    </span>

                  </div>


                  {/* POSITION */}

                  <div className="rack-position-section">

                    <span className="rack-small-label">
                      RACK POSITION
                    </span>

                    <strong>
                      {rack.position}
                    </strong>

                  </div>


                  {/* QTY */}

                  <div className="bin-quantity-section">

                    <span className="bin-label">
                      BIN
                    </span>

                    <div className="bin-number">

                      <span className="bin-capacity-number">
                        {rack.capacity}
                      </span>

                      <span className="bin-slash">
                        /
                      </span>

                      <strong>
                        {rack.currentQty}
                      </strong>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="rack-status-line">

                    <span className="rack-status-indicator"></span>

                    <strong>
                      {status.text}
                    </strong>

                  </div>

                </div>


                {/* =========================
                    STACK
                ========================= */}

                <div className="rack-stack-section">

                  <span className="stack-heading">
                    BIN STACK
                  </span>

                  <BinStack
                    capacity={
                      rack.capacity
                    }
                    currentQty={
                      rack.currentQty
                    }
                  />

                </div>


                {/* THEME LINE */}

                <div className="rack-card-bottom-line">
                  <span></span>
                </div>

              </div>
            );

          }
        )}

      </div>

    </div>
  );
}

export default RackDetails;