const users = [];

export const addUser = (user) => {
  users.push(user);
};

export const removeUser = (uuid) => {
  const index = users.findIndex((user) => user.uuid === uuid);

  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUsers = () => {
  return users;
};
