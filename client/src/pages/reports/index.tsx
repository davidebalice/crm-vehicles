import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  Car, 
  Wrench, 
  Users, 
  CreditCard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

const salesData = [
  { month: "Gen", cars: 12, motorcycles: 8 },
  { month: "Feb", cars: 19, motorcycles: 14 },
  { month: "Mar", cars: 15, motorcycles: 11 },
  { month: "Apr", cars: 22, motorcycles: 17 },
  { month: "Mag", cars: 25, motorcycles: 19 },
  { month: "Giu", cars: 18, motorcycles: 15 },
];

const inventoryData = [
  { name: "Auto Nuove", value: 35, color: "hsl(var(--primary))" },
  { name: "Auto Usate", value: 45, color: "hsl(var(--secondary))" },
  { name: "Moto Nuove", value: 10, color: "hsl(142, 72%, 29%)" },
  { name: "Moto Usate", value: 10, color: "hsl(45, 93%, 47%)" },
];

const serviceData = [
  { month: "Gen", value: 32 },
  { month: "Feb", value: 40 },
  { month: "Mar", value: 35 },
  { month: "Apr", value: 48 },
  { month: "Mag", value: 52 },
  { month: "Giu", value: 44 },
];

const profitData = [
  { month: "Gen", revenue: 120000, costs: 85000, profit: 35000 },
  { month: "Feb", revenue: 145000, costs: 95000, profit: 50000 },
  { month: "Mar", revenue: 132000, costs: 88000, profit: 44000 },
  { month: "Apr", revenue: 162000, costs: 102000, profit: 60000 },
  { month: "Mag", revenue: 175000, costs: 110000, profit: 65000 },
  { month: "Giu", revenue: 153000, costs: 98000, profit: 55000 },
];

const topSellingModels = [
  { name: "Audi A4", sales: 12, amount: 456000 },
  { name: "Volkswagen Golf", sales: 10, amount: 285000 },
  { name: "BMW Serie 3", sales: 8, amount: 320000 },
  { name: "Ducati Panigale", sales: 7, amount: 154000 },
  { name: "Honda CBR", sales: 6, amount: 120000 },
];

const ReportsPage: FC = () => {
  const [timeRange, setTimeRange] = useState("6months");
  const [reportType, setReportType] = useState("sales");
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl mb-1">Report e Analisi</h1>
          <p className="text-neutral-600">Visualizza e analizza i dati dell'attività</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Esporta Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Vendite totali</p>
                <p className="text-2xl font-bold">€1,084,000</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Veicoli venduti</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                <Car className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Interventi officina</p>
                <p className="text-2xl font-bold">251</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Nuovi clienti</p>
                <p className="text-2xl font-bold">78</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-[240px] space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtra Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Periodo</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Ultimi 30 giorni</SelectItem>
                    <SelectItem value="3months">Ultimi 3 mesi</SelectItem>
                    <SelectItem value="6months">Ultimi 6 mesi</SelectItem>
                    <SelectItem value="12months">Ultimi 12 mesi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo di Report</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Vendite</SelectItem>
                    <SelectItem value="inventory">Inventario</SelectItem>
                    <SelectItem value="service">Interventi Officina</SelectItem>
                    <SelectItem value="customers">Clienti</SelectItem>
                    <SelectItem value="profit">Redditività</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" /> Applica Filtri
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Disponibili</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm p-2 hover:bg-muted rounded cursor-pointer">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Report mensile vendite
                </li>
                <li className="flex items-center text-sm p-2 hover:bg-muted rounded cursor-pointer">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Andamento inventario
                </li>
                <li className="flex items-center text-sm p-2 hover:bg-muted rounded cursor-pointer">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Performance officina
                </li>
                <li className="flex items-center text-sm p-2 hover:bg-muted rounded cursor-pointer">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Analisi clienti
                </li>
                <li className="flex items-center text-sm p-2 hover:bg-muted rounded cursor-pointer">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Margini di profitto
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Tabs defaultValue={reportType} value={reportType} onValueChange={setReportType}>
            <TabsList className="mb-4">
              <TabsTrigger value="sales">Vendite</TabsTrigger>
              <TabsTrigger value="inventory">Inventario</TabsTrigger>
              <TabsTrigger value="service">Interventi</TabsTrigger>
              <TabsTrigger value="profit">Redditività</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Andamento Vendite</CardTitle>
                  <CardDescription>
                    Confronto vendite auto e moto negli ultimi 6 mesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} veicoli`, '']} />
                        <Legend />
                        <Bar name="Auto" dataKey="cars" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar name="Moto" dataKey="motorcycles" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Modelli più venduti</CardTitle>
                  <CardDescription>
                    I 5 modelli più venduti nel periodo selezionato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Modello</th>
                          <th className="text-center py-3 px-4">Unità vendute</th>
                          <th className="text-right py-3 px-4">Valore (€)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSellingModels.map((model, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{model.name}</td>
                            <td className="text-center py-3 px-4">{model.sales}</td>
                            <td className="text-right py-3 px-4">{model.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuzione Inventario</CardTitle>
                  <CardDescription>
                    Ripartizione dell'inventario attuale per categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {inventoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="service">
              <Card>
                <CardHeader>
                  <CardTitle>Andamento Interventi Officina</CardTitle>
                  <CardDescription>
                    Numero di interventi completati negli ultimi 6 mesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={serviceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} interventi`, '']} />
                        <Bar dataKey="value" fill="hsl(142, 72%, 29%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profit">
              <Card>
                <CardHeader>
                  <CardTitle>Analisi Redditività</CardTitle>
                  <CardDescription>
                    Andamento ricavi, costi e profitti negli ultimi 6 mesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={profitData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, '']} />
                        <Legend />
                        <Line type="monotone" name="Ricavi" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                        <Line type="monotone" name="Costi" dataKey="costs" stroke="hsl(var(--destructive))" strokeWidth={2} />
                        <Line type="monotone" name="Profitti" dataKey="profit" stroke="hsl(142, 72%, 29%)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
