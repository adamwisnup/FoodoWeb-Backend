const prisma = require("../db");
const bcrypt = require("bcrypt");

const createAccount = async (data) => {
  const password = bcrypt.hashSync(data.password, 8);
  const created = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: password,
    },
  });
  return created;
};

const getAccount = async (email) => {
  const account = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return account;
};

module.exports = { createAccount, getAccount };
