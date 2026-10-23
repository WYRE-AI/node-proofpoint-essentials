export const usersList = [
  { id: 1, primary_email: 'alice@example.com', firstname: 'Alice', surname: 'Anderson', is_active: true },
  { id: 2, primary_email: 'bob@example.com', firstname: 'Bob', surname: 'Baker', is_active: true },
];

export const userSingle = {
  id: 1,
  primary_email: 'alice@example.com',
  firstname: 'Alice',
  surname: 'Anderson',
  is_active: true,
};

export const usersCreatePartial = [
  { success: true, status: 201, primary_email: 'carol@example.com' },
  { success: false, status: 422, primary_email: 'not-an-email', message: 'Invalid email address' },
];

export const userUpdated = {
  id: 1,
  primary_email: 'alice@example.com',
  firstname: 'Alice',
  surname: 'Anderson-Smith',
  is_active: true,
};
