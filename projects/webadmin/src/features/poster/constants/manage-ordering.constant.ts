import { DftFilterCompareType, DftFilterItem } from '@drafto/material/filter';

export const MANAGE_ORDERING_FILTERS = Object.freeze({
  status: Object.freeze({
    name: "STATUS",
    label: "Status",
    type: "options",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  } as DftFilterItem),

  posterType: Object.freeze({
    name: "POSTER_TYPE",
    label: "Poster Type",
    type: "options",
    options: [
      { label: "Photo", value: "PHOTO" },
      { label: "Video", value: "VIDEO" },
    ],
  } as DftFilterItem),

  languages: Object.freeze({
    name: "LANGUAGES",
    label: "Languages",
    type: "options",
    options: [
      { label: "English", value: "685bb410cf767c743191b2c1" },
      { label: "Hindi", value: "6859141a51caf14a3d0daa82" },
      { label: "Marathi", value: "685914205645ab06094cd234" },
      { label: "Gujarati", value: "6859142404c9f4ae086920aa" },
    ],
    // isDynamicOptions: true,
    optionsMultiple: true,
    optionsSearchable: true,
  } as DftFilterItem),

  publishedAt: Object.freeze({
    name: "PUBLISHED_AT",
    label: "Published At",
    type: "compare",
    options: [
      {
        value: DftFilterCompareType.Eq,
        label: "Date",
      },
      {
        value: DftFilterCompareType.Btw,
        label: "Custom",
      },
    ],
    compareSelectWidth: "100px",
    compareInputMaxWidth: "150px",
    datePicker: true,
  } as DftFilterItem),

  createdAt: Object.freeze({
    name: "CREATED_AT",
    label: "Created At",
    type: "compare",
    options: [
      {
        value: DftFilterCompareType.Eq,
        label: "Date",
      },
      {
        value: DftFilterCompareType.Btw,
        label: "Custom",
      },
    ],
    compareSelectWidth: "100px",
    compareInputMaxWidth: "150px",
    datePicker: true,
  } as DftFilterItem),

  category: Object.freeze({
    name: "CATEGORY",
    label: "Category",
    type: "options",
    isDynamicOptions: true,
    optionsSearchable: true,
    mutuallyExclusive: ["PARTY", "PARTY_STATE"],
  } as DftFilterItem),

  party: Object.freeze({
    name: "PARTY",
    label: "Party",
    type: "options",
    options: [
      { label: "BJP", value: "67667ff93e2b5f9b40b2d33d" },
      { label: "INC", value: "67667ff93e2b5f9b40b2d33e" },
      { label: "AAP", value: "67667ff93e2b5f9b40b2d341" },
    ],
    // isDynamicOptions: true,
    optionsSearchable: true,
    mutuallyExclusive: ["CATEGORY"],
  } as DftFilterItem),

  partyState: Object.freeze({
    name: "PARTY_STATE",
    label: "Party State",
    type: "options",
    options: [
      { label: "Delhi", value: "64d65a0ea84a72bc0ec1ac91" },
      { label: "Uttar Pradesh", value: "64d65a0ea84a72bc0ec1acaa" },
      { label: "Maharashtra", value: "64d65a0ea84a72bc0ec1ac9d" },
      { label: "Gujarat", value: "64d65a0ea84a72bc0ec1ac93" },
    ],
    // isDynamicOptions: true,
    optionsSearchable: true,
    dependencies: [
      {
        parentFilter: "PARTY",
        hideWhenParentEmpty: false, // Hide when no country selected
        clearOnParentChange: true, // Clear when country changes
        disableWhenParentEmpty: true, // Disable when no country selected
      },
    ],
    mutuallyExclusive: ["CATEGORY"],
  } as DftFilterItem),
});

export const GREETING_MANAGE_ORDERING_FILTERS = [
  MANAGE_ORDERING_FILTERS.status.name,
  MANAGE_ORDERING_FILTERS.posterType.name,
  MANAGE_ORDERING_FILTERS.languages.name,
  MANAGE_ORDERING_FILTERS.publishedAt.name,
  MANAGE_ORDERING_FILTERS.createdAt.name,
  MANAGE_ORDERING_FILTERS.category.name,
];

export const POLITICAL_MANAGE_ORDERING_FILTERS = [
  MANAGE_ORDERING_FILTERS.status.name,
  MANAGE_ORDERING_FILTERS.posterType.name,
  MANAGE_ORDERING_FILTERS.languages.name,
  MANAGE_ORDERING_FILTERS.publishedAt.name,
  MANAGE_ORDERING_FILTERS.createdAt.name,
  MANAGE_ORDERING_FILTERS.party.name,
  MANAGE_ORDERING_FILTERS.partyState.name,
];
