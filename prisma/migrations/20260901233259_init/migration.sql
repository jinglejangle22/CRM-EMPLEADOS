-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ENCARGADO', 'RRHH', 'LECTURA');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('INSTAGRAM', 'WHATSAPP', 'COMPUTRABAJO', 'INDEED', 'REFERIDO', 'CARTEL', 'OTRO');

-- CreateEnum
CREATE TYPE "CandidateQualification" AS ENUM ('RECOMENDADO', 'EVALUAR', 'NO_CONTRATAR');

-- CreateEnum
CREATE TYPE "CandidateStage" AS ENUM ('CV_RECIBIDO', 'CV_REVISADO', 'CONTACTADO', 'ENTREVISTA_AGENDADA', 'ENTREVISTADO', 'PRUEBA_LABORAL', 'CONTRATADO', 'NO_SELECCIONADO');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('EN_PRUEBA', 'ACTIVO', 'LICENCIA', 'VACACIONES', 'SUSPENDIDO', 'DESVINCULADO');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('LLEGADA_TARDE', 'AUSENCIA', 'AUSENCIA_SIN_AVISO', 'DIFERENCIA_CAJA', 'MALA_ATENCION', 'INCUMPLIMIENTO_TAREAS', 'USO_INDEBIDO_CELULAR', 'INCUMPLIMIENTO_PROTOCOLO', 'OTRO');

-- CreateEnum
CREATE TYPE "IncidentLevel" AS ENUM ('OBSERVACION', 'ADVERTENCIA', 'LLAMADO_FORMAL');

-- CreateEnum
CREATE TYPE "RecognitionType" AS ENUM ('RECONOCIMIENTO', 'BUEN_DESEMPENO', 'FELICITACION_CLIENTE', 'OBJETIVO_CUMPLIDO', 'MEJORA_NOTABLE');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('LLAMADA', 'WHATSAPP', 'EMAIL', 'PRESENCIAL', 'OTRO');

-- CreateEnum
CREATE TYPE "InteractionResult" AS ENUM ('CONTACTADO', 'NO_RESPONDIO', 'VOLVER_A_LLAMAR', 'INTERESADO', 'NO_INTERESADO', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "FollowupStatus" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "InterviewModality" AS ENUM ('PRESENCIAL', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA', 'CANCELADA', 'SE_PRESENTO', 'NO_SE_PRESENTO');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_companies" (
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "user_companies_pkey" PRIMARY KEY ("userId","companyId")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoFileId" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "zone" TEXT,
    "companyId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "availability" TEXT,
    "salaryExpectation" TEXT,
    "experience" TEXT,
    "cvReceivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "CandidateSource" NOT NULL,
    "cvFileId" TEXT,
    "rating" INTEGER,
    "qualification" "CandidateQualification",
    "qualificationReason" TEXT,
    "stage" "CandidateStage" NOT NULL DEFAULT 'CV_RECIBIDO',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "availableForFuture" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_tags" (
    "candidateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "candidate_tags_pkey" PRIMARY KEY ("candidateId","tagId")
);

-- CreateTable
CREATE TABLE "candidate_notes" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoFileId" TEXT,
    "dni" TEXT,
    "cuil" TEXT,
    "birthDate" TIMESTAMP(3),
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "companyId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminationDate" TIMESTAMP(3),
    "workday" TEXT,
    "shift" TEXT,
    "salary" DECIMAL(12,2),
    "contractType" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'EN_PRUEBA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_tags" (
    "employeeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "employee_tags_pkey" PRIMARY KEY ("employeeId","tagId")
);

-- CreateTable
CREATE TABLE "employee_notes" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_incidents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "type" "IncidentType" NOT NULL,
    "level" "IncidentLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceFileId" TEXT,
    "recordedById" TEXT NOT NULL,
    "employeeStatement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_recognitions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "type" "RecognitionType" NOT NULL,
    "description" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "employeeId" TEXT,
    "type" "InteractionType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "result" "InteractionResult" NOT NULL,
    "note" TEXT,
    "userId" TEXT NOT NULL,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followups" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "employeeId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,
    "status" "FollowupStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdById" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "resultInteractionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "followups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "employeeId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "interviewerId" TEXT,
    "modality" "InterviewModality" NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tags_companyId_name_key" ON "tags"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_candidateId_key" ON "employees"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "followups_resultInteractionId_key" ON "followups"("resultInteractionId");

-- CreateIndex
CREATE INDEX "timeline_events_candidateId_occurredAt_idx" ON "timeline_events"("candidateId", "occurredAt");

-- CreateIndex
CREATE INDEX "timeline_events_employeeId_occurredAt_idx" ON "timeline_events"("employeeId", "occurredAt");

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_photoFileId_fkey" FOREIGN KEY ("photoFileId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_cvFileId_fkey" FOREIGN KEY ("cvFileId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_notes" ADD CONSTRAINT "candidate_notes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_notes" ADD CONSTRAINT "candidate_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_photoFileId_fkey" FOREIGN KEY ("photoFileId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_tags" ADD CONSTRAINT "employee_tags_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_tags" ADD CONSTRAINT "employee_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_notes" ADD CONSTRAINT "employee_notes_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_notes" ADD CONSTRAINT "employee_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_incidents" ADD CONSTRAINT "employee_incidents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_incidents" ADD CONSTRAINT "employee_incidents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_incidents" ADD CONSTRAINT "employee_incidents_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_incidents" ADD CONSTRAINT "employee_incidents_evidenceFileId_fkey" FOREIGN KEY ("evidenceFileId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_recognitions" ADD CONSTRAINT "employee_recognitions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_recognitions" ADD CONSTRAINT "employee_recognitions_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followups" ADD CONSTRAINT "followups_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followups" ADD CONSTRAINT "followups_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followups" ADD CONSTRAINT "followups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followups" ADD CONSTRAINT "followups_resultInteractionId_fkey" FOREIGN KEY ("resultInteractionId") REFERENCES "interactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
