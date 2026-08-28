export const usersList = [
  { id: 1, email: 'alice@example.com', firstname: 'Alice', lastname: 'Anderson', is_active: true },
  { id: 2, email: 'bob@example.com', firstname: 'Bob', lastname: 'Baker', is_active: true },
];

export const userSingle = {
  id: 1,
  email: 'alice@example.com',
  firstname: 'Alice',
  lastname: 'Anderson',
  is_active: true,
};

export const usersCreatePartial = [
  { success: true, status: 201, email: 'carol@example.com' },
  { success: false, status: 422, email: 'not-an-email', message: 'Invalid email address' },
];

export const userUpdated = {
  id: 1,
  email: 'alice@example.com',
  firstname: 'Alice',
  lastname: 'Anderson-Smith',
  is_active: true,
};
