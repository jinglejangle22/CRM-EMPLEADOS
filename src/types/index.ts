import type {
  UserRole,
  CandidateSource,
  CandidateQualification,
  CandidateStage,
  EmployeeStatus,
  InteractionType,
  InteractionResult,
  InterviewModality,
  InterviewStatus,
  IncidentType,
  IncidentLevel,
  RecognitionType,
  FollowupStatus,
} from "@prisma/client";

export type Company = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  colorHex: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyIds: string[];
};

export type TimelineEventType =
  | "CV_RECEIVED"
  | "STAGE_CHANGE"
  | "INTERACTION"
  | "NOTE"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_UPDATED"
  | "INCIDENT"
  | "RECOGNITION"
  | "HIRED"
  | "STATUS_CHANGE"
  | "FOLLOWUP_CREATED"
  | "FOLLOWUP_COMPLETED"
  | "FOLLOWUP_CANCELLED";

export type TimelineEvent = {
  id: string;
  candidateId?: string;
  employeeId?: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  occurredAt: string; // ISO
  createdByName: string;
};

export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  phone: string;
  email?: string;
  birthDate?: string;
  address?: string;
  zone?: string;
  companyId: string;
  position: string;
  availability?: string;
  salaryExpectation?: string;
  experience?: string;
  cvReceivedDate: string;
  source: CandidateSource;
  hasCv: boolean;
  cvFileId?: string;
  rating?: number;
  qualification?: CandidateQualification;
  qualificationReason?: string;
  stage: CandidateStage;
  isArchived: boolean;
  availableForFuture: boolean;
  tagNames: string[];
  nextInterviewAt?: string;
};

export type Employee = {
  id: string;
  candidateId?: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  dni?: string;
  cuil?: string;
  birthDate?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  companyId: string;
  position: string;
  hireDate: string;
  terminationDate?: string;
  workday?: string;
  shift?: string;
  salary?: number;
  contractType?: string;
  status: EmployeeStatus;
  tagNames: string[];
};

export type Interview = {
  id: string;
  candidateId: string;
  companyId: string;
  position: string;
  startsAt: string;
  interviewerName?: string;
  modality: InterviewModality;
  address?: string;
  notes?: string;
  status: InterviewStatus;
  candidate: { id: string; firstName: string; lastName: string; phone: string };
};

export type Interaction = {
  id: string;
  candidateId?: string;
  employeeId?: string;
  type: InteractionType;
  occurredAt: string;
  result: InteractionResult;
  note?: string;
  userName: string;
  nextFollowUpAt?: string;
};

export type Followup = {
  id: string;
  candidateId?: string;
  employeeId?: string;
  dueAt: string;
  note: string;
  status: FollowupStatus;
};

export type EmployeeIncident = {
  id: string;
  employeeId: string;
  occurredAt: string;
  type: IncidentType;
  level: IncidentLevel;
  description: string;
  recordedByName: string;
};

export type EmployeeRecognition = {
  id: string;
  employeeId: string;
  occurredAt: string;
  type: RecognitionType;
  description: string;
  recordedByName: string;
};
