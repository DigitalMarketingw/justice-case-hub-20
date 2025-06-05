
import { supabase } from "@/integrations/supabase/client";

// This is a utility function to create demo users
// Note: This should only be run once to set up demo data
export const createDemoUsers = async () => {
  const demoUsers = [
    {
      email: "superadmin@demo.com",
      password: "demo123",
      role: "super_admin",
      firstName: "Super",
      lastName: "Admin"
    },
    {
      email: "firmadmin@demo.com", 
      password: "demo123",
      role: "firm_admin",
      firstName: "Firm",
      lastName: "Admin"
    },
    {
      email: "attorney@demo.com",
      password: "demo123",
      role: "attorney", 
      firstName: "John",
      lastName: "Attorney"
    },
    {
      email: "client@demo.com",
      password: "demo123",
      role: "client",
      firstName: "Jane",
      lastName: "Client"
    }
  ];

  for (const user of demoUsers) {
    try {
      const { error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
          },
        },
      });

      if (error) {
        console.error(`Error creating ${user.role}:`, error.message);
      } else {
        console.log(`Successfully created ${user.role}: ${user.email}`);
      }
    } catch (error) {
      console.error(`Failed to create ${user.role}:`, error);
    }
  }
};
