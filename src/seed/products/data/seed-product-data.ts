import { ProductCategories } from '../../../product/enums/valid-categories.enum';

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  category: ProductCategories;
}

interface SeedProductData {
  products: SeedProduct[];
}

export const initialProductData: SeedProductData = {
  products: [
    {
      name: 'Classic Burger',
      description:
        'Delicious beef burger with lettuce, tomato, and special sauce',
      price: 20000,
      category: ProductCategories.burgers,
    },
    {
      name: 'Cheese Burger',
      description: 'Burger with cheddar cheese and caramelized onions',
      price: 22000,
      category: ProductCategories.burgers,
    },
    {
      name: 'Chicken Burger',
      description: 'Grilled chicken breast burger with fresh veggies',
      price: 21000,
      category: ProductCategories.burgers,
    },
    {
      name: 'French Fries',
      description: 'Crispy golden fries with a touch of salt',
      price: 8000,
      category: ProductCategories.Accompaniments,
    },
    {
      name: 'Onion Rings',
      description: 'Crunchy onion rings with a light batter',
      price: 9000,
      category: ProductCategories.Accompaniments,
    },
    {
      name: 'Coca Cola',
      description: 'Cold Coca Cola with ice',
      price: 5000,
      category: ProductCategories.drinks,
    },
    {
      name: 'Lemonade',
      description: 'Freshly squeezed lemonade with mint',
      price: 6000,
      category: ProductCategories.drinks,
    },
    {
      name: 'Iced Tea',
      description: 'Black tea with lemon served chilled',
      price: 5500,
      category: ProductCategories.drinks,
    },
  ],
};
