import {
  Hospital,
  Ambulance,
  Checkpoint,
  PatientTransfer,
  NormalUserEmergencyRequest,
  User,
  LEDState,
  SystemEvent,
  UserRole
} from '../types';
import { ROAD_NODES, getPrimaryRoute, getAlternativeBypassRoute } from './routing';
import { runEdgeCameraInference } from './mlEngine';
import { logAudit, generateNonce, generateHmacSignature } from './security';

// In-Memory Database store with reactive listeners
class DatabaseStore {
  public users: User[] = [
    {
      id: 'usr_admin_01',
      name: 'Dr. Ananya Sen',
      email: 'admin@trafficai.gov',
      role: 'admin',
      phone: '+91 98100 22311'
    },
    {
      id: 'usr_hosp_a',
      name: 'Dr. R. Sharma (HOD Trauma)',
      email: 'trauma.lead@metrogeneral.org',
      role: 'hospital_staff',
      organizationId: 'hosp_a',
      phone: '+91 98111 44552'
    },
    {
      id: 'usr_hosp_b',
      name: 'Dr. V. Mehta (Chief Neuro/Receiving)',
      email: 'emergency.intake@apextrauma.org',
      role: 'hospital_staff',
      organizationId: 'hosp_b',
      phone: '+91 98222 77889'
    },
    {
      id: 'usr_amb_101',
      name: 'Rajesh Kumar (Lead Paramedic)',
      email: 'rajesh.amb101@rapidrescue.org',
      role: 'ambulance_driver',
      organizationId: 'AMB-101',
      phone: '+91 98333 55112'
    },
    {
      id: 'usr_citizen_01',
      name: 'Vikram Malhotra (Commuter)',
      email: 'vikram.commuter@gmail.com',
      role: 'normal_user',
      phone: '+91 98444 88990'
    }
  ];

  public hospitals: Hospital[] = [
    {
      id: 'hosp_a',
      name: 'Metro City General Hospital (Hospital A - Sending)',
      code: 'MCGH-A',
      address: 'Plot 4, Medical Enclave, Connaught Outer Ring',
      lat: ROAD_NODES.HOSP_A.lat,
      lng: ROAD_NODES.HOSP_A.lng,
      status: 'approved',
      capabilities: {
        icuBedsTotal: 28,
        icuBedsAvailable: 4,
        traumaLevel: 2,
        cardiacCathLab: true,
        neuroSurgery: false, // Needs transfer to Hospital B for emergency neurosurgical craniotomy!
        burnUnit: false,
        pediatricICU: true
      },
      contactPhone: '+91 11 2341 5500'
    },
    {
      id: 'hosp_b',
      name: 'Apex Trauma & Research Institute (Hospital B - Receiving)',
      code: 'ATRI-B',
      address: 'Sector 12, Expressway Hub, South Campus',
      lat: ROAD_NODES.HOSP_B.lat,
      lng: ROAD_NODES.HOSP_B.lng,
      status: 'approved',
      capabilities: {
        icuBedsTotal: 52,
        icuBedsAvailable: 14,
        traumaLevel: 1,
        cardiacCathLab: true,
        neuroSurgery: true, // Dedicated Neuro ICU + 24/7 OT
        burnUnit: true,
        pediatricICU: true
      },
      contactPhone: '+91 11 2685 9900'
    },
    {
      id: 'hosp_c',
      name: 'St. Jude Community Health Center',
      code: 'SJHC-C',
      address: 'Old Cantonment Road, Junction 1 Spur',
      lat: 28.6250,
      lng: 77.2400,
      status: 'approved',
      capabilities: {
        icuBedsTotal: 16,
        icuBedsAvailable: 2,
        traumaLevel: 3,
        cardiacCathLab: false,
        neuroSurgery: false,
        burnUnit: false,
        pediatricICU: false
      },
      contactPhone: '+91 11 2450 1122'
    }
  ];

  public ambulances: Ambulance[] = [
    {
      id: 'AMB-101',
      vehicleNumber: 'DL-1T-AA-4092 (ACLS ICU)',
      driverName: 'Rajesh Kumar',
      assignedHospitalId: 'hosp_a',
      status: 'available',
      currentLat: ROAD_NODES.HOSP_A.lat,
      currentLng: ROAD_NODES.HOSP_A.lng,
      speedKmH: 0,
      batteryLevel: 98,
      gpsAccuracyMeters: 2.1,
      lastHeartbeat: new Date().toLocaleTimeString()
    },
    {
      id: 'AMB-102',
      vehicleNumber: 'DL-1T-BB-1120 (Trauma Mobile)',
      driverName: 'Priya Nair',
      assignedHospitalId: 'hosp_b',
      status: 'available',
      currentLat: ROAD_NODES.HOSP_B.lat,
      currentLng: ROAD_NODES.HOSP_B.lng,
      speedKmH: 0,
      batteryLevel: 94,
      gpsAccuracyMeters: 3.0,
      lastHeartbeat: new Date().toLocaleTimeString()
    },
    {
      id: 'AMB-103',
      vehicleNumber: 'DL-1T-CC-7890 (Cardiac Support)',
      driverName: 'Amit Verma',
      assignedHospitalId: 'hosp_a',
      status: 'available',
      currentLat: ROAD_NODES.HOSP_A.lat,
      currentLng: ROAD_NODES.HOSP_A.lng,
      speedKmH: 0,
      batteryLevel: 88,
      gpsAccuracyMeters: 2.5,
      lastHeartbeat: new Date().toLocaleTimeString()
    }
  ];

  public checkpoints: Checkpoint[] = [
    {
      id: 'CP-1',
      name: 'Camera 1 / Junction 1 (St. Jude Crossing)',
      junctionNumber: 1,
      lat: ROAD_NODES.J1.lat,
      lng: ROAD_NODES.J1.lng,
      roadSegment: 'Grand Trunk Arterial',
      ledPin: 18, // ESP32 GPIO 18
      ledState: 'IDLE',
      ledColor: 'off',
      cameraStatus: 'online',
      inferenceLatencyMs: 14.2,
      vehicleCount: 12,
      trafficDensity: 'low',
      ambulanceDetected: false,
      detectionConfidence: 0.0,
      isPassed: false,
      isActiveNext: false
    },
    {
      id: 'CP-2',
      name: 'Camera 2 / Junction 2 (Central Boulevard)',
      junctionNumber: 2,
      lat: ROAD_NODES.J2.lat,
      lng: ROAD_NODES.J2.lng,
      roadSegment: 'Central Boulevard Corridor',
      ledPin: 19, // ESP32 GPIO 19
      ledState: 'IDLE',
      ledColor: 'off',
      cameraStatus: 'online',
      inferenceLatencyMs: 16.5,
      vehicleCount: 18,
      trafficDensity: 'low',
      ambulanceDetected: false,
      detectionConfidence: 0.0,
      isPassed: false,
      isActiveNext: false
    },
    {
      id: 'CP-3',
      name: 'Camera 3 / Junction 3 (North Expressway Flyover)',
      junctionNumber: 3,
      lat: ROAD_NODES.J3.lat,
      lng: ROAD_NODES.J3.lng,
      roadSegment: 'Flyover Arterial North',
      ledPin: 21, // ESP32 GPIO 21
      ledState: 'IDLE',
      ledColor: 'off',
      cameraStatus: 'online',
      inferenceLatencyMs: 13.8,
      vehicleCount: 14,
      trafficDensity: 'low',
      ambulanceDetected: false,
      detectionConfidence: 0.0,
      isPassed: false,
      isActiveNext: false
    },
    {
      id: 'CP-4',
      name: 'Camera 4 / Junction 4 (Apex Trauma Gateway)',
      junctionNumber: 4,
      lat: ROAD_NODES.J4.lat,
      lng: ROAD_NODES.J4.lng,
      roadSegment: 'Expressway South Approach',
      ledPin: 22, // ESP32 GPIO 22
      ledState: 'IDLE',
      ledColor: 'off',
      cameraStatus: 'online',
      inferenceLatencyMs: 15.0,
      vehicleCount: 10,
      trafficDensity: 'low',
      ambulanceDetected: false,
      detectionConfidence: 0.0,
      isPassed: false,
      isActiveNext: false
    }
  ];

  public activeTransfer: PatientTransfer | null = null;

  public emergencyRequests: NormalUserEmergencyRequest[] = [
    {
      id: 'REQ-2026-091',
      userId: 'usr_citizen_01',
      userName: 'Vikram Malhotra',
      userPhone: '+91 98444 88990',
      locationName: 'Opposite Ring Road Fuel Station, Outer Sector 8',
      lat: 28.6180,
      lng: 77.2100,
      emergencyType: 'Vehicle Accident',
      description: 'Motorbike collision with car; two injured individuals conscious on roadside; traffic slowing down.',
      status: 'AWAITING_VERIFICATION',
      verificationNotes: 'Pending dispatch assessment: Nearby police unit contacted for confirmation.',
      createdAt: new Date(Date.now() - 15 * 60000).toLocaleTimeString()
    }
  ];

  public events: SystemEvent[] = [
    {
      id: 'EVT-001',
      timestamp: new Date(Date.now() - 20 * 60000).toLocaleTimeString(),
      type: 'SECURITY_ALERT',
      message: 'ESP32 LED Controller Heartbeat verified (Ping 12ms, 0% packet loss).',
      targetRoles: ['admin']
    }
  ];

  // IoT Controller State
  public esp32Status = {
    ipAddress: '192.168.1.189',
    macAddress: '24:6F:28:B4:9A:1C',
    firmwareVersion: 'v2.4.1-EdgeAI-Secured',
    status: 'online' as 'online' | 'degraded' | 'offline',
    lastHeartbeatMs: Date.now(),
    wifiRssiDbm: -58,
    activePins: [18, 19, 21, 22],
    testModeActive: false,
    packetsSent: 4210,
    packetsAcknowledged: 4208,
    lastCommandId: 'CMD-INIT-001'
  };

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- ACTIONS ---

  public emitEvent(
    type: SystemEvent['type'],
    message: string,
    targetRoles: UserRole[],
    metadata?: Record<string, unknown>
  ) {
    const event: SystemEvent = {
      id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      targetRoles,
      metadata
    };
    this.events = [event, ...this.events.slice(0, 49)];
    this.notify();
  }

  public async initiatePatientTransfer(payload: {
    syntheticName: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    conditionSummary: string;
    priority: PatientTransfer['priority'];
    assignedAmbulanceId: string;
    receivingHospitalId: string;
    vitals: PatientTransfer['vitalSigns'];
    notes: string;
  }): Promise<PatientTransfer> {
    const nonce = generateNonce();
    const primaryRoute = getPrimaryRoute();
    const rawSignaturePayload = `${payload.assignedAmbulanceId}:${payload.receivingHospitalId}:${nonce}`;
    const hmac = await generateHmacSignature(rawSignaturePayload);

    const newTransfer: PatientTransfer = {
      id: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientIdHash: `EHR-HASH-${Math.floor(100000 + Math.random() * 900000)}`,
      syntheticName: payload.syntheticName,
      age: payload.age,
      gender: payload.gender,
      conditionSummary: payload.conditionSummary,
      priority: payload.priority,
      vitalSigns: payload.vitals,
      sendingHospitalId: 'hosp_a',
      receivingHospitalId: payload.receivingHospitalId,
      assignedAmbulanceId: payload.assignedAmbulanceId,
      status: 'route_active',
      receivingHospitalStatus: 'acknowledged',
      receivingNotes: payload.notes,
      routeId: primaryRoute.id,
      activeCheckpointIndex: 0,
      isRerouted: false,
      originalEtaMinutes: primaryRoute.currentEstimatedTimeMin,
      currentEtaMinutes: primaryRoute.currentEstimatedTimeMin,
      createdAt: new Date().toLocaleTimeString(),
      securityNonce: nonce,
      signatureHmac: hmac
    };

    this.activeTransfer = newTransfer;

    // Update ambulance status
    const amb = this.ambulances.find(a => a.id === payload.assignedAmbulanceId);
    if (amb) {
      amb.status = 'on_route';
      amb.speedKmH = 52;
    }

    // Reset checkpoints to clean state
    this.checkpoints.forEach((cp, idx) => {
      cp.isPassed = false;
      cp.ambulanceDetected = false;
      if (idx === 0) {
        cp.isActiveNext = true;
        cp.ledState = 'CHECKPOINT_ACTIVE';
        cp.ledColor = 'strobe'; // LED 1 is activated!
      } else {
        cp.isActiveNext = false;
        cp.ledState = 'ROUTE_AUTHORIZED';
        cp.ledColor = 'off';
      }
    });

    await logAudit(
      'Hospital',
      'TRANSFER_CONFIRMED_START_EMERGENCY_ROUTE',
      'usr_hosp_a',
      newTransfer.id,
      'SUCCESS'
    );

    this.emitEvent(
      'TRANSFER_INITIATED',
      `Emergency route initiated for ${newTransfer.syntheticName} (${newTransfer.priority}) to Apex Trauma Center. LED 1 activated on GPIO 18.`,
      ['admin', 'hospital_staff', 'ambulance_driver']
    );

    this.emitEvent(
      'CHECKPOINT_ACTIVATED',
      `Checkpoint 1 (St. Jude Junction) LED Clearance ACTIVE. Emergency priority corridor established.`,
      ['admin', 'hospital_staff', 'ambulance_driver', 'normal_user']
    );

    this.notify();
    return newTransfer;
  }

  /**
   * Simulate camera detection and vehicle passage at a checkpoint
   */
  public async advanceCheckpoint(checkpointIndex: number) {
    if (!this.activeTransfer) return;
    const cp = this.checkpoints[checkpointIndex];
    if (!cp) return;

    // Run simulated Computer Vision + ML inference
    const inference = runEdgeCameraInference(cp.id, cp.vehicleCount, 45);
    cp.inferenceLatencyMs = inference.inferenceTimeMs;
    cp.detectionConfidence = 0.94;
    cp.ambulanceDetected = true;
    cp.isPassed = true;
    cp.isActiveNext = false;
    cp.ledState = 'AMBULANCE_PASSED';
    cp.ledColor = 'green'; // Cleared
    cp.lastDetectionTime = new Date().toLocaleTimeString();

    // Move ambulance GPS coordinate to this checkpoint
    const amb = this.ambulances.find(a => a.id === this.activeTransfer?.assignedAmbulanceId);
    if (amb) {
      amb.currentLat = cp.lat;
      amb.currentLng = cp.lng;
      amb.lastHeartbeat = new Date().toLocaleTimeString();
    }

    this.emitEvent(
      'CHECKPOINT_PASSED',
      `Ambulance validated & passed ${cp.name}. LED ${cp.junctionNumber} (GPIO ${cp.ledPin}) turned OFF safely.`,
      ['admin', 'hospital_staff', 'ambulance_driver', 'normal_user']
    );

    // Turn off passed LED after brief clearance
    setTimeout(() => {
      cp.ledColor = 'off';
      this.notify();
    }, 1500);

    // Activate next checkpoint if exists
    const nextIndex = checkpointIndex + 1;
    if (nextIndex < this.checkpoints.length) {
      const nextCp = this.checkpoints[nextIndex];
      nextCp.isActiveNext = true;
      nextCp.ledState = 'CHECKPOINT_ACTIVE';
      nextCp.ledColor = 'strobe';
      this.activeTransfer.activeCheckpointIndex = nextIndex;

      // Update ETA
      this.activeTransfer.currentEtaMinutes = Math.max(1.5, Number((this.activeTransfer.currentEtaMinutes - 2.2).toFixed(1)));

      this.emitEvent(
        'CHECKPOINT_ACTIVATED',
        `Checkpoint ${nextCp.junctionNumber} (${nextCp.name}) activated on GPIO ${nextCp.ledPin}. Clearance strobe initiated.`,
        ['admin', 'hospital_staff', 'ambulance_driver', 'normal_user']
      );
    } else {
      // Reached Hospital B!
      this.activeTransfer.status = 'arrived';
      this.activeTransfer.currentEtaMinutes = 0;
      if (amb) {
        amb.currentLat = ROAD_NODES.HOSP_B.lat;
        amb.currentLng = ROAD_NODES.HOSP_B.lng;
        amb.speedKmH = 0;
      }
      this.emitEvent(
        'PATIENT_ARRIVED',
        `Ambulance successfully arrived at Hospital B (Apex Trauma). Handover awaiting receiving physician sign-off.`,
        ['admin', 'hospital_staff', 'ambulance_driver']
      );
    }

    await logAudit(
      'EdgeDevice',
      'CHECKPOINT_PASSAGE_VALIDATED',
      `CAMERA_${cp.junctionNumber}_AI`,
      cp.id,
      'SUCCESS'
    );

    this.notify();
  }

  /**
   * Simulate edge congestion detection at Camera 2 and trigger dynamic Dijkstra rerouting
   */
  public async triggerCongestionAndReroute() {
    if (!this.activeTransfer) return;

    const cp2 = this.checkpoints[1]; // Junction 2
    cp2.vehicleCount = 42;
    cp2.trafficDensity = 'high';
    const inference = runEdgeCameraInference(cp2.id, 42, 12);
    cp2.inferenceLatencyMs = inference.inferenceTimeMs;

    // Recalculate route using Dijkstra alternative
    const altRoute = getAlternativeBypassRoute();
    this.activeTransfer.isRerouted = true;
    this.activeTransfer.routeId = altRoute.id;
    this.activeTransfer.rerouteReason = 'Camera 2 AI detected 42 stalled vehicles (88% jam density). Smart Ring Road Bypass saves 4.2 mins.';
    this.activeTransfer.currentEtaMinutes = Number((this.activeTransfer.currentEtaMinutes - 3.5).toFixed(1));

    // Safely deactivate obsolete Checkpoint 2 LED
    cp2.ledState = 'ROUTE_CANCELLED';
    cp2.ledColor = 'off';
    cp2.isActiveNext = false;

    // Move sequence to Checkpoint 3 (which rejoins from bypass)
    const cp3 = this.checkpoints[2];
    cp3.isActiveNext = true;
    cp3.ledState = 'CHECKPOINT_ACTIVE';
    cp3.ledColor = 'strobe';
    this.activeTransfer.activeCheckpointIndex = 2;

    this.emitEvent(
      'CONGESTION_ALERT',
      `Edge Camera 2 detected heavy bottleneck on Central Boulevard (estimated delay +7 mins).`,
      ['admin', 'hospital_staff', 'ambulance_driver']
    );

    this.emitEvent(
      'ROUTE_RECALCULATED',
      `Dynamic Reroute Activated: Diverted via Transit Arc Bypass. Obsolete Checkpoint 2 LED deactivated safely. Checkpoint 3 armed.`,
      ['admin', 'hospital_staff', 'ambulance_driver', 'normal_user']
    );

    await logAudit(
      'EdgeDevice',
      'DYNAMIC_REROUTE_ENGINE_TRIGGERED',
      'DIJKSTRA_ROUTING_SERVICE',
      altRoute.id,
      'SUCCESS'
    );

    this.notify();
  }

  /**
   * Hospital B acknowledges patient receipt and completes transfer
   */
  public async completeTransfer() {
    if (!this.activeTransfer) return;

    this.activeTransfer.status = 'completed';
    this.activeTransfer.completedAt = new Date().toLocaleTimeString();

    const amb = this.ambulances.find(a => a.id === this.activeTransfer?.assignedAmbulanceId);
    if (amb) {
      amb.status = 'available';
    }

    this.checkpoints.forEach(cp => {
      cp.ledState = 'COMPLETED';
      cp.ledColor = 'off';
      cp.isActiveNext = false;
    });

    this.emitEvent(
      'PATIENT_ARRIVED',
      `Patient transfer completed successfully. Trauma team handover signed by Dr. V. Mehta. Fleet released to standby.`,
      ['admin', 'hospital_staff', 'ambulance_driver']
    );

    await logAudit(
      'Hospital',
      'TRANSFER_COMPLETED_HANDOVER_FINALIZED',
      'usr_hosp_b',
      this.activeTransfer.id,
      'SUCCESS'
    );

    this.notify();
  }

  /**
   * Update Hospital B receiving readiness
   */
  public updateReceivingReadiness(status: PatientTransfer['receivingHospitalStatus'], notes?: string) {
    if (!this.activeTransfer) return;
    this.activeTransfer.receivingHospitalStatus = status;
    if (notes) this.activeTransfer.receivingNotes = notes;

    this.emitEvent(
      'HOSPITAL_ACKNOWLEDGED',
      `Hospital B updated intake status to: ${status.toUpperCase().replace(/_/g, ' ')}.`,
      ['admin', 'hospital_staff', 'ambulance_driver']
    );
    this.notify();
  }

  /**
   * Submit emergency request from Normal User
   */
  public async submitEmergencyRequest(data: {
    userId: string;
    userName: string;
    userPhone: string;
    locationName: string;
    lat: number;
    lng: number;
    emergencyType: NormalUserEmergencyRequest['emergencyType'];
    description: string;
  }): Promise<NormalUserEmergencyRequest> {
    const newReq: NormalUserEmergencyRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: data.userId,
      userName: data.userName,
      userPhone: data.userPhone,
      locationName: data.locationName,
      lat: data.lat,
      lng: data.lng,
      emergencyType: data.emergencyType,
      description: data.description,
      status: 'AWAITING_VERIFICATION',
      verificationNotes: 'Dispatched to 24/7 Central Dispatcher for triage & validity confirmation.',
      createdAt: new Date().toLocaleTimeString()
    };

    this.emergencyRequests = [newReq, ...this.emergencyRequests];

    await logAudit(
      'NormalUser',
      'EMERGENCY_REQUEST_SUBMITTED',
      data.userId,
      newReq.id,
      'SUCCESS'
    );

    this.emitEvent(
      'EMERGENCY_REQUEST_SUBMITTED',
      `New emergency request ${newReq.id} received from citizen ${data.userName} (${data.emergencyType}). Awaiting dispatcher authorization.`,
      ['admin']
    );

    this.notify();
    return newReq;
  }

  /**
   * Dispatcher reviews and verifies or rejects user emergency request
   */
  public async reviewEmergencyRequest(
    requestId: string,
    action: 'VERIFY_DISPATCH' | 'REJECT',
    notes: string,
    assignedAmbulanceId?: string
  ) {
    const req = this.emergencyRequests.find(r => r.id === requestId);
    if (!req) return;

    if (action === 'VERIFY_DISPATCH') {
      req.status = 'VERIFIED_DISPATCHED';
      req.verificationNotes = notes;
      req.assignedAmbulanceId = assignedAmbulanceId || 'AMB-102';

      this.emitEvent(
        'EMERGENCY_REQUEST_APPROVED',
        `Emergency Request ${req.id} VERIFIED & AUTHORIZED by Central Dispatch. Ambulance ${req.assignedAmbulanceId} assigned.`,
        ['admin', 'normal_user', 'ambulance_driver']
      );

      await logAudit(
        'Admin',
        'EMERGENCY_REQUEST_VERIFIED_DISPATCHED',
        'usr_admin_01',
        req.id,
        'SUCCESS'
      );
    } else {
      req.status = 'REJECTED';
      req.verificationNotes = notes;

      this.emitEvent(
        'SECURITY_ALERT',
        `Emergency Request ${req.id} REJECTED by Dispatcher. Reason: ${notes}. Unwarranted priority prevention active.`,
        ['admin', 'normal_user']
      );

      await logAudit(
        'Admin',
        'EMERGENCY_REQUEST_REJECTED',
        'usr_admin_01',
        req.id,
        'DENIED'
      );
    }

    this.notify();
  }

  /**
   * ESP32 LED Safe Test Mode toggle (Admin only)
   */
  public toggleESP32TestMode(enabled: boolean) {
    this.esp32Status.testModeActive = enabled;
    if (enabled) {
      this.checkpoints.forEach(cp => {
        cp.ledColor = 'amber';
      });
      this.emitEvent('SECURITY_ALERT', 'ESP32 LED Test Mode ENABLED. All 4 GPIO channels test pulsed.', ['admin']);
    } else {
      this.checkpoints.forEach(cp => {
        if (!this.activeTransfer) {
          cp.ledColor = 'off';
        }
      });
      this.emitEvent('SECURITY_ALERT', 'ESP32 LED Test Mode DISABLED. System returned to operational mode.', ['admin']);
    }
    this.notify();
  }

  /**
   * Reset demonstration to initial state
   */
  public resetDemo() {
    this.activeTransfer = null;
    this.checkpoints.forEach(cp => {
      cp.ledState = 'IDLE';
      cp.ledColor = 'off';
      cp.isPassed = false;
      cp.isActiveNext = false;
      cp.ambulanceDetected = false;
      cp.vehicleCount = cp.junctionNumber === 2 ? 18 : 12;
      cp.trafficDensity = 'low';
      cp.detectionConfidence = 0.0;
    });

    this.ambulances.forEach((amb, idx) => {
      amb.status = 'available';
      amb.speedKmH = 0;
      amb.currentLat = idx === 1 ? ROAD_NODES.HOSP_B.lat : ROAD_NODES.HOSP_A.lat;
      amb.currentLng = idx === 1 ? ROAD_NODES.HOSP_B.lng : ROAD_NODES.HOSP_A.lng;
    });

    this.emitEvent(
      'TRANSFER_INITIATED',
      'Demo environment reset to baseline standby state.',
      ['admin', 'hospital_staff', 'ambulance_driver', 'normal_user']
    );

    this.notify();
  }
}

export const db = new DatabaseStore();
