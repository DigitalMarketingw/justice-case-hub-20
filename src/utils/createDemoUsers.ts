
import { supabase } from "@/integrations/supabase/client";

// This is a utility function to create demo users with the specified credentials
// Note: This should only be run once to set up demo data
export const createDemoUsers = async () => {
  const demoUsers = [
    {
      email: "superadmin@demo.com",
      password: "admin123",
      role: "super_admin",
      firstName: "Super",
      lastName: "Admin"
    },
    {
      email: "firmadmin@demo.com", 
      password: "admin123",
      role: "firm_admin",
      firstName: "Firm",
      lastName: "Admin"
    },
    {
      email: "attorney@demo.com",
      password: "password",
      role: "attorney", 
      firstName: "John",
      lastName: "Attorney"
    },
    {
      email: "client@demo.com",
      password: "password",
      role: "client",
      firstName: "Jane",
      lastName: "Client"
    }
  ];

  console.log('Starting demo user creation...');

  for (const user of demoUsers) {
    try {
      console.log(`Creating ${user.role}: ${user.email}`);
      
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
          },
        },
      });

      if (error) {
        console.error(`Error creating ${user.role}:`, error.message);
        
        // If user already exists, try to sign them in to verify the account works
        if (error.message.includes('already registered')) {
          console.log(`User ${user.email} already exists, testing login...`);
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });
          
          if (signInError) {
            console.error(`Login test failed for ${user.email}:`, signInError.message);
          } else {
            console.log(`Login test successful for ${user.email}`);
            // Sign out immediately after test
            await supabase.auth.signOut();
          }
        }
      } else {
        console.log(`Successfully created ${user.role}: ${user.email}`);
        
        if (data.user) {
          console.log(`User created with ID: ${data.user.id}`);
          
          // If this is the firm admin, associate them with the demo firm
          if (user.role === 'firm_admin') {
            try {
              // Wait a moment for the profile to be created by the trigger
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  firm_id: '00000000-0000-0000-0000-000000000001' 
                })
                .eq('id', data.user.id);
                
              if (updateError) {
                console.error(`Error associating ${user.role} with firm:`, updateError.message);
              } else {
                console.log(`Successfully associated ${user.role} with demo firm`);
              }
            } catch (updateError) {
              console.error(`Failed to associate ${user.role} with firm:`, updateError);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to create ${user.role}:`, error);
    }
  }
  
  console.log('Demo user creation completed!');
};

// Helper function to create some demo data
export const createDemoData = async () => {
  try {
    console.log('Creating demo data...');
    
    // You can call this function after creating users to add some sample cases, documents, etc.
    // This would require the users to be already authenticated
    
    console.log('Demo data creation completed!');
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};
