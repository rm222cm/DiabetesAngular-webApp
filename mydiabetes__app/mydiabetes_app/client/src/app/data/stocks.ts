export interface Stock {
    date: Date;
    value: number;
}

export const STOCKS: Stock[] = [
    {date: new Date('2010-01-12'), value: 7.72},
    {date: new Date('2010-01-14'), value: 9.43},
    {date: new Date('2010-01-15'), value: 5.93},
    {date: new Date('2010-01-18'), value: 5.93},
    {date: new Date('2010-01-21'), value: 8.07},
];