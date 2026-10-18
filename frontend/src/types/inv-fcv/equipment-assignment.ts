export type EquipmentAssignmentStatus =
  | "active"
  | "returned"
  | "transferred"
  | "disposed";

/* =====================================================
 * EQUIPMENT ASSIGNMENT
 * ==================================================== */

export interface EquipmentAssignment {
  id: string;
  assignment_group_id: string;
  equipment_id: string;

  /**
   * Assignment-time snapshot of the equipment
   * property number.
   */
  property_number: string;

  /**
   * Assignment-time snapshot of the equipment
   * serial number.
   */
  serial_number: string | null;

  is_care_of: boolean;
  care_of_employee_id: string | null;
  user_employee_id: string;

  quantity: number;

  assigned_at: string;
  returned_at: string | null;

  status: EquipmentAssignmentStatus;

  remarks: string | null;

  encoded_by: string;
  updated_by: string | null;

  created_at: string;
  updated_at: string;

  /**
   * Complete assignment history belonging
   * to the same assignment group.
   *
   * Returned by the show() endpoint.
   */
  assignmentGroup?: EquipmentAssignment[];

  /**
   * Attachments specifically associated
   * with this assignment.
   *
   * Only present when the backend loads
   * the attachments relationship.
   */
  attachments?: EquipmentAssignmentAttachment[];
}

/* =====================================================
 * ASSIGNMENT ATTACHMENT
 * ==================================================== */

export interface EquipmentAssignmentAttachment {
  id: string;

  equipment_id: string;
  equipment_assignment_id: string;
  attachment_type_id: string;

  name: string;

  file_path: string;
  file_name: string;

  mime_type: string | null;
  file_size: number | null;

  description: string | null;

  file_url?: string;

  encoded_by: string;
  updated_by: string | null;

  created_at: string;
  updated_at: string;

  attachment_type?: {
    id: string;
    name: string;
  };
}

/* =====================================================
 * CREATE ASSIGNMENT
 * ==================================================== */

export interface CreateEquipmentAssignmentData {
  equipment_id: string;

  /**
   * Assignment-time property number snapshot.
   */
  property_number: string;

  /**
   * Assignment-time serial number snapshot.
   */
  serial_number?: string | null;

  is_care_of: boolean;

  care_of_employee_id?: string | null;

  user_employee_id: string;

  quantity: number;

  assigned_at: string;

  remarks?: string | null;
}

/* =====================================================
 * UPDATE ASSIGNMENT
 * ==================================================== */

export interface UpdateEquipmentAssignmentData {
  property_number?: string;

  serial_number?: string | null;

  is_care_of?: boolean;

  care_of_employee_id?: string | null;

  user_employee_id?: string;

  quantity?: number;

  assigned_at?: string;

  returned_at?: string | null;

  status?: EquipmentAssignmentStatus;

  remarks?: string | null;
}

/* =====================================================
 * RETURN EQUIPMENT
 * ==================================================== */

export interface ReturnEquipmentData {
  /**
   * Required by the backend.
   */
  returned_at: string;

  remarks?: string | null;
}

/* =====================================================
 * TRANSFER EQUIPMENT
 * ==================================================== */

export interface TransferEquipmentData {
  user_employee_id: string;

  is_care_of: boolean;

  care_of_employee_id?: string | null;

  /**
   * Required date of the transfer.
   */
  transfer_date: string;

  remarks?: string | null;
}

/* =====================================================
 * DISPOSE EQUIPMENT
 * ==================================================== */

export interface DisposeEquipmentData {
  /**
   * Disposal does not have a disposed_at field
   * in the current backend schema.
   */
  remarks?: string | null;
}

/* =====================================================
 * EQUIPMENT TRANSFER
 * ==================================================== */

export interface EquipmentTransfer {
  id: string;

  equipment_id: string;

  from_assignment_id: string;
  to_assignment_id: string;

  quantity: number;

  transfer_date: string;

  remarks: string | null;

  encoded_by: string;

  created_at: string;
  updated_at: string;

  from_assignment?: EquipmentAssignment;
  to_assignment?: EquipmentAssignment;
}

/* =====================================================
 * ASSIGNMENT RESPONSE
 * ==================================================== */

export interface EquipmentAssignmentResponse {
  message: string;
  data: EquipmentAssignment;
}

/* =====================================================
 * TRANSFER RESPONSE
 * ==================================================== */

export interface EquipmentTransferResponse {
  message: string;

  data: {
    assignment: EquipmentAssignment;
    transfer: EquipmentTransfer;
  };
}

/* =====================================================
 * ASSIGNMENT LIST RESPONSE
 * ==================================================== */

export interface EquipmentAssignmentListResponse {
  data: EquipmentAssignment[];

  current_page: number;

  first_page_url: string | null;

  from: number | null;

  last_page: number;

  last_page_url: string | null;

  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;

  next_page_url: string | null;

  path: string;

  per_page: number;

  prev_page_url: string | null;

  to: number | null;

  total: number;
}

/* =====================================================
 * ASSIGNMENT ATTACHMENTS RESPONSE
 * ==================================================== */

export interface EquipmentAssignmentAttachmentsResponse {
  data: EquipmentAssignmentAttachment[];
}

/* =====================================================
 * ASSIGNMENT ATTACHMENT RESPONSE
 * ==================================================== */

export interface EquipmentAssignmentAttachmentResponse {
  message: string;
  data: EquipmentAssignmentAttachment;
}
