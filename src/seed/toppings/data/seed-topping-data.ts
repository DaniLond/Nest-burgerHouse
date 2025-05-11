export interface SeedTopping {
  name: string;
  price: number;
  maximumAmount: number;
}

interface SeedToppingData {
  toppings: SeedTopping[];
}

export const initialToppingData: SeedToppingData = {
  toppings: [
    {
      name: 'Extra Cheese',
      price: 2000,
      maximumAmount: 5,
    },
    {
      name: 'Bacon Bits',
      price: 2500,
      maximumAmount: 6,
    },
    {
      name: 'Guacamole',
      price: 3000,
      maximumAmount: 2,
    },
    {
      name: 'Jalapeños',
      price: 1500,
      maximumAmount: 4,
    },
    {
      name: 'Fried Egg',
      price: 1800,
      maximumAmount: 1,
    },
  ],
};
