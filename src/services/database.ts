import Database from 'better-sqlite3';
import path from 'path';
import { NormalizedReservation } from './getReservationDetails';
import { RiskReport } from '../scoring/riskScorer';

// Define the database file path
const DB_PATH = path.join(process.cwd(), 'data', 'reservations.db');

// Initialize database
const db = new Database(DB_PATH);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    code TEXT,
    platform TEXT,
    platform_id TEXT,
    booking_date TEXT,
    arrival_date TEXT,
    departure_date TEXT,
    check_in TEXT,
    check_out TEXT,
    nights INTEGER,
    status TEXT,
    conversation_id TEXT,
    last_message_at TEXT,
    guest_data TEXT,
    guests_data TEXT,
    status_history TEXT,
    reservation_status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS risk_reports (
    reservation_id TEXT PRIMARY KEY,
    score INTEGER,
    level TEXT,
    matched_rules TEXT,
    config_used TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
  );
`);

// Prepare statements
const insertReservation = db.prepare(`
  INSERT OR REPLACE INTO reservations (
    id, code, platform, platform_id, booking_date, arrival_date,
    departure_date, check_in, check_out, nights, status,
    conversation_id, last_message_at, guest_data, guests_data,
    status_history, reservation_status
  ) VALUES (
    @id, @code, @platform, @platform_id, @booking_date, @arrival_date,
    @departure_date, @check_in, @check_out, @nights, @status,
    @conversation_id, @last_message_at, @guest_data, @guests_data,
    @status_history, @reservation_status
  )
`);

const insertRiskReport = db.prepare(`
  INSERT OR REPLACE INTO risk_reports (
    reservation_id, score, level, matched_rules, config_used
  ) VALUES (
    @reservation_id, @score, @level, @matched_rules, @config_used
  )
`);

const getReservation = db.prepare(`
  SELECT r.*, rr.score, rr.level, rr.matched_rules, rr.config_used
  FROM reservations r
  LEFT JOIN risk_reports rr ON r.id = rr.reservation_id
  WHERE r.id = ?
`);

const getAllReservations = db.prepare(`
  SELECT r.*, rr.score, rr.level, rr.matched_rules, rr.config_used
  FROM reservations r
  LEFT JOIN risk_reports rr ON r.id = rr.reservation_id
  ORDER BY r.booking_date DESC
`);

export interface StoredReservation {
  reservation: NormalizedReservation;
  riskReport: RiskReport;
}

export class DatabaseService {
  static save(
    reservationId: string,
    reservation: NormalizedReservation,
    riskReport: RiskReport
  ): void {
    const reservationData = {
      id: reservation.id,
      code: reservation.code,
      platform: reservation.platform,
      platform_id: reservation.platform_id,
      booking_date: reservation.booking_date,
      arrival_date: reservation.arrival_date,
      departure_date: reservation.departure_date,
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      nights: reservation.nights,
      status: reservation.status,
      conversation_id: reservation.conversation_id,
      last_message_at: reservation.last_message_at,
      guest_data: JSON.stringify(reservation.guest),
      guests_data: JSON.stringify(reservation.guests),
      status_history: JSON.stringify(reservation.status_history),
      reservation_status: JSON.stringify(reservation.reservation_status),
    };

    const riskReportData = {
      reservation_id: reservationId,
      score: riskReport.score,
      level: riskReport.level,
      matched_rules: JSON.stringify(riskReport.matched_rules),
      config_used: JSON.stringify(riskReport.config_used),
    };

    db.transaction(() => {
      insertReservation.run(reservationData);
      insertRiskReport.run(riskReportData);
    })();
  }

  static get(id: string): StoredReservation | null {
    const result = getReservation.get(id);
    if (!result) return null;

    return DatabaseService.mapRowToStoredReservation(result);
  }

  static list(): StoredReservation[] {
    const results = getAllReservations.all();
    return results.map(DatabaseService.mapRowToStoredReservation);
  }

  private static mapRowToStoredReservation(row: any): StoredReservation {
    const reservation: NormalizedReservation = {
      id: row.id,
      code: row.code,
      platform: row.platform,
      platform_id: row.platform_id,
      booking_date: row.booking_date,
      arrival_date: row.arrival_date,
      departure_date: row.departure_date,
      check_in: row.check_in,
      check_out: row.check_out,
      nights: row.nights,
      status: row.status,
      conversation_id: row.conversation_id,
      last_message_at: row.last_message_at,
      guest: JSON.parse(row.guest_data),
      guests: JSON.parse(row.guests_data),
      status_history: JSON.parse(row.status_history),
      reservation_status: JSON.parse(row.reservation_status),
    };

    const riskReport: RiskReport = {
      score: row.score,
      level: row.level,
      matched_rules: JSON.parse(row.matched_rules || '[]'),
      config_used: JSON.parse(row.config_used || '{}'),
    };

    return { reservation, riskReport };
  }
}
