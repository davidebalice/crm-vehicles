import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Event types from the API
interface Appointment {
  id: number;
  customerId: number;
  vehicleId: number;
  userId: number;
  type: string;
  date: string;
  status: string;
  notes: string | null;
}

interface Service {
  title: any;
  dueDate: string | number | Date;
  id: number;
  description: string;
  customerId: number;
  vehicleId: number;
  serviceDate: string;
  completionDate: string | null;
  cost: number;
  status: string;
  notes: string | null;
  partsCost: number;
  laborCost: number;
}

interface Reminder {
  id: number;
  vehicleId: number;
  customerId: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
  userId: number;
  type: string;
  notifyDates: string[];
}

// Unified event interface for the calendar
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: "appointment" | "service" | "reminder";
    status?: string;
    customerId?: number;
    vehicleId?: number;
    originalData: any;
  };
}

// Set up localizer for the calendar (Italian locale)
const locales = {
  it: it,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom event styling
const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = "#3a86ff"; // Default blue

  // Different colors based on event type
  if (event.resource.type === "appointment") {
    backgroundColor = "#3a86ff"; // Blue for appointments
  } else if (event.resource.type === "service") {
    backgroundColor = "#ff006e"; // Pink for services

    // Different styles based on service status
    if (event.resource.status === "completed") {
      backgroundColor = "#8ac926"; // Green for completed
    } else if (event.resource.status === "in-progress") {
      backgroundColor = "#ffbe0b"; // Yellow for in-progress
    }
  } else if (event.resource.type === "reminder") {
    backgroundColor = "#8338ec"; // Purple for reminders

    // Check if reminder is completed
    const reminder = event.resource.originalData as Reminder;
    if (reminder.isCompleted) {
      backgroundColor = "#8ac926"; // Green for completed
    }
  }

  return {
    style: {
      backgroundColor,
      borderRadius: "5px",
      color: "white",
      border: "none",
      display: "block",
    },
  };
};

export default function CalendarPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState({
    appointments: true,
    services: true,
    reminders: true,
  });

  const token = localStorage.getItem("jwt_token");

  const fetchWithToken = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Errore nel fetch di ${url}`);
    }

    return res.json();
  };

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    queryFn: () => fetchWithToken("/api/appointments"),
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    queryFn: () => fetchWithToken("/api/services"),
  });

  const { data: reminders } = useQuery<Service[]>({
    queryKey: ["/api/reminders"],
    queryFn: () => fetchWithToken("/api/reminders"),
  });

  // Process data into calendar events
  useEffect(() => {
    const newEvents: CalendarEvent[] = [];

    // Add appointments
    if (Array.isArray(appointments) && filters.appointments) {
      appointments.forEach((appointment) => {
        newEvents.push({
          id: appointment.id,
          title: `Prenotazione: ${appointment.type}`,
          start: new Date(appointment.date),
          end: new Date(
            new Date(appointment.date).setHours(
              new Date(appointment.date).getHours() + 1
            )
          ),
          resource: {
            type: "appointment",
            status: appointment.status,
            customerId: appointment.customerId,
            vehicleId: appointment.vehicleId,
            originalData: appointment,
          },
        });
      });
    }

    // Add services
    if (Array.isArray(services) && filters.services) {
      services.forEach((service) => {
        newEvents.push({
          id: service.id,
          title: `Intervento: ${service.description}`,
          start: new Date(service.serviceDate),
          end: service.completionDate
            ? new Date(service.completionDate)
            : new Date(
                new Date(service.serviceDate).setHours(
                  new Date(service.serviceDate).getHours() + 2
                )
              ),
          resource: {
            type: "service",
            status: service.status,
            customerId: service.customerId,
            vehicleId: service.vehicleId,
            originalData: service,
          },
        });
      });
    }

    // Add reminders
    if (Array.isArray(reminders) && filters.reminders) {
      reminders.forEach((reminder) => {
        newEvents.push({
          id: reminder.id,
          title: `Promemoria: ${reminder.title}`,
          start: new Date(reminder.dueDate),
          end: new Date(
            new Date(reminder.dueDate).setHours(
              new Date(reminder.dueDate).getHours() + 1
            )
          ),
          resource: {
            type: "reminder",
            customerId: reminder.customerId,
            vehicleId: reminder.vehicleId,
            originalData: reminder,
          },
        });
      });
    }

    setEvents(newEvents);
  }, [appointments, services, reminders, filters, isLoading]);

  // Custom event component to display more information
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div title={event.title} className="w-full h-full overflow-hidden">
        <div className="text-xs font-semibold">{event.title}</div>
        {event.resource.type === "appointment" && (
          <div className="text-xs">Stato: {event.resource.status}</div>
        )}
        {event.resource.type === "service" && (
          <div className="text-xs">Stato: {event.resource.status}</div>
        )}
        {event.resource.type === "reminder" && (
          <div className="text-xs">
            {(event.resource.originalData as Reminder).isCompleted
              ? "Completato"
              : "In attesa"}
          </div>
        )}
      </div>
    );
  };

  const handleEventSelect = (event: CalendarEvent) => {
    // We could navigate to the detail page of this event in the future
    toast({
      title: event.title,
      description: `Tipo: ${event.resource.type}, ID: ${event.id}`,
    });
  };

  const toggleFilter = (type: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <h1 className="text-3xl font-bold">Calendario Concessionaria</h1>
      <p className="text-muted-foreground">
        Visualizzazione completa di appuntamenti, interventi e promemoria.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="appointments"
                  checked={filters.appointments}
                  onCheckedChange={() => toggleFilter("appointments")}
                  className="data-[state=checked]:bg-blue-500"
                />
                <Label htmlFor="appointments" className="font-medium">
                  Prenotazioni
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="services"
                  checked={filters.services}
                  onCheckedChange={() => toggleFilter("services")}
                  className="data-[state=checked]:bg-pink-500"
                />
                <Label htmlFor="services" className="font-medium">
                  Interventi
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminders"
                  checked={filters.reminders}
                  onCheckedChange={() => toggleFilter("reminders")}
                  className="data-[state=checked]:bg-purple-500"
                />
                <Label htmlFor="reminders" className="font-medium">
                  Promemoria
                </Label>
              </div>

              <Separator />

              <div className="pt-2">
                <h3 className="font-semibold mb-2">Legenda:</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm">Prenotazioni</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-pink-500 rounded mr-2"></div>
                    <span className="text-sm">Interventi</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                    <span className="text-sm">Promemoria</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm">Completati</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-sm">In corso</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="month">
                <TabsList className="mb-4">
                  <TabsTrigger value="month">Mese</TabsTrigger>
                  <TabsTrigger value="week">Settimana</TabsTrigger>
                  <TabsTrigger value="day">Giorno</TabsTrigger>
                  <TabsTrigger value="agenda">Agenda</TabsTrigger>
                </TabsList>

                <TabsContent value="month" className="m-0">
                  <div className="h-[700px]">
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      views={["month"]}
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={handleEventSelect}
                      components={{
                        event: EventComponent,
                      }}
                      culture="it"
                      messages={{
                        month: "Mese",
                        today: "Oggi",
                        previous: "Indietro",
                        next: "Avanti",
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="week" className="m-0">
                  <div className="h-[700px]">
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      views={["week"]}
                      defaultView="week"
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={handleEventSelect}
                      components={{
                        event: EventComponent,
                      }}
                      culture="it"
                      messages={{
                        week: "Settimana",
                        today: "Oggi",
                        previous: "Indietro",
                        next: "Avanti",
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="day" className="m-0">
                  <div className="h-[700px]">
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      views={["day"]}
                      defaultView="day"
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={handleEventSelect}
                      components={{
                        event: EventComponent,
                      }}
                      culture="it"
                      messages={{
                        day: "Giorno",
                        today: "Oggi",
                        previous: "Indietro",
                        next: "Avanti",
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="agenda" className="m-0">
                  <div className="h-[700px]">
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      views={["agenda"]}
                      defaultView="agenda"
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={handleEventSelect}
                      components={{
                        event: EventComponent,
                      }}
                      culture="it"
                      messages={{
                        agenda: "Agenda",
                        today: "Oggi",
                        previous: "Indietro",
                        next: "Avanti",
                        noEventsInRange: "Nessun evento in questo periodo",
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
