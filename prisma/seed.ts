import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Nettoyage de la base de données...");

  // Clean in correct order (respecting foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageParticipant.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.ticketEvent.deleteMany();
  await prisma.requestTicket.deleteMany();
  await prisma.documentAccess.deleteMany();
  await prisma.document.deleteMany();
  await prisma.session.deleteMany();
  await prisma.clientAccount.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Création des organisations...");

  const org1 = await prisma.organization.create({
    data: {
      name: "TechCorp Solutions",
      slug: "techcorp",
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Groupe Innovex",
      slug: "innovex",
    },
  });

  console.log("Création des comptes clients...");

  const passwordHash = await bcrypt.hash("demo123456", 12);

  const marie = await prisma.clientAccount.create({
    data: {
      organizationId: org1.id,
      name: "Marie Dupont",
      email: "marie.dupont@techcorp.fr",
      passwordHash,
      role: "admin",
    },
  });

  const jean = await prisma.clientAccount.create({
    data: {
      organizationId: org1.id,
      name: "Jean Martin",
      email: "jean.martin@techcorp.fr",
      passwordHash,
      role: "user",
    },
  });

  const sophie = await prisma.clientAccount.create({
    data: {
      organizationId: org2.id,
      name: "Sophie Bernard",
      email: "sophie.bernard@innovex.fr",
      passwordHash,
      role: "admin",
    },
  });

  console.log("Création des documents...");

  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // TechCorp documents
  const docs = await Promise.all([
    prisma.document.create({
      data: {
        organizationId: org1.id,
        title: "Contrat de prestation — Mission Q1 2025",
        category: "contract",
        filePath: "/storage/techcorp/contrat-q1-2025.pdf",
        fileName: "contrat-q1-2025.pdf",
        mimeType: "application/pdf",
        size: 245000,
        uploadedById: marie.id,
        createdAt: daysAgo(45),
      },
    }),
    prisma.document.create({
      data: {
        organizationId: org1.id,
        title: "Facture #2025-001 — Janvier",
        category: "invoice",
        filePath: "/storage/techcorp/facture-2025-001.pdf",
        fileName: "facture-2025-001.pdf",
        mimeType: "application/pdf",
        size: 89000,
        uploadedById: marie.id,
        createdAt: daysAgo(30),
      },
    }),
    prisma.document.create({
      data: {
        organizationId: org1.id,
        title: "Facture #2025-002 — Février",
        category: "invoice",
        filePath: "/storage/techcorp/facture-2025-002.pdf",
        fileName: "facture-2025-002.pdf",
        mimeType: "application/pdf",
        size: 92000,
        uploadedById: marie.id,
        createdAt: daysAgo(15),
      },
    }),
    prisma.document.create({
      data: {
        organizationId: org1.id,
        title: "Rapport d'avancement — Sprint 12",
        category: "report",
        filePath: "/storage/techcorp/rapport-sprint-12.pdf",
        fileName: "rapport-sprint-12.pdf",
        mimeType: "application/pdf",
        size: 1240000,
        uploadedById: marie.id,
        createdAt: daysAgo(7),
      },
    }),
    prisma.document.create({
      data: {
        organizationId: org1.id,
        title: "Cahier des charges — Module RH",
        category: "general",
        filePath: "/storage/techcorp/cdc-module-rh.pdf",
        fileName: "cdc-module-rh.pdf",
        mimeType: "application/pdf",
        size: 560000,
        uploadedById: jean.id,
        createdAt: daysAgo(3),
      },
    }),
    prisma.document.create({
      data: {
        organizationId: org1.id,
        title: "Procès-verbal de réunion — Comité projet",
        category: "general",
        filePath: "/storage/techcorp/pv-comite-projet.pdf",
        fileName: "pv-comite-projet.pdf",
        mimeType: "application/pdf",
        size: 178000,
        uploadedById: marie.id,
        createdAt: daysAgo(1),
      },
    }),
    // Innovex documents
    prisma.document.create({
      data: {
        organizationId: org2.id,
        title: "Convention de service — 2025",
        category: "contract",
        filePath: "/storage/innovex/convention-2025.pdf",
        fileName: "convention-2025.pdf",
        mimeType: "application/pdf",
        size: 312000,
        uploadedById: sophie.id,
        createdAt: daysAgo(60),
      },
    }),
    prisma.document.create({
      data: {
        organizationId: org2.id,
        title: "Facture #INV-2025-018",
        category: "invoice",
        filePath: "/storage/innovex/facture-inv-2025-018.pdf",
        fileName: "facture-inv-2025-018.pdf",
        mimeType: "application/pdf",
        size: 76000,
        uploadedById: sophie.id,
        createdAt: daysAgo(10),
      },
    }),
    prisma.document.create({
      data: {
        organizationId: org2.id,
        title: "Audit de sécurité — Rapport final",
        category: "report",
        filePath: "/storage/innovex/audit-securite-final.pdf",
        fileName: "audit-securite-final.pdf",
        mimeType: "application/pdf",
        size: 2100000,
        uploadedById: sophie.id,
        createdAt: daysAgo(5),
      },
    }),
  ]);

  console.log("Création des demandes (tickets)...");

  // TechCorp tickets
  const ticket1 = await prisma.requestTicket.create({
    data: {
      organizationId: org1.id,
      createdById: marie.id,
      title: "Mise à jour des accès VPN pour l'équipe projet",
      description: "Suite à l'arrivée de 3 nouveaux collaborateurs, nous avons besoin de créer leurs accès VPN et de configurer les permissions réseau associées.",
      status: "in_progress",
      priority: "high",
      slaDueAt: daysAgo(-2),
      createdAt: daysAgo(5),
    },
  });

  const ticket2 = await prisma.requestTicket.create({
    data: {
      organizationId: org1.id,
      createdById: jean.id,
      title: "Demande de certificat SSL pour sous-domaine",
      description: "Nous devons déployer un nouveau sous-domaine api-v2.techcorp.fr et avons besoin d'un certificat SSL valide.",
      status: "open",
      priority: "medium",
      slaDueAt: daysAgo(-5),
      createdAt: daysAgo(2),
    },
  });

  const ticket3 = await prisma.requestTicket.create({
    data: {
      organizationId: org1.id,
      createdById: marie.id,
      title: "Migration base de données — environnement staging",
      description: "Planification et exécution de la migration de la base de données PostgreSQL 14 vers 16 sur l'environnement de staging.",
      status: "resolved",
      priority: "medium",
      createdAt: daysAgo(20),
    },
  });

  const ticket4 = await prisma.requestTicket.create({
    data: {
      organizationId: org1.id,
      createdById: jean.id,
      title: "Configuration du monitoring applicatif",
      description: "Mise en place de Grafana + Prometheus pour le monitoring de l'application de production.",
      status: "waiting",
      priority: "low",
      createdAt: daysAgo(12),
    },
  });

  // Innovex tickets
  const ticket5 = await prisma.requestTicket.create({
    data: {
      organizationId: org2.id,
      createdById: sophie.id,
      title: "Audit de conformité RGPD — Module CRM",
      description: "Réalisation d'un audit complet de conformité RGPD sur le module CRM, incluant l'analyse des flux de données et la vérification des consentements.",
      status: "in_progress",
      priority: "urgent",
      slaDueAt: daysAgo(-1),
      createdAt: daysAgo(8),
    },
  });

  console.log("Création des événements de tickets...");

  // Ticket 1 events
  await prisma.ticketEvent.createMany({
    data: [
      {
        ticketId: ticket1.id,
        actorId: marie.id,
        type: "created",
        payload: JSON.stringify({ title: ticket1.title }),
        createdAt: daysAgo(5),
      },
      {
        ticketId: ticket1.id,
        actorId: null,
        type: "status_change",
        payload: JSON.stringify({ from: "open", to: "in_progress" }),
        createdAt: daysAgo(4),
      },
      {
        ticketId: ticket1.id,
        actorId: marie.id,
        type: "comment",
        payload: JSON.stringify({ body: "Les 3 comptes ont été créés. En attente de validation des permissions réseau." }),
        createdAt: daysAgo(3),
      },
    ],
  });

  // Ticket 3 events (resolved)
  await prisma.ticketEvent.createMany({
    data: [
      {
        ticketId: ticket3.id,
        actorId: marie.id,
        type: "created",
        payload: JSON.stringify({ title: ticket3.title }),
        createdAt: daysAgo(20),
      },
      {
        ticketId: ticket3.id,
        actorId: null,
        type: "status_change",
        payload: JSON.stringify({ from: "open", to: "in_progress" }),
        createdAt: daysAgo(18),
      },
      {
        ticketId: ticket3.id,
        actorId: null,
        type: "status_change",
        payload: JSON.stringify({ from: "in_progress", to: "resolved" }),
        createdAt: daysAgo(14),
      },
      {
        ticketId: ticket3.id,
        actorId: null,
        type: "comment",
        payload: JSON.stringify({ body: "Migration effectuée avec succès. Toutes les données ont été vérifiées." }),
        createdAt: daysAgo(14),
      },
    ],
  });

  console.log("Création des threads de messages...");

  // TechCorp message threads
  const thread1 = await prisma.messageThread.create({
    data: {
      organizationId: org1.id,
      subject: "Point hebdomadaire — Avancement projet",
      createdAt: daysAgo(14),
    },
  });

  await prisma.messageParticipant.createMany({
    data: [
      { threadId: thread1.id, clientAccountId: marie.id },
      { threadId: thread1.id, clientAccountId: jean.id },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: thread1.id,
        senderId: marie.id,
        body: "Bonjour Jean, pouvez-vous préparer le rapport d'avancement pour le comité de vendredi ? Merci de bien vouloir inclure les métriques de performance du sprint en cours.",
        createdAt: daysAgo(14),
      },
      {
        threadId: thread1.id,
        senderId: jean.id,
        body: "Bonjour Marie, bien noté. Je prépare le document et vous l'envoie d'ici mercredi. Souhaitez-vous que j'inclue également le suivi budgétaire ?",
        createdAt: daysAgo(13),
      },
      {
        threadId: thread1.id,
        senderId: marie.id,
        body: "Oui, le suivi budgétaire serait un plus. N'oubliez pas les projections pour le Q2.",
        createdAt: daysAgo(13),
      },
    ],
  });

  const thread2 = await prisma.messageThread.create({
    data: {
      organizationId: org1.id,
      subject: "Accès documentation technique",
      createdAt: daysAgo(5),
    },
  });

  await prisma.messageParticipant.createMany({
    data: [
      { threadId: thread2.id, clientAccountId: jean.id },
      { threadId: thread2.id, clientAccountId: marie.id },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: thread2.id,
        senderId: jean.id,
        body: "J'ai besoin d'accéder à la documentation de l'API v2 pour finaliser l'intégration. Est-ce que les docs sont disponibles sur le portail ?",
        createdAt: daysAgo(5),
      },
      {
        threadId: thread2.id,
        senderId: marie.id,
        body: "Je viens de téléverser la documentation dans la section Documents. Vous devriez y avoir accès maintenant.",
        createdAt: daysAgo(4),
      },
    ],
  });

  // Innovex threads
  const thread3 = await prisma.messageThread.create({
    data: {
      organizationId: org2.id,
      subject: "Planification audit RGPD — Prochaines étapes",
      createdAt: daysAgo(8),
    },
  });

  await prisma.messageParticipant.create({
    data: { threadId: thread3.id, clientAccountId: sophie.id },
  });

  await prisma.message.create({
    data: {
      threadId: thread3.id,
      senderId: sophie.id,
      body: "Merci de bien vouloir nous transmettre le planning détaillé de l'audit RGPD. Nous devons valider les dates avec notre DPO avant la fin de la semaine.",
      createdAt: daysAgo(8),
    },
  });

  console.log("Création des logs d'audit...");

  // Audit logs for TechCorp
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org1.id,
        actorId: marie.id,
        action: "login",
        entityType: "session",
        ipAddress: "192.168.1.42",
        createdAt: daysAgo(1),
        metadata: JSON.stringify({ browser: "Chrome 121" }),
      },
      {
        organizationId: org1.id,
        actorId: marie.id,
        action: "document_view",
        entityType: "document",
        entityId: docs[3].id,
        createdAt: daysAgo(1),
      },
      {
        organizationId: org1.id,
        actorId: marie.id,
        action: "document_download",
        entityType: "document",
        entityId: docs[0].id,
        createdAt: daysAgo(1),
      },
      {
        organizationId: org1.id,
        actorId: jean.id,
        action: "login",
        entityType: "session",
        ipAddress: "10.0.0.15",
        createdAt: daysAgo(2),
        metadata: JSON.stringify({ browser: "Firefox 122" }),
      },
      {
        organizationId: org1.id,
        actorId: jean.id,
        action: "ticket_create",
        entityType: "ticket",
        entityId: ticket2.id,
        createdAt: daysAgo(2),
      },
      {
        organizationId: org1.id,
        actorId: marie.id,
        action: "message_send",
        entityType: "message",
        entityId: thread1.id,
        createdAt: daysAgo(3),
      },
      {
        organizationId: org1.id,
        actorId: jean.id,
        action: "document_view",
        entityType: "document",
        entityId: docs[4].id,
        createdAt: daysAgo(3),
      },
      {
        organizationId: org1.id,
        actorId: marie.id,
        action: "login",
        entityType: "session",
        ipAddress: "192.168.1.42",
        createdAt: daysAgo(5),
        metadata: JSON.stringify({ browser: "Chrome 121" }),
      },
      {
        organizationId: org1.id,
        actorId: marie.id,
        action: "ticket_update",
        entityType: "ticket",
        entityId: ticket1.id,
        createdAt: daysAgo(4),
        metadata: JSON.stringify({ status: "in_progress" }),
      },
      // Innovex audit logs
      {
        organizationId: org2.id,
        actorId: sophie.id,
        action: "login",
        entityType: "session",
        ipAddress: "172.16.0.8",
        createdAt: daysAgo(1),
        metadata: JSON.stringify({ browser: "Safari 17" }),
      },
      {
        organizationId: org2.id,
        actorId: sophie.id,
        action: "document_download",
        entityType: "document",
        entityId: docs[8].id,
        createdAt: daysAgo(2),
      },
    ],
  });

  console.log("\nBase de données alimentée avec succès !");
  console.log("---");
  console.log("Comptes de démonstration :");
  console.log(`  Admin TechCorp  : marie.dupont@techcorp.fr / demo123456`);
  console.log(`  User TechCorp   : jean.martin@techcorp.fr  / demo123456`);
  console.log(`  Admin Innovex   : sophie.bernard@innovex.fr / demo123456`);
  console.log("---");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
