
const Role = {
  ADMIN: "ADMIN",
  ENGINEER: "ENGINEER",
  SOCIAL_MEDIA: "SOCIAL_MEDIA",
  COLLABORATOR: "COLLABORATOR",
  CLIENT: "CLIENT",
};

const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
};

class PrismaClient {
  constructor(options) {}
  async $connect() {}
  async $disconnect() {}
}

module.exports = {
  Role,
  AppointmentStatus,
  PrismaClient,
};
