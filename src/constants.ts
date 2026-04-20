export interface Preset {
  name: string;
  emoji: string;
  area: number;
  areaRange: [number, number];
  rent: number;
  rentRange: [number, number];
  check: number;
  checkRange: [number, number];
  clients: number;
  clientsRange: [number, number];
  days: number;
  daysRange: [number, number];
  cogs: number;
  cogsRange: [number, number];
  mkt: number;
  staff: number;
  staffRange: [number, number];
  salary: number;
  salaryRange: [number, number];
  capex: number;
  capexRange: [number, number];
  wc: number;
  meta: string;
}

export const PRESETS: Record<string, Preset> = {
  coffee: {
    name: 'Кофейня',
    emoji: 'Coffee',
    area: 60,
    areaRange: [30, 120],
    rent: 10000,
    rentRange: [6000, 15000],
    check: 2500,
    checkRange: [1800, 3500],
    clients: 100,
    clientsRange: [60, 180],
    days: 30,
    daysRange: [28, 31],
    cogs: 35,
    cogsRange: [30, 45],
    mkt: 5,
    staff: 4,
    staffRange: [3, 6],
    salary: 250000,
    salaryRange: [200000, 350000],
    capex: 10000000,
    capexRange: [5000000, 20000000],
    wc: 2500000,
    meta: 'маржа 60–70% · чек 2.5k · день 30'
  },
  bakery: {
    name: 'Пекарня',
    emoji: 'Croissant',
    area: 50,
    areaRange: [25, 100],
    rent: 9000,
    rentRange: [5000, 13000],
    check: 1800,
    checkRange: [1200, 2500],
    clients: 150,
    clientsRange: [100, 250],
    days: 30,
    daysRange: [28, 31],
    cogs: 45,
    cogsRange: [40, 55],
    mkt: 4,
    staff: 4,
    staffRange: [3, 6],
    salary: 230000,
    salaryRange: [180000, 300000],
    capex: 12000000,
    capexRange: [7000000, 20000000],
    wc: 2000000,
    meta: 'маржа 45–55% · чек 1.8k'
  },
  restaurant: {
    name: 'Ресторан',
    emoji: 'Utensils',
    area: 150,
    areaRange: [80, 300],
    rent: 8500,
    rentRange: [5500, 14000],
    check: 8500,
    checkRange: [5000, 15000],
    clients: 60,   clientsRange: [40, 120],
    days: 30,
    daysRange: [28, 31],
    cogs: 38,
    cogsRange: [32, 42],
    mkt: 6,
    staff: 12,
    staffRange: [8, 20],
    salary: 220000,
    salaryRange: [180000, 300000],
    capex: 35000000,
    capexRange: [20000000, 80000000],
    wc: 5000000,
    meta: 'food cost 32–42% · чек 8.5k'
  },
  barber: {
    name: 'Барбершоп',
    emoji: 'Scissors',
    area: 45,
    areaRange: [25, 80],
    rent: 8000,
    rentRange: [5000, 12000],
    check: 8000,
    checkRange: [5000, 15000],
    clients: 18,
    clientsRange: [10, 30],
    days: 28,
    daysRange: [26, 30],
    cogs: 12,
    cogsRange: [8, 18],
    mkt: 5,
    staff: 4,
    staffRange: [3, 6],
    salary: 350000,
    salaryRange: [250000, 500000],
    capex: 8000000,
    capexRange: [4000000, 15000000],
    wc: 1500000,
    meta: 'маржа 82–88% · ЗП выше'
  },
  beauty: {
    name: 'Салон красоты',
    emoji: 'Sparkles',
    area: 70,
    areaRange: [40, 150],
    rent: 8000,
    rentRange: [5000, 13000],
    check: 15000,
    checkRange: [8000, 30000],
    clients: 15,
    clientsRange: [8, 25],
    days: 28,
    daysRange: [26, 30],
    cogs: 18,
    cogsRange: [12, 25],
    mkt: 7,
    staff: 5,
    staffRange: [3, 8],
    salary: 280000,
    salaryRange: [200000, 400000],
    capex: 12000000,
    capexRange: [6000000, 25000000],
    wc: 2500000,
    meta: 'маржа 75–88%'
  },
  grocery: {
    name: 'Магазин у дома',
    emoji: 'ShoppingCart',
    area: 80,
    areaRange: [40, 150],
    rent: 7000,
    rentRange: [4500, 11000],
    check: 2800,
    checkRange: [1500, 4500],
    clients: 180,
    clientsRange: [100, 300],
    days: 30,
    daysRange: [30, 31],
    cogs: 75,
    cogsRange: [72, 82],
    mkt: 1,
    staff: 4,
    staffRange: [3, 6],
    salary: 220000,
    salaryRange: [180000, 280000],
    capex: 7000000,
    capexRange: [4000000, 15000000],
    wc: 6000000,
    meta: 'маржа 18–28% · оборот важнее'
  },
  retail: {
    name: 'Магазин одежды',
    emoji: 'Shirt',
    area: 60,
    areaRange: [30, 150],
    rent: 11000,
    rentRange: [7000, 18000],
    check: 22000,
    checkRange: [10000, 50000],
    clients: 20,
    clientsRange: [10, 40],
    days: 30,
    daysRange: [28, 31],
    cogs: 50,
    cogsRange: [40, 60],
    mkt: 8,
    staff: 3,
    staffRange: [2, 5],
    salary: 230000,
    salaryRange: [180000, 320000],
    capex: 15000000,
    capexRange: [8000000, 30000000],
    wc: 12000000,
    meta: 'оборотка 40%+ от CAPEX'
  },
  fitness: {
    name: 'Студия фитнеса',
    emoji: 'Dumbbell',
    area: 200,
    areaRange: [100, 500],
    rent: 6000,
    rentRange: [4000, 10000],
    check: 35000,
    checkRange: [20000, 60000],
    clients: 8,
    clientsRange: [5, 15],
    days: 30,
    daysRange: [28, 30],
    cogs: 8,
    cogsRange: [5, 12],
    mkt: 8,
    staff: 6,
    staffRange: [4, 10],
    salary: 280000,
    salaryRange: [200000, 400000],
    capex: 25000000,
    capexRange: [12000000, 50000000],
    wc: 3000000,
    meta: 'абонементы · низкая COGS'
  }
};

export const BENCHMARKS: Record<string, { ebitda: number[], payback: number[], rent: number[] }> = {
  coffee:     { ebitda:[8,18,28],   payback:[42,24,14], rent:[28,18,12] },
  bakery:     { ebitda:[6,14,22],   payback:[48,28,18], rent:[25,17,11] },
  restaurant: { ebitda:[5,12,20],   payback:[54,32,20], rent:[22,15,10] },
  barber:     { ebitda:[12,22,35],  payback:[36,20,12], rent:[20,13,8]  },
  beauty:     { ebitda:[10,20,32],  payback:[40,24,14], rent:[22,14,9]  },
  grocery:    { ebitda:[3,8,14],    payback:[48,30,18], rent:[18,11,7]  },
  retail:     { ebitda:[6,14,24],   payback:[54,30,18], rent:[30,20,13] },
  fitness:    { ebitda:[8,18,30],   payback:[50,30,18], rent:[25,16,10] }
};

