import { RouteOption, RoutePoint } from '../types';

export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  distanceKm: number;
  baseSpeedKmH: number;
  congestionFactor: number; // 1.0 = free flow, > 1.0 = congested
  roadName: string;
}

export const ROAD_NODES: Record<string, GraphNode> = {
  HOSP_A: { id: 'HOSP_A', name: 'Hospital A (Metro General)', lat: 28.6320, lng: 77.2180 },
  J1: { id: 'J1', name: 'Checkpoint 1 (St. Jude Junction)', lat: 28.6230, lng: 77.2220 },
  J2: { id: 'J2', name: 'Checkpoint 2 (Central Boulevard)', lat: 28.6140, lng: 77.2250 },
  J3: { id: 'J3', name: 'Checkpoint 3 (North Expressway Flyover)', lat: 28.6050, lng: 77.2290 },
  J4: { id: 'J4', name: 'Checkpoint 4 (Apex Trauma Gateway)', lat: 28.5960, lng: 77.2330 },
  HOSP_B: { id: 'HOSP_B', name: 'Hospital B (Apex Trauma Center)', lat: 28.5880, lng: 77.2370 },
  // Alternate Bypass Corridor
  BYPASS_EAST_1: { id: 'BYPASS_EAST_1', name: 'Ring Road East Connector', lat: 28.6210, lng: 77.2360 },
  BYPASS_EAST_2: { id: 'BYPASS_EAST_2', name: 'Transit Bypass Junction', lat: 28.6090, lng: 77.2380 }
};

// Road network edges
export const INITIAL_EDGES: GraphEdge[] = [
  // Primary Route Corridor
  { from: 'HOSP_A', to: 'J1', distanceKm: 1.2, baseSpeedKmH: 45, congestionFactor: 1.0, roadName: 'Grand Trunk Link' },
  { from: 'J1', to: 'J2', distanceKm: 1.4, baseSpeedKmH: 40, congestionFactor: 1.0, roadName: 'Central Boulevard' },
  { from: 'J2', to: 'J3', distanceKm: 1.3, baseSpeedKmH: 50, congestionFactor: 1.0, roadName: 'Flyover Arterial' },
  { from: 'J3', to: 'J4', distanceKm: 1.5, baseSpeedKmH: 50, congestionFactor: 1.0, roadName: 'Expressway South' },
  { from: 'J4', to: 'HOSP_B', distanceKm: 1.1, baseSpeedKmH: 40, congestionFactor: 1.0, roadName: 'Trauma Access Way' },

  // Alternative Bypass Corridor (Bypasses J2 when congested)
  { from: 'J1', to: 'BYPASS_EAST_1', distanceKm: 1.5, baseSpeedKmH: 55, congestionFactor: 1.0, roadName: 'Outer Ring Bypass' },
  { from: 'BYPASS_EAST_1', to: 'BYPASS_EAST_2', distanceKm: 1.4, baseSpeedKmH: 60, congestionFactor: 1.0, roadName: 'High-Speed Transit Arc' },
  { from: 'BYPASS_EAST_2', to: 'J3', distanceKm: 1.1, baseSpeedKmH: 50, congestionFactor: 1.0, roadName: 'J3 Incline Spur' }
];

/**
 * Dijkstra Shortest Path Algorithm weighted by dynamic travel time
 */
export function calculateShortestPath(
  startNodeId: string,
  endNodeId: string,
  edges: GraphEdge[]
): { path: string[]; totalDistanceKm: number; totalTimeMinutes: number } {
  const distances: Record<string, number> = {};
  const travelTimes: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  Object.keys(ROAD_NODES).forEach(nodeId => {
    distances[nodeId] = Infinity;
    travelTimes[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  });

  distances[startNodeId] = 0;
  travelTimes[startNodeId] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;
    let smallestTime = Infinity;

    unvisited.forEach(nodeId => {
      if (travelTimes[nodeId] < smallestTime) {
        smallestTime = travelTimes[nodeId];
        current = nodeId;
      }
    });

    if (current === null || current === endNodeId || smallestTime === Infinity) {
      break;
    }

    unvisited.delete(current);

    // Find outgoing edges
    const neighbors = edges.filter(e => e.from === current);
    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;

      const effectiveSpeedKmH = Math.max(10, edge.baseSpeedKmH / edge.congestionFactor);
      const edgeTimeHours = edge.distanceKm / effectiveSpeedKmH;
      const edgeTimeMinutes = edgeTimeHours * 60;
      const candidateTime = travelTimes[current] + edgeTimeMinutes;

      if (candidateTime < travelTimes[edge.to]) {
        travelTimes[edge.to] = candidateTime;
        distances[edge.to] = distances[current] + edge.distanceKm;
        previous[edge.to] = current;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endNodeId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return {
    path,
    totalDistanceKm: Number((distances[endNodeId] || 0).toFixed(2)),
    totalTimeMinutes: Number((travelTimes[endNodeId] || 0).toFixed(1))
  };
}

/**
 * Convert node array to route waypoints
 */
export function getWaypointsForPath(nodeIds: string[]): RoutePoint[] {
  return nodeIds.map(id => {
    const node = ROAD_NODES[id];
    return {
      lat: node.lat,
      lng: node.lng,
      name: node.name
    };
  });
}

/**
 * Default Primary Route definition
 */
export function getPrimaryRoute(): RouteOption {
  const nodeIds = ['HOSP_A', 'J1', 'J2', 'J3', 'J4', 'HOSP_B'];
  return {
    id: 'ROUTE_PRIMARY_CORRIDOR',
    name: 'Primary Arterial (Central Blvd Corridor)',
    waypoints: getWaypointsForPath(nodeIds),
    totalDistanceKm: 6.5,
    freeFlowTimeMin: 9.2,
    currentEstimatedTimeMin: 9.2,
    checkpoints: ['CP-1', 'CP-2', 'CP-3', 'CP-4'],
    congestionScore: 12
  };
}

/**
 * Alternative Bypass Route definition
 */
export function getAlternativeBypassRoute(): RouteOption {
  const nodeIds = ['HOSP_A', 'J1', 'BYPASS_EAST_1', 'BYPASS_EAST_2', 'J3', 'J4', 'HOSP_B'];
  return {
    id: 'ROUTE_BYPASS_CORRIDOR',
    name: 'Smart Bypass (Outer Ring Transit Arc)',
    waypoints: getWaypointsForPath(nodeIds),
    totalDistanceKm: 7.8,
    freeFlowTimeMin: 10.4,
    currentEstimatedTimeMin: 10.4,
    checkpoints: ['CP-1', 'CP-3', 'CP-4'], // Safely bypasses CP-2
    congestionScore: 8
  };
}

/**
 * Evaluate whether reroute is justified based on time savings threshold
 */
export function evaluateRerouteJustification(
  currentRouteTimeMin: number,
  alternateRouteTimeMin: number,
  minimumSavingsThresholdMin = 1.5
): { shouldReroute: boolean; timeSavedMin: number; reason: string } {
  const timeSaved = currentRouteTimeMin - alternateRouteTimeMin;
  if (timeSaved >= minimumSavingsThresholdMin) {
    return {
      shouldReroute: true,
      timeSavedMin: Number(timeSaved.toFixed(1)),
      reason: `Alternative route saves ${timeSaved.toFixed(1)} mins (exceeds ${minimumSavingsThresholdMin}m hysteresis threshold). Camera 2 bottleneck bypassed.`
    };
  } else if (timeSaved > 0) {
    return {
      shouldReroute: false,
      timeSavedMin: Number(timeSaved.toFixed(1)),
      reason: `Alternative route saves only ${timeSaved.toFixed(1)} mins (below ${minimumSavingsThresholdMin}m threshold). Route maintained to avoid driver oscillation.`
    };
  } else {
    return {
      shouldReroute: false,
      timeSavedMin: 0,
      reason: 'Current route is faster or equivalent.'
    };
  }
}
