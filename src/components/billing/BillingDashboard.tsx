
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillableHoursTable } from "./BillableHoursTable";
import { InvoicesTable } from "./InvoicesTable";
import { AddBillableHourDialog } from "./AddBillableHourDialog";
import { CreateInvoiceDialog } from "./CreateInvoiceDialog";
import { BillingStats } from "./BillingStats";

export function BillingDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Invoices</h1>
          <p className="text-gray-600">Manage billable hours, invoices, and payments</p>
        </div>
      </div>

      <BillingStats />

      <Tabs defaultValue="billable-hours" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="billable-hours">Billable Hours</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="billable-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Billable Hours</CardTitle>
                  <CardDescription>Track time spent on client work</CardDescription>
                </div>
                <AddBillableHourDialog />
              </div>
            </CardHeader>
            <CardContent>
              <BillableHoursTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Manage client invoices and billing</CardDescription>
                </div>
                <CreateInvoiceDialog />
              </div>
            </CardHeader>
            <CardContent>
              <InvoicesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Track invoice payments and outstanding balances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Payments functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
