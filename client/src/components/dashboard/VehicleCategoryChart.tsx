import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: "Auto Nuove", value: 42, color: "hsl(var(--primary))" },
  { name: "Auto Usate", value: 28, color: "hsl(var(--secondary))" },
  { name: "Moto Nuove", value: 18, color: "hsl(142, 72%, 29%)" },
  { name: "Moto Usate", value: 12, color: "hsl(45, 93%, 47%)" },
];

const COLORS = data.map(item => item.color);

const VehicleCategoryChart: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Veicoli per Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, "Percentuale"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <span 
                className="h-3 w-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-sm">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCategoryChart;
