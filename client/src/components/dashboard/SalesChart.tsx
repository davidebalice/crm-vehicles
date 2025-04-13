import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SalesData {
  name: string;
  value: number;
}

const mockData: Record<string, SalesData[]> = {
  "7days": [
    { name: "Lun", value: 12000 },
    { name: "Mar", value: 19000 },
    { name: "Mer", value: 8000 },
    { name: "Gio", value: 24000 },
    { name: "Ven", value: 18000 },
    { name: "Sab", value: 32000 },
    { name: "Dom", value: 15000 },
  ],
  "30days": [
    { name: "Sett 1", value: 65000 },
    { name: "Sett 2", value: 78000 },
    { name: "Sett 3", value: 92000 },
    { name: "Sett 4", value: 51000 },
  ],
  "90days": [
    { name: "Gen", value: 185000 },
    { name: "Feb", value: 192000 },
    { name: "Mar", value: 235000 },
  ],
};

const SalesChart: FC = () => {
  const [timeRange, setTimeRange] = useState("7days");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Andamento Vendite</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Seleziona periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Ultimi 7 giorni</SelectItem>
            <SelectItem value="30days">Ultimi 30 giorni</SelectItem>
            <SelectItem value="90days">Ultimi 90 giorni</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockData[timeRange]}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={(value) => `€${(value).toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value) => [`€${(value as number).toLocaleString()}`, "Vendite"]}
                labelStyle={{ color: "#1A4D88" }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
