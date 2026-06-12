import type { Point } from './canvas';

export type WireCrossSection = '1.5' | '2.5' | '4' | '6' | '10' | '16';
export type WireCableType = 'XVB' | 'VOB' | 'EXVB' | 'VVB';

export const WIRE_CROSS_SECTIONS: WireCrossSection[] = ['1.5', '2.5', '4', '6', '10', '16'];
export const WIRE_CABLE_TYPES: WireCableType[] = ['XVB', 'VOB', 'EXVB', 'VVB'];

export interface WireEndpoint {
  symbolId: string;
  connectionPointId: string;
}

export interface Wire {
  id: string;
  from: WireEndpoint;
  to: WireEndpoint;
  /** Orthogonal polyline waypoints, including both endpoints. */
  points: Point[];
  crossSection: WireCrossSection;
  cableType: WireCableType;
  color?: string;
  label?: string;
}
