export type UserRole = 'admin' | 'hospital_staff' | 'ambulance_driver' | 'normal_user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string; // e.g. 'hosp-a', 'amb-101'
  phone?: string;
  token?: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  address: string;
  lat: number;
  lng: number;
  status: 'approved' | 'pending' | 'suspended';
  capabilities: {
    icuBedsTotal: number;
    icuBedsAvailable: number;
    traumaLevel: 1 | 2 | 3;
    cardiacCathLab: boolean;
    neuroSurgery: boolean;
    burnUnit: boolean;
    pediatricICU: boolean;
  };
  contactPhone: string;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverName: string;
  assignedHospitalId: string;
  status: 'available' | 'on_route' | 'returning' | 'maintenance';
  currentLat: number;
  currentLng: number;
  speedKmH: number;
  batteryLevel: number;
  gpsAccuracyMeters: number;
  lastHeartbeat: string;
}

export type LEDState = 
  | 'IDLE'
  | 'ROUTE_AUTHORIZED'
  | 'CHECKPOINT_ACTIVE'
  | 'AMBULANCE_APPROACHING'
  | 'AMBULANCE_PASSED'
  | 'CHECKPOINT_FAULT'
  | 'ROUTE_CANCELLED'
  | 'COMPLETED';

export interface Checkpoint {
  id: string;
  name: string;
  junctionNumber: number;
  lat: number;
  lng: number;
  roadSegment: string;
  ledPin: number; // e.g. GPIO 18
  ledState: LEDState;
  ledColor: 'off' | 'green' | 'amber' | 'red' | 'strobe';
  cameraStatus: 'online' | 'degraded' | 'offline';
  inferenceLatencyMs: number;
  vehicleCount: number;
  trafficDensity: 'low' | 'medium' | 'high';
  ambulanceDetected: boolean;
  detectionConfidence: number;
  isPassed: boolean;
  isActiveNext: boolean;
  lastDetectionTime?: string;
}

export type TransferPriority = 'CRITICAL_TRAUMA' | 'CARDIAC_ARREST' | 'STROKE_CODE_FAST' | 'URGENT_TRANSFER' | 'STABLE_MONITORED';

export interface PatientTransfer {
  id: string; // e.g. "TRF-2026-8819"
  patientIdHash: string; // Pseudonymized reference for privacy
  syntheticName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  conditionSummary: string;
  priority: TransferPriority;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    spO2: number;
    respiratoryRate: number;
  };
  sendingHospitalId: string;
  receivingHospitalId: string;
  assignedAmbulanceId: string;
  status: 'requested' | 'route_active' | 'rerouted' | 'approaching_destination' | 'arrived' | 'completed' | 'cancelled';
  receivingHospitalStatus: 'pending' | 'acknowledged' | 'team_preparing' | 'ready_to_receive' | 'unable_to_accept';
  receivingNotes?: string;
  routeId: string;
  activeCheckpointIndex: number;
  isRerouted: boolean;
  rerouteReason?: string;
  originalEtaMinutes: number;
  currentEtaMinutes: number;
  createdAt: string;
  completedAt?: string;
  securityNonce: string;
  signatureHmac: string;
}

export interface NormalUserEmergencyRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  locationName: string;
  lat: number;
  lng: number;
  emergencyType: 'Medical' | 'Vehicle Accident' | 'Cardiac' | 'Severe Injury' | 'Other';
  description: string;
  status: 'SUBMITTED' | 'AWAITING_VERIFICATION' | 'VERIFIED_DISPATCHED' | 'REJECTED' | 'COMPLETED';
  verificationNotes?: string;
  assignedAmbulanceId?: string;
  createdAt: string;
  processedByAdminId?: string;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  eventType: 
    | 'REPLAY_ATTACK_DETECTED'
    | 'UNAUTHORIZED_PATIENT_ACCESS_ATTEMPT'
    | 'HMAC_SIGNATURE_MISMATCH'
    | 'RATE_LIMIT_EXCEEDED'
    | 'DEVICE_AUTH_FAILURE'
    | 'UNAUTHORIZED_LED_OVERRIDE_ATTEMPT'
    | 'ROLE_ESCALATION_ATTEMPT';
  actorIp: string;
  userId?: string;
  description: string;
  mitigationAction: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  portal: 'Admin' | 'Hospital' | 'Ambulance' | 'NormalUser' | 'EdgeDevice';
  action: string;
  performedBy: string;
  targetResource: string;
  outcome: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  integrityHash: string;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  type: 
    | 'TRANSFER_INITIATED'
    | 'HOSPITAL_ACKNOWLEDGED'
    | 'CHECKPOINT_ACTIVATED'
    | 'AMBULANCE_APPROACHING'
    | 'CHECKPOINT_PASSED'
    | 'CONGESTION_ALERT'
    | 'ROUTE_RECALCULATED'
    | 'EMERGENCY_REQUEST_SUBMITTED'
    | 'EMERGENCY_REQUEST_APPROVED'
    | 'PATIENT_ARRIVED'
    | 'SECURITY_ALERT';
  message: string;
  targetRoles: UserRole[]; // RBAC event delivery
  metadata?: Record<string, unknown>;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
}

export interface RouteOption {
  id: string;
  name: string;
  waypoints: RoutePoint[];
  totalDistanceKm: number;
  freeFlowTimeMin: number;
  currentEstimatedTimeMin: number;
  checkpoints: string[]; // checkpoint IDs on this route
  congestionScore: number; // 0 to 100
}

export interface MLModelMetrics {
  modelName: string;
  algorithm: string;
  featuresUsed: string[];
  trainingSamples: number;
  testSamples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  maeMinutes: number;
  confusionMatrix: {
    classes: ['Low', 'Medium', 'High'];
    matrix: number[][];
  };
  baselineRuleAccuracy: number;
}
