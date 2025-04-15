import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  BadgeDollarSign,
  CalendarCheck,
  Users,
  ShipWheel,
  Wrench,
  BanknoteIcon,
  CreditCard
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import VehicleCategoryChart from "@/components/dashboard/VehicleCategoryChart";
import VehicleCard from "@/components/dashboard/VehicleCard";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import TaskCard from "@/components/dashboard/TaskCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const DashboardPage: FC = () => {
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<any[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });

  // Format date for appointments
  const formatAppointmentDate = (date: string) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (appointmentDate.toDateString() === today.toDateString()) {
      return "Oggi";
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return "Domani";
    } else {
      return appointmentDate.toLocaleDateString("it-IT", { 
        day: "2-digit", 
        month: "short" 
      });
    }
  };

  // Format time for appointments
  const formatAppointmentTime = (date: string) => {
    return new Date(date).toLocaleTimeString("it-IT", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica generale dell'attività</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Veicoli in stock" 
          value={isLoadingVehicles ? "..." : vehicles.length}
          trend={{ value: "12% dal mese scorso", positive: true }}
          icon={<Car className="w-full h-full" />}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
        />
        
        <StatCard 
          title="Vendite mensili" 
          value="€285,420"
          trend={{ value: "4% dal mese scorso", positive: false }}
          icon={<BadgeDollarSign className="w-full h-full" />}
          iconBgColor="bg-secondary/10"
          iconColor="text-secondary"
        />
        
        <StatCard 
          title="Appuntamenti" 
          value={isLoadingAppointments ? "..." : appointments.length}
          trend={{ value: "18% dal mese scorso", positive: true }}
          icon={<CalendarCheck className="w-full h-full" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        
        <StatCard 
          title="Clienti attivi" 
          value="312"
          trend={{ value: "8% dal mese scorso", positive: true }}
          icon={<Users className="w-full h-full" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        
        {/* Vehicle Categories */}
        <div>
          <VehicleCategoryChart />
        </div>
      </div>

      {/* Recent Vehicles & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base font-semibold">Veicoli Recenti</CardTitle>
            <Button variant="link" className="text-primary p-0">Vedi tutti</Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingVehicles ? (
              <div className="p-4 text-center text-muted-foreground">Caricamento veicoli...</div>
            ) : vehicles.length > 0 ? (
              <div>
                {vehicles.slice(0, 4).map((vehicle: any) => (
                  <VehicleCard 
                    key={vehicle.id}
                    id={vehicle.id}
                    name={vehicle.description?.split(' ').slice(0, 3).join(' ') || `Veicolo #${vehicle.id}`}
                    year={vehicle.year}
                    mileage={vehicle.mileage}
                    price={vehicle.price}
                    condition={vehicle.condition}
                    image={vehicle.images?.[0] || ''}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">Nessun veicolo disponibile</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base font-semibold">Prossimi Appuntamenti</CardTitle>
            <Button variant="link" className="text-primary p-0">Vedi tutti</Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingAppointments ? (
              <div className="p-4 text-center text-muted-foreground">Caricamento appuntamenti...</div>
            ) : appointments.length > 0 ? (
              <div>
                {appointments.slice(0, 4).map((appointment: any) => {
                  let icon, iconBgColor, iconColor, title;
                  
                  switch(appointment.type) {
                    case 'test_drive':
                      icon = <ShipWheel className="w-full h-full" />;
                      iconBgColor = "bg-primary-light/10";
                      iconColor = "text-primary";
                      title = "Test drive";
                      break;
                    case 'service':
                      icon = <Wrench className="w-full h-full" />;
                      iconBgColor = "bg-yellow-100";
                      iconColor = "text-yellow-600";
                      title = "Tagliando";
                      break;
                    case 'consultation':
                      icon = <CreditCard className="w-full h-full" />;
                      iconBgColor = "bg-green-100";
                      iconColor = "text-green-600";
                      title = "Consulenza finanziaria";
                      break;
                    case 'trade_in':
                      icon = <BanknoteIcon className="w-full h-full" />;
                      iconBgColor = "bg-secondary/10";
                      iconColor = "text-secondary";
                      title = "Valutazione permuta";
                      break;
                    default:
                      icon = <CalendarCheck className="w-full h-full" />;
                      iconBgColor = "bg-blue-100";
                      iconColor = "text-blue-600";
                      title = "Appuntamento";
                  }
                  
                  return (
                    <AppointmentCard 
                      key={appointment.id}
                      type={appointment.type}
                      title={title}
                      customer={appointment.customerId.toString()}
                      date={formatAppointmentDate(appointment.date)}
                      time={formatAppointmentTime(appointment.date)}
                      icon={icon}
                      iconBgColor={iconBgColor}
                      iconColor={iconColor}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">Nessun appuntamento programmato</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks/To-Do List */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base font-semibold">Attività da completare</CardTitle>
          <Button className="text-sm">
            <span className="mr-1">+</span> Nuova attività
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="text-center text-muted-foreground py-4">Caricamento attività...</div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.slice(0, 3).map((task: any) => (
                <TaskCard 
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  dueDate={new Date(task.dueDate).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                  assignedTo={{
                    name: "Mario Rossi",
                    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">Nessuna attività da completare</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
