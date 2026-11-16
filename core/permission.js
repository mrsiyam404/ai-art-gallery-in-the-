
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে.

import {
  AUTHOR,
  CONFIG,
  isOwner,
  isBotAdmin
} from "../config.js";

export const ROLES = Object.freeze({
  USER: "USER",
  GROUP_ADMIN: "GROUP_ADMIN",
  BOT_ADMIN: "BOT_ADMIN",
  OWNER: "OWNER"
});

export const getUserRole = async ({
  senderJid,
  isGroup = false,
  groupMetadata = null
}) => {
  if (!senderJid) return ROLES.USER;

  if (isOwner(senderJid)) return ROLES.OWNER;
  if (isBotAdmin(senderJid)) return ROLES.BOT_ADMIN;

  if (isGroup && groupMetadata) {
    const senderNumber = senderJid.split("@")[0].split(":")[0];

    const participant = groupMetadata.participants?.find(p => {
      const id = (p.id || p.jid || "").split("@")[0].split(":")[0];
      return id === senderNumber;
    });

    if (
      participant?.admin === "admin" ||
      participant?.admin === "superadmin"
    ) {
      return ROLES.GROUP_ADMIN;
    }
  }

  return ROLES.USER;
};

const levels = {
  USER: 0,
  GROUP_ADMIN: 1,
  BOT_ADMIN: 2,
  OWNER: 3
};

export const hasPermission = async ({
  senderJid,
  requiredRole = "USER",
  isGroup = false,
  groupMetadata = null
}) => {
  const role = await getUserRole({
    senderJid,
    isGroup,
    groupMetadata
  });

  return (levels[role] ?? 0) >=
    (levels[requiredRole] ?? 0);
};

// commandHandler.js-এর প্রয়োজনীয় Export
export const checkPermission = async (
  senderJid,
  requiredRole = "USER",
  isGroup = false,
  groupMetadata = null
) => {
  return hasPermission({
    senderJid,
    requiredRole,
    isGroup,
    groupMetadata
  });
};

export const checkCommandPermission = async ({
  senderJid,
  command,
  isGroup = false,
  groupMetadata = null
}) => {
  return checkPermission(
    senderJid,
    command?.config?.role || "USER",
    isGroup,
    groupMetadata
  );
};

export const getPermissionInfo = () => ({
  author: AUTHOR,
  owner: CONFIG.OWNER_ID,
  ownerNumber: CONFIG.OWNER_NUMBER,
  botAdmins: CONFIG.BOT_ADMIN_IDS,
  modes: CONFIG.MODES
});
