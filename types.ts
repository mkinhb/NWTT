// Fix: Comment out the triple-slash directive. If @types/google.maps is not available or resolvable
// in the environment, this directive will cause a "Cannot find type definition file" error.
// Manual type declarations for google.maps are provided below as a workaround.
// /// <reference types="google.maps" />

export type UserRole = 'user' | 'staff' | 'admin';

export interface User {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

export enum WildfireStatus {
  ACTIVE = "Active",
  CONTAINED = "Contained",
  EXTINGUISHED = "Extinguished",
  UNKNOWN = "Unknown", // Added for completeness
}

export enum ApprovalStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export interface Wildfire {
  id: string;
  name: string;
  latitude?: string; 
  longitude?: string; 
  address?: string; 
  status: WildfireStatus | string; 
  location_description: string;
  size_acres: number;
  containment_percentage: number;
  started_date?: string; 
  incident_time: string; 
  last_updated: string; 
  severity?: string;
  
  // New fields for creation approval workflow
  approval_status: ApprovalStatus;
  created_by_user_email?: string; // Email of user who submitted, or 'anonymous'
  reviewed_by_email?: string; // Email of admin/staff who approved/rejected
  reviewed_at?: string; // ISO date string of approval/rejection
  rejection_reason?: string; // Optional reason if rejected
}

// For the incident form, allowing partial data and specific types for form inputs
export type WildfireFormData = Partial<Omit<Wildfire, 'id' | 'last_updated' | 'incident_time' | 'size_acres' | 'containment_percentage' | 'approval_status' | 'created_by_user_email' | 'reviewed_by_email' | 'reviewed_at' | 'rejection_reason'> & {
  size_acres: string | number; 
  containment_percentage: string | number; 
  latitude?: string | number; 
  longitude?: string | number;
  address?: string;
}>;


export interface IncidentUpdate {
  id: string;
  wildfire_id: string;
  wildfire_name?: string; 
  created_at: string; 
  update_type: string;
  update_text: string;
  previous_value?: string;
  new_value?: string;
  reported_by?: string; // This is resolved to user name for display, email stored internally
  mediaUrl?: string; 
  mediaMediaType?: 'image' | 'video'; 
  approval_status: ApprovalStatus;
  reviewed_by?: string; // Email of admin/staff who reviewed, resolved to name for display
  reviewed_at?: string; 
  rejection_reason?: string; 
}

export interface IncidentUpdateFormData {
  update_type: string;
  update_text: string;
  mediaFile?: File | null;
}

// Specific type for items on the ReviewUpdatesPage (for IncidentUpdate)
export interface PendingUpdateItem extends IncidentUpdate {
  wildfire_name: string; 
}

// Specific type for items on the ReviewPendingIncidentsPage (for Wildfire)
export interface PendingWildfireListItem extends Wildfire {
  // Potentially add more specific fields if needed for display on this page
  // For now, it's just a Wildfire object that is pending
}


// FIRMS Hotspot Data Interface
export interface FIRMSHotspot {
  latitude: number;
  longitude: number;
  brightness: number | null; 
  confidence: string | number | null; 
  acq_datetime: string; 
  satellite?: string; 
  frp?: number | null; 
}


export interface PlacePrediction {
  place_id: string;
  description: string;
}

declare global {
  namespace google {
    namespace maps {
      interface Map {
        panTo(latLng: LatLng | LatLngLiteral): void;
        setCenter(latLng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
        getZoom(): number | undefined; 
        fitBounds(bounds: LatLngBounds, padding?: number | any): void; 
        getBounds(): LatLngBounds | null | undefined;
        [key: string]: any; 
      }

      interface LatLng {
        lat(): number;
        lng(): number;
        [key: string]: any;
      }

      interface LatLngBounds {
        extend(point: LatLng | LatLngLiteral): void;
        getCenter(): LatLng;
        [key: string]: any;
      }

      interface Geocoder {
        geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void): void;
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        styles?: any[]; 
        mapTypeControl?: boolean;
        mapTypeControlOptions?: MapTypeControlOptions;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
        mapId?: string; 
      }
      
      interface GeocoderRequest {
        placeId?: string;
        address?: string;
        location?: LatLng | LatLngLiteral;
      }

      interface GeocoderResult {
        formatted_address: string;
        geometry: {
          location: LatLng;
          location_type: string; 
          viewport: LatLngBounds;
        };
        place_id: string;
        types: string[];
        [key: string]: any;
      }
      
      interface LatLngLiteral { lat: number; lng: number; }
      interface IconSymbol { 
          path: SymbolPath | string; 
          fillColor?: string;
          fillOpacity?: number;
          strokeColor?: string;
          strokeWeight?: number;
          scale?: number;
          anchor?: Point;
          labelOrigin?: Point;
          rotation?: number;
      }
      interface Point { x: number; y: number; } 

      interface MapTypeControlOptions{
        style?: MapTypeControlStyle;
        position?: ControlPosition;
      }
      
      interface Size {
         height: number;
         width: number;
         equals(other: Size): boolean;
         toString(): string;
      }
      interface Icon {
        anchor?: Point;
        labelOrigin?: Point;
        origin?: Point;
        scaledSize?: Size;
        size?: Size;
        url: string;
      }

      enum SymbolPath {
        CIRCLE,
      }
      enum MapTypeControlStyle {
        DEFAULT,
        DROPDOWN_MENU,
        HORIZONTAL_BAR,
      }
      enum ControlPosition {
        BOTTOM_CENTER = 0,
        BOTTOM_LEFT = 1,
        BOTTOM_RIGHT = 2,
        LEFT_BOTTOM = 3,
        LEFT_CENTER = 4,
        LEFT_TOP = 5,
        RIGHT_BOTTOM = 6,
        RIGHT_CENTER = 7,
        RIGHT_TOP = 8,
        TOP_CENTER = 9,
        TOP_LEFT = 10,
        TOP_RIGHT = 11,
      }
      enum GeocoderStatus {
        OK = "OK",
        ERROR = "ERROR",
        INVALID_REQUEST = "INVALID_REQUEST",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
        ZERO_RESULTS = "ZERO_RESULTS",
      }

      namespace places {
        interface AutocompletePrediction {
          description: string;
          place_id: string;
          matched_substrings?: any[];
          structured_formatting?: any;
          terms?: any[];
          types?: string[];
          [key:string]: any;
        }

        interface AutocompleteOptions {
          bounds?: LatLngBounds | LatLngBoundsLiteral;
          componentRestrictions?: ComponentRestrictions;
          fields?: string[];
          strictBounds?: boolean;
          types?: string[];
          placeIdOnly?: boolean;
          [key: string]: any; 
        }

        interface ComponentRestrictions {
          country: string | string[];
        }
        
        interface LatLngBoundsLiteral {
            east: number;
            north: number;
            south: number;
            west: number;
        }
        
        interface Autocomplete {
          getPlace(): PlaceResult;
          getBounds(): LatLngBounds | undefined;
          setBounds(bounds: LatLngBounds | LatLngBoundsLiteral | undefined | null): void;
          setComponentRestrictions(restrictions: ComponentRestrictions | undefined | null): void;
          setFields(fields: string[] | undefined | null): void;
          setOptions(options: AutocompleteOptions): void;
          setTypes(types: string[] | undefined | null): void;
          addListener(eventName: string, handler: () => void): event.MapsEventListener;
        }

        const Autocomplete: {
          new(inputElement: HTMLInputElement, opts?: AutocompleteOptions): Autocomplete;
        };

        interface PlaceResult {
            address_components?: GeocoderAddressComponent[];
            adr_address?: string;
            formatted_address?: string;
            geometry?: PlaceGeometry;
            icon?: string;
            name?: string;
            place_id?: string;
        }
        interface PlaceGeometry {
            location: LatLng;
            viewport: LatLngBounds;
        }
        interface GeocoderAddressComponent {
            long_name: string;
            short_name: string;
            types: string[];
        }
      } 

      namespace event {
        function addListener(instance: any, eventName: string, handler: (...args: any[]) => void): MapsEventListener;
        interface MapsEventListener { remove: () => void; }
      }

      namespace marker {
        interface PinElementOptions {
            background?: string;
            borderColor?: string;
            glyph?: string | URL | HTMLElement | SVGElement;
            glyphColor?: string;
            scale?: number;
            [key: string]: any; 
        }
        interface PinElement {
            element: HTMLElement; 
        }
        const PinElement: { 
            new(options?: PinElementOptions): PinElement;
        };

        interface AdvancedMarkerElementOptions {
            map?: Map | null;
            position?: LatLng | LatLngLiteral | null;
            content?: HTMLElement | null;
            title?: string;
            gmpDraggable?: boolean;
            zIndex?: number;
            [key: string]: any; 
        }
        
        interface AdvancedMarkerElement extends Omit<HTMLElement, 'title'> { 
            map?: Map | null;
            position?: LatLng | LatLngLiteral | null;
            content?: HTMLElement | null;
            title?: string;
            gmpDraggable?: boolean;
            element: HTMLElement; 
        }
         const AdvancedMarkerElement: { 
            new(options?: AdvancedMarkerElementOptions): AdvancedMarkerElement;
        };
      }
      
      interface Data {
        add(feature: Feature | FeatureOptions): Feature;
        addGeoJson(geoJson: object, options?: GeoJsonOptions): Feature[];
        contains(feature: Feature): boolean;
        forEach(callback: (feature: Feature) => void): void;
        getControlPosition(): ControlPosition;
        getControls(): string[] | null;
        getDrawingMode(): string | null;
        getFeatureById(id: string | number): Feature | undefined;
        getMap(): Map | null;
        getStyle(): StylingFunction | StyleOptions | null;
        loadGeoJson(
          url: string,
          options?: GeoJsonOptions | null,
          callback?: (features: Feature[]) => void
        ): void;
        overrideStyle(feature: Feature, style: StyleOptions): void;
        remove(feature: Feature): void;
        revertStyle(feature?: Feature): void;
        setControlPosition(controlPosition: ControlPosition): void;
        setControls(controls: string[] | null): void;
        setDrawingMode(drawingMode: string | null): void;
        setMap(map: Map | null): void;
        setStyle(style: StylingFunction | StyleOptions | null): void;
        toGeoJson(callback: (geoJson: object) => void): void;
        addListener(eventName: string, handler: (event: DataMouseEvent | DataAddFeatureEvent | DataRemoveFeatureEvent | DataSetGeometryEvent | DataSetPropertyEvent | DataRemovePropertyEvent) => void): event.MapsEventListener;
      }

      interface DataOptions {
        controlPosition?: ControlPosition;
        controls?: string[] | null;
        drawingMode?: string | null;
        featureFactory?: ((geometry: Geometry) => Feature) | undefined;
        map?: Map | null;
        style?: StyleOptions | StylingFunction;
      }

      interface FeatureOptions {
        geometry?: Geometry | LatLng | LatLngLiteral;
        id?: string | number;
        properties?: object | null;
      }
      
      interface Feature { 
        forEachProperty(callback: (value: any, name: string) => void): void;
        getGeometry(): Geometry | null;
        getId(): string | number | undefined;
        getProperty(name: string): any;
        removeProperty(name: string): void;
        setGeometry(newGeometry: Geometry | LatLng | LatLngLiteral | null): void;
        setProperty(name: string, newValue: any): void;
        toGeoJson(callback: (geoJsonFeature: object) => void): void;
      }

      interface GeoJsonOptions {
        idPropertyName?: string | null;
      }

      interface StyleOptions {
        clickable?: boolean;
        cursor?: string;
        draggable?: boolean;
        editable?: boolean;
        fillColor?: string;
        fillOpacity?: number;
        icon?: string | Icon | IconSymbol; 
        shape?: MarkerShape;
        strokeColor?: string;
        strokeOpacity?: number;
        strokePosition?: number; 
        strokeWeight?: number;
        title?: string;
        visible?: boolean;
        zIndex?: number;
      }

      type StylingFunction = (feature: Feature) => StyleOptions;

      interface Geometry { 
        getType(): string; 
        forEachLatLng?(callback: (latLng: LatLng) => void): void;
      }
      
      interface MarkerShape {
        coords?: number[];
        type?: string; 
      }

      interface DataMouseEvent { 
        feature: Feature;
        latLng?: LatLng;
      }
      interface DataAddFeatureEvent { 
        feature: Feature;
      }
      interface DataRemoveFeatureEvent { 
        feature: Feature;
      }
      interface DataSetGeometryEvent { 
        feature: Feature;
        newGeometry: Geometry | null;
        oldGeometry: Geometry | null;
      }
      interface DataSetPropertyEvent { 
        feature: Feature;
        name: string;
        newValue: any;
        oldValue: any;
      }
      interface DataRemovePropertyEvent { 
        feature: Feature;
        name: string;
        oldValue: any;
      }


      const Map: {
        new(mapDiv: HTMLElement | null, opts?: MapOptions): Map; 
      };
      const LatLng: {
        new(lat: number, lng: number, noWrap?: boolean): LatLng;
      };
      const LatLngBounds: {
        new(sw?: LatLng | LatLngLiteral | null, ne?: LatLng | LatLngLiteral | null): LatLngBounds;
      };
      const Geocoder: {
        new(): Geocoder;
      };
      const Size: {
        new(width: number, height: number, widthUnit?: string, heightUnit?: string): Size;
      };
      const Data: { 
        new(options?: DataOptions | null): Data; 
        Feature: {
            new(options?: FeatureOptions): Feature;
        };
      };
    }
  }

  interface Window {
    google?: typeof google; 
    initMapGloballyForFirewatch?: () => void;
  }
}


export type GoogleMap = google.maps.Map;
export type GoogleLatLng = google.maps.LatLng;
export type GoogleAdvancedMarker = google.maps.marker.AdvancedMarkerElement; 
export type GoogleLatLngBounds = google.maps.LatLngBounds;
export type GooglePlacesAutocompletePrediction = google.maps.places.AutocompletePrediction;
export type GoogleGeocoderResult = google.maps.GeocoderResult;
export type GoogleData = google.maps.Data; 
export type GoogleDataFeature = google.maps.Feature; 

export type GoogleGeocoderStatus =
  | google.maps.GeocoderStatus.OK
  | google.maps.GeocoderStatus.ERROR
  | google.maps.GeocoderStatus.INVALID_REQUEST
  | google.maps.GeocoderStatus.OVER_QUERY_LIMIT
  | google.maps.GeocoderStatus.REQUEST_DENIED
  | google.maps.GeocoderStatus.UNKNOWN_ERROR
  | google.maps.GeocoderStatus.ZERO_RESULTS;


// API Response Types
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface SingleWildfireResponse {
    wildfire?: Wildfire;
    error?: string;
}

export interface MutateWildfireResponse {
    wildfire?: Wildfire;
    success: boolean;
    message?: string;
    error?: string;
}

export interface IncidentUpdatesResponse { 
    updates: IncidentUpdate[];
    error?: string;
}

export interface PendingUpdatesResponse { 
    updates: PendingUpdateItem[]; 
    error?: string;
}

export interface PendingWildfiresResponse { // New response type for pending wildfires
    wildfires: Wildfire[];
    error?: string;
}

export interface ApproveRejectWildfireResponse { // New response type for approving/rejecting wildfires
    wildfire?: Wildfire;
    success: boolean;
    message?: string;
    error?: string;
}


export interface MutateIncidentUpdateResponse {
    update?: IncidentUpdate;
    success: boolean;
    message?: string;
    error?: string;
}

export interface ApproveRejectUpdateResponse {
    update?: IncidentUpdate; 
    success: boolean;
    message?: string;
    error?: string;
}
