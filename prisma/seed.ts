/**
 * Seed de datos de ejemplo para desarrollo (Etapa B).
 * Ejecutar con: npx prisma db seed
 */
import {
  PrismaClient,
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
} from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const sabrina = await prisma.company.create({
    data: { name: "Sabrina Beauty Spa", shortName: "Sabrina Spa", slug: "sabrina-beauty-spa", colorHex: "#ec4899" },
  });
  const kiosco = await prisma.company.create({
    data: {
      name: "Maxikiosco y Librería La Bota 24hs",
      shortName: "Kiosco La Bota",
      slug: "maxikiosco-la-bota",
      colorHex: "#f59e0b",
    },
  });
  const mercadito = await prisma.company.create({
    data: { name: "Mercadito La Bota", shortName: "Mercadito La Bota", slug: "mercadito-la-bota", colorHex: "#14b8a6" },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@labota.com",
      passwordHash: hashPassword("admin123"),
      role: UserRole.ADMIN,
    },
  });
  const rrhh = await prisma.user.create({
    data: {
      name: "Responsable RRHH",
      email: "rrhh@labota.com",
      passwordHash: hashPassword("rrhh123"),
      role: UserRole.RRHH,
    },
  });
  const encargadoKiosco = await prisma.user.create({
    data: {
      name: "Encargado Kiosco",
      email: "encargado.kiosco@labota.com",
      passwordHash: hashPassword("encargado123"),
      role: UserRole.ENCARGADO,
      companies: { create: [{ companyId: kiosco.id }] },
    },
  });
  await prisma.user.create({
    data: {
      name: "Usuario Lectura",
      email: "lectura@labota.com",
      passwordHash: hashPassword("lectura123"),
      role: UserRole.LECTURA,
    },
  });

  // Etiquetas por empresa
  await prisma.tag.createMany({
    data: [
      { companyId: sabrina.id, name: "Manicura", category: "puesto" },
      { companyId: sabrina.id, name: "Pestañas", category: "puesto" },
      { companyId: sabrina.id, name: "Masajes", category: "puesto" },
      { companyId: sabrina.id, name: "Recepción", category: "puesto" },
      { companyId: kiosco.id, name: "Caja", category: "puesto" },
      { companyId: kiosco.id, name: "Noche", category: "turno" },
      { companyId: kiosco.id, name: "Franquero", category: "puesto" },
      { companyId: mercadito.id, name: "Reposición", category: "puesto" },
      { companyId: mercadito.id, name: "Cocina", category: "puesto" },
    ],
  });

  const laura = await prisma.candidate.create({
    data: {
      firstName: "Laura",
      lastName: "Gómez",
      phone: "+5493810000001",
      email: "laura.gomez@example.com",
      companyId: kiosco.id,
      position: "Cajera",
      source: CandidateSource.INSTAGRAM,
      rating: 4,
      qualification: CandidateQualification.RECOMENDADO,
      stage: CandidateStage.ENTREVISTA_AGENDADA,
      createdById: rrhh.id,
    },
  });

  await prisma.interview.create({
    data: {
      candidateId: laura.id,
      companyId: kiosco.id,
      position: "Cajera",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 18),
      modality: InterviewModality.PRESENCIAL,
      status: InterviewStatus.PENDIENTE,
      interviewerId: encargadoKiosco.id,
    },
  });

  await prisma.interaction.create({
    data: {
      candidateId: laura.id,
      type: InteractionType.WHATSAPP,
      occurredAt: new Date(),
      result: InteractionResult.INTERESADO,
      note: "Confirmó interés en el turno noche.",
      userId: rrhh.id,
    },
  });

  await prisma.timelineEvent.createMany({
    data: [
      {
        candidateId: laura.id,
        type: "CV_RECEIVED",
        title: "CV recibido",
        occurredAt: laura.cvReceivedDate,
        createdById: rrhh.id,
      },
      {
        candidateId: laura.id,
        type: "INTERVIEW_SCHEDULED",
        title: "Entrevista agendada",
        occurredAt: new Date(),
        createdById: rrhh.id,
      },
    ],
  });

  const camila = await prisma.employee.create({
    data: {
      firstName: "Camila",
      lastName: "Fernández",
      companyId: sabrina.id,
      position: "Manicura",
      status: EmployeeStatus.ACTIVO,
      salary: 450000,
      hireDate: new Date("2026-02-01"),
    },
  });

  await prisma.employeeIncident.create({
    data: {
      employeeId: camila.id,
      companyId: sabrina.id,
      occurredAt: new Date(),
      type: IncidentType.LLEGADA_TARDE,
      level: IncidentLevel.OBSERVACION,
      description: "Llegó 25 minutos tarde.",
      recordedById: admin.id,
    },
  });

  await prisma.timelineEvent.create({
    data: {
      employeeId: camila.id,
      type: "INCIDENT",
      title: "Llegada tarde",
      description: "Llegó 25 minutos tarde.",
      occurredAt: new Date(),
      createdById: admin.id,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
