import { OrderState } from '../../../Order/enums/valid-state.enums';


interface SeedOrder {
  total: number;
  state: OrderState;
  userId: string;
  productIds: string[];
  address: string;
} 

interface SeedOrder {
  total: number;
  state: OrderState;
  userId: string;
  productIds: string[];
}

interface SeedOrderData {
  orders: SeedOrder[];
}

export const initialOrderData: SeedOrderData = {
  orders: [
    {
      total: 33000,
      state: OrderState.Pending,
      userId: '00000000-0000-0000-0000-000000000001',
      productIds: [],
      address: ''
    },
    {
      total: 28000, 
      state: OrderState.Preparing,
      userId: '00000000-0000-0000-0000-000000000002', 
      productIds: [], 
      address: ''
    },
    {
      total: 20000, 
      state: OrderState.Ready,
      userId: '00000000-0000-0000-0000-000000000001', 
      productIds: [], 
      address: ''
    },
    {
      total: 11000, 
      state: OrderState.OnTheWay,
      userId: '00000000-0000-0000-0000-000000000003',
      productIds: [],
      address: ''

    },
    {
      total: 26000, 
      state: OrderState.Delivered,
      userId: '00000000-0000-0000-0000-000000000002',
      productIds: [],
      address: '' 
    },
    {
      total: 15000, 
      state: OrderState.Cancelled,
      userId: '00000000-0000-0000-0000-000000000004', 
      productIds: [], 
      address: ''
    },
  ],
};