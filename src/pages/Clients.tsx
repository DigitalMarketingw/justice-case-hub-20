
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Mail, Phone } from "lucide-react";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - will be replaced with Supabase data
  const clients = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      company: "Johnson Enterprises",
      status: "Active",
      cases: 2,
      lastContact: "2024-01-15",
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+1 (555) 987-6543",
      company: "Brown & Associates",
      status: "Inactive",
      cases: 1,
      lastContact: "2023-12-20",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 456-7890",
      company: "Davis Legal Solutions",
      status: "Active",
      cases: 3,
      lastContact: "2024-01-18",
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600">Manage your client relationships</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <p className="text-sm text-gray-600">{client.company}</p>
                      </div>
                    </div>
                    <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {client.phone}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-600">
                        {client.cases} active cases
                      </span>
                      <span className="text-sm text-gray-600">
                        Last contact: {client.lastContact}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Clients;
