const locationCodes = [
  "FG-A1",
  "FG-A2",
  "FG-A3",
  "FG-B1",
  "FG-B2",
  "FG-B3",
  "FG-C1",
  "FG-C2",
  "FG-C3",
];

function createTagsForLocation(location) {
  const shortCode = location.replaceAll("-", "");

  const masterTags = Array.from(
    { length: 60 },
    (_, index) => ({
      id: `${location}-MASTER-${index + 1}`,
      tagCode: `M-${shortCode}-${String(index + 1).padStart(3, "0")}`,
      tagType: "MASTER",
      location,
    })
  );

  const slaveTags = Array.from(
    { length: 60 },
    (_, index) => ({
      id: `${location}-SLAVE-${index + 1}`,
      tagCode: `S-${shortCode}-${String(index + 1).padStart(3, "0")}`,
      tagType: "SLAVE",
      location,
    })
  );

  return [
    ...masterTags,
    ...slaveTags,
  ];
}

export const registeredTags =
  locationCodes.flatMap(createTagsForLocation);

export function getRegisteredTags(
  location,
  tagType
) {
  return registeredTags.filter(
    (tag) =>
      tag.location === location &&
      tag.tagType === tagType
  );
}