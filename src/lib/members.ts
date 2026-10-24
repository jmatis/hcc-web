export interface MemberRecord {
  id: string;
  first_name: string;
  last_name: string;
  auth_email: string;
  contact_email: string;
  contact_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string | null;
  hsv_member_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberDetails {
  firstName: string;
  lastName: string;
  contactEmail: string;
  contactPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  hsvMemberId: string;
}

const schemaByDatabase = new WeakMap<D1Database, Promise<void>>();

export function ensureMemberSchema(db: D1Database): Promise<void> {
  const existing = schemaByDatabase.get(db);
  if (existing) return existing;

  const setup = db
    .batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS club_members (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        auth_email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        contact_email TEXT NOT NULL COLLATE NOCASE,
        contact_phone TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        address TEXT,
        hsv_member_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_club_members_contact_email ON club_members(contact_email)"),
    ])
    .then(() => undefined)
    .catch((error) => {
      schemaByDatabase.delete(db);
      throw error;
    });

  schemaByDatabase.set(db, setup);
  return setup;
}

export function readMemberDetails(form: FormData): MemberDetails {
  const value = (name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);
  return {
    firstName: value("firstName", 80),
    lastName: value("lastName", 80),
    contactEmail: value("contactEmail", 254).toLowerCase(),
    contactPhone: value("contactPhone", 40),
    emergencyContactName: value("emergencyContactName", 120),
    emergencyContactPhone: value("emergencyContactPhone", 40),
    address: value("address", 500),
    hsvMemberId: value("hsvMemberId", 80),
  };
}

export function validateMemberDetails(details: MemberDetails, includeNames = true): string[] {
  const errors: string[] = [];
  if (includeNames && (!details.firstName || !details.lastName)) errors.push("Enter your first and last name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.contactEmail)) errors.push("Enter a valid contact email.");
  if (!isPhone(details.contactPhone)) errors.push("Enter a valid contact phone number.");
  if (!details.emergencyContactName) errors.push("Enter an emergency contact name.");
  if (!isPhone(details.emergencyContactPhone)) errors.push("Enter a valid emergency contact phone number.");
  return errors;
}

function isPhone(value: string): boolean {
  return value.length >= 7 && value.length <= 40 && /^[+()\d\s.-]+$/.test(value);
}

export async function addMemberApplication(db: D1Database, details: MemberDetails): Promise<void> {
  await ensureMemberSchema(db);
  const now = new Date().toISOString();
  await db
    .prepare(`INSERT INTO club_members (
      id, first_name, last_name, auth_email, contact_email, contact_phone,
      emergency_contact_name, emergency_contact_phone, address, hsv_member_id,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(auth_email) DO NOTHING`)
    .bind(
      crypto.randomUUID(),
      details.firstName,
      details.lastName,
      details.contactEmail,
      details.contactEmail,
      details.contactPhone,
      details.emergencyContactName,
      details.emergencyContactPhone,
      details.address || null,
      details.hsvMemberId || null,
      now,
      now,
    )
    .run();
}

export async function getMember(db: D1Database, authEmail: string): Promise<MemberRecord | null> {
  await ensureMemberSchema(db);
  return db
    .prepare("SELECT * FROM club_members WHERE auth_email = ? COLLATE NOCASE LIMIT 1")
    .bind(authEmail)
    .first<MemberRecord>();
}

export async function updateMember(db: D1Database, authEmail: string, details: MemberDetails): Promise<boolean> {
  await ensureMemberSchema(db);
  const result = await db
    .prepare(`UPDATE club_members SET
      contact_email = ?, contact_phone = ?, emergency_contact_name = ?,
      emergency_contact_phone = ?, address = ?, hsv_member_id = ?, updated_at = ?
      WHERE auth_email = ? COLLATE NOCASE`)
    .bind(
      details.contactEmail,
      details.contactPhone,
      details.emergencyContactName,
      details.emergencyContactPhone,
      details.address || null,
      details.hsvMemberId || null,
      new Date().toISOString(),
      authEmail,
    )
    .run();
  return (result.meta.changes ?? 0) > 0;
}
