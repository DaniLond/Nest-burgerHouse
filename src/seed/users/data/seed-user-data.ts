interface SeedUser {
  email: string;
  password: string;
  fullName: string;
}

interface SeedData {
  users: SeedUser[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'luisa@gmail.com',
      fullName: 'Luisa Castillo',
      password: '123Luisa',
    },
    {
      email: 'valentina@gmail.com',
      fullName: 'Valentina Ruiz',
      password: '123Valen',
    },
    {
      email: 'alejandro@gmail.com',
      fullName: 'Alejandro Pérez',
      password: '123Alejo',
    },
    {
      email: 'danielaTorres@gmail.com',
      fullName: 'Daniela Torres',
      password: '123DanielaT',
    },
    {
      email: 'samuel@gmail.com',
      fullName: 'Samuel García',
      password: '123Samu',
    },
    {
      email: 'isabella@gmail.com',
      fullName: 'Isabella Martínez',
      password: '123Isa',
    },
    {
      email: 'jonathan@gmail.com',
      fullName: 'Jonathan López',
      password: '123Jonathan',
    },
    {
      email: 'leidy@gmail.com',
      fullName: 'Leidy Londoño',
      password: '123Leidy',
    },
    {
      email: 'miguel@gmail.com',
      fullName: 'Miguel Herrera',
      password: '123Miguel',
    },
  ],
};
