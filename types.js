// types.js

// Original TypeScript enums converted to JS objects
export const UserRole = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin',
};

export const WildfireStatus = {
  ACTIVE: "Active",
  CONTAINED: "Contained",
  EXTINGUISHED: "Extinguished",
  UNKNOWN: "Unknown",
};

export const ApprovalStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Interfaces and type aliases are primarily for TypeScript's static analysis.
// They don't have a direct runtime representation in JavaScript in the same way.
// If these types are used for `instanceof` checks or similar runtime type introspection
// (which they are not in this codebase, typically), they would need to be classes or have
// specific runtime markers. For this app, they serve as documentation and for (manual) validation.

// The Google Maps type declarations (declare global { namespace google {...} }) are for 
// development-time type checking with TypeScript. In a pure JS environment without a TS build step,
// these declarations don't directly execute or provide runtime types. They help inform how to
// interact with the Google Maps API. We assume `window.google` will be populated by the Maps API script.

// Example of how types might be documented for JS:
/**
 * @typedef {'user' | 'staff' | 'admin'} UserRoleValue
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} [name]
 * @property {string} [email]
 * @property {UserRoleValue} [role]
 */

/**
 * @typedef {Object} Wildfire
 * @property {string} id
 * @property {string} name
 * @property {string} [latitude]
 * @property {string} [longitude]
 * @property {string} [address]
 * @property {string} status - One of WildfireStatus values
 * @property {string} location_description
 * @property {number} size_acres
 * @property {number} containment_percentage
 * @property {string} [started_date] - YYYY-MM-DD
 * @property {string} incident_time - ISO date string
 * @property {string} last_updated - ISO date string
 * @property {string} [severity]
 * @property {string} approval_status - One of ApprovalStatus values
 * @property {string} [created_by_user_email]
 * @property {string} [reviewed_by_email]
 * @property {string} [reviewed_at]
 * @property {string} [rejection_reason]
 */

/**
 * @typedef {Object} WildfireFormData
 * @property {string} [name]
 * @property {string | number} [latitude]
 * @property {string | number} [longitude]
 * @property {string} [address]
 * @property {string} [status]
 * @property {string} [location_description]
 * @property {string | number} [size_acres]
 * @property {string | number} [containment_percentage]
 * @property {string} [started_date]
 * @property {string} [severity]
 */


/**
 * @typedef {Object} IncidentUpdate
 * @property {string} id
 * @property {string} wildfire_id
 * @property {string} [wildfire_name]
 * @property {string} created_at - ISO date string
 * @property {string} update_type
 * @property {string} update_text
 * @property {string} [previous_value]
 * @property {string} [new_value]
 * @property {string} [reported_by] - Email of user, resolved to name for display
 * @property {string} [mediaUrl]
 * @property {'image' | 'video'} [mediaMediaType]
 * @property {string} approval_status - One of ApprovalStatus values
 * @property {string} [reviewed_by] - Email of admin/staff, resolved to name for display
 * @property {string} [reviewed_at]
 * @property {string} [rejection_reason]
 */

/**
 * @typedef {Object} IncidentUpdateFormData
 * @property {string} update_type
 * @property {string} update_text
 * @property {File | null} [mediaFile]
 */

/**
 * @typedef {Object} PendingUpdateItem_JS - Extends IncidentUpdate for JS
 * @property {string} id
 * @property {string} wildfire_id
 * @property {string} wildfire_name
 * @property {string} created_at
 * @property {string} update_type
 * @property {string} update_text
 * @property {string} [previous_value]
 * @property {string} [new_value]
 * @property {string} [reported_by]
 * @property {string} [mediaUrl]
 * @property {'image' | 'video'} [mediaMediaType]
 * @property {string} approval_status
 * @property {string} [reviewed_by]
 * @property {string} [reviewed_at]
 * @property {string} [rejection_reason]
 */


/**
 * @typedef {Object} FIRMSHotspot
 * @property {number} latitude
 * @property {number} longitude
 * @property {number | null} brightness
 * @property {string | number | null} confidence
 * @property {string} acq_datetime - ISO date string
 * @property {string} [satellite]
 * @property {number | null} [frp]
 */

/**
 * @typedef {Object} PlacePrediction
 * @property {string} place_id
 * @property {string} description
 */

// Note: The `declare global { namespace google {...} }` block from types.ts is specific to TypeScript's
// global scope augmentation for type checking. It doesn't translate directly to a JS runtime artifact.
// JavaScript code will interact with the Google Maps API via `window.google.maps.*` after the API script loads.
// For JSDoc, you might document `window.google.maps.Map` etc. if needed, or rely on developers knowing the API.
