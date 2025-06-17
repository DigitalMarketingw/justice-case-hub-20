import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth";

// This is a utility function to create demo users with the specified credentials
// Note: This should only be run once to set up demo data
export const createDemoUsers = async () => {
  console.log('Starting enhanced demo user creation...');
  
  // First, create a demo firm if it doesn't exist
  const demoFirmId = '00000000-0000-0000-0000-000000000001';
  
  try {
    const { data: existingFirm } = await supabase
      .from('firms')
      .select('id')
      .eq('id', demoFirmId)
      .single();
    
    if (!existingFirm) {
      console.log('Creating demo firm...');
      const { error: firmError } = await supabase
        .from('firms')
        .insert({
          id: demoFirmId,
          name: 'Demo Law Firm',
          address: '123 Legal Street, Law City, LC 12345',
          phone: '(555) 123-4567',
          email: 'contact@demolawfirm.com',
          website: 'https://demolawfirm.com'
        });
      
      if (firmError) {
        console.error('Error creating demo firm:', firmError);
      } else {
        console.log('Demo firm created successfully');
      }
    }
  } catch (error) {
    console.error('Error checking/creating demo firm:', error);
  }

  const demoUsers = [
    {
      email: "superadmin@demo.com",
      password: "admin123",
      role: "super_admin" as UserRole,
      firstName: "Super",
      lastName: "Admin",
      firmId: null // Super admin doesn't belong to a specific firm
    },
    {
      email: "firmadmin@demo.com", 
      password: "admin123",
      role: "firm_admin" as UserRole,
      firstName: "Firm",
      lastName: "Admin",
      firmId: demoFirmId
    },
    {
      email: "casemanager@demo.com",
      password: "password",
      role: "case_manager" as UserRole,
      firstName: "Case",
      lastName: "Manager",
      firmId: demoFirmId
    },
    {
      email: "attorney@demo.com",
      password: "password",
      role: "attorney" as UserRole, 
      firstName: "John",
      lastName: "Attorney",
      firmId: demoFirmId
    },
    {
      email: "client@demo.com",
      password: "password",
      role: "client" as UserRole,
      firstName: "Jane",
      lastName: "Client",
      firmId: demoFirmId
    }
  ];

  for (const user of demoUsers) {
    try {
      console.log(`Creating/updating ${user.role}: ${user.email}`);
      
      // First check if user already exists by trying to get their profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', user.email)
        .single();
      
      if (!existingProfile) {
        // Create user with email confirmation bypassed
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: user.firstName,
              last_name: user.lastName,
              role: user.role,
              firm_id: user.firmId,
            },
          },
        });

        if (error) {
          console.error(`Error creating ${user.role}:`, error.message);
        } else {
          console.log(`Successfully created ${user.role}: ${user.email}`);
          
          if (data.user) {
            // Wait for the profile to be created by the trigger
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update the profile with additional data and set last_login
            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  firm_id: user.firmId,
                  last_login: new Date().toISOString(), // Set last_login to prevent onboarding loop
                  is_active: true
                })
                .eq('id', data.user.id);
                
              if (updateError) {
                console.error(`Error updating ${user.role} profile:`, updateError.message);
              } else {
                console.log(`Successfully updated ${user.role} profile with firm association`);
              }
            } catch (updateError) {
              console.error(`Failed to update ${user.role} profile:`, updateError);
            }
          }
        }
      } else {
        // User exists, just update their profile to ensure proper data
        console.log(`User ${user.email} already exists, updating profile...`);
        
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              firm_id: user.firmId,
              first_name: user.firstName,
              last_name: user.lastName,
              role: user.role,
              last_login: new Date().toISOString(), // Ensure last_login is set
              is_active: true
            })
            .eq('email', user.email);
            
          if (updateError) {
            console.error(`Error updating existing ${user.role} profile:`, updateError.message);
          } else {
            console.log(`Successfully updated existing ${user.role} profile`);
          }
        } catch (updateError) {
          console.error(`Failed to update existing ${user.role} profile:`, updateError);
        }
      }
    } catch (error) {
      console.error(`Failed to create/update ${user.role}:`, error);
    }
  }
  
  console.log('Enhanced demo user creation/update completed!');
  
  // Create some demo case data
  try {
    await createDemoData();
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};

// Helper function to create some demo data
export const createDemoData = async () => {
  try {
    console.log('Creating demo cases and data...');
    
    // Get the attorney and client profiles
    const { data: attorneyProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'attorney@demo.com')
      .single();
      
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'client@demo.com')
      .single();
    
    if (attorneyProfile && clientProfile) {
      // Check if demo cases already exist
      const { data: existingCases } = await supabase
        .from('cases')
        .select('id')
        .eq('attorney_id', attorneyProfile.id)
        .limit(1);
      
      if (!existingCases || existingCases.length === 0) {
        console.log('Creating demo cases...');
        
        const demoCases = [
          {
            title: 'Personal Injury Case - Vehicle Accident',
            case_number: 'PI-2024-001',
            client_id: clientProfile.id,
            attorney_id: attorneyProfile.id,
            status: 'active' as const,
            case_type: 'Personal Injury',
            description: 'Vehicle accident case involving multiple parties',
            court_date: '2024-06-20T10:00:00Z'
          },
          {
            title: 'Contract Dispute - Business Agreement',
            case_number: 'CD-2024-002',
            client_id: clientProfile.id,
            attorney_id: attorneyProfile.id,
            status: 'pending' as const,
            case_type: 'Contract Law',
            description: 'Dispute over commercial contract terms'
          }
        ];
        
        const { error: casesError } = await supabase
          .from('cases')
          .insert(demoCases);
        
        if (casesError) {
          console.error('Error creating demo cases:', casesError);
        } else {
          console.log('Demo cases created successfully');
        }
      }
    }
    
    console.log('Demo data creation completed!');
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};
