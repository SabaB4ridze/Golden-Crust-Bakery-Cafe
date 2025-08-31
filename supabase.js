// The 'supabase' variable is now available globally from the CDN script in index.html
const { createClient } = supabase;

// Initialize Supabase client
const supabaseUrl = 'https://iiazauqlbjlcrcyvndqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYXphdXFsYmpsY3JjeXZuZHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTQ4MTEsImV4cCI6MjA2OTYzMDgxMX0.c3d0CEcG1c0aSLE0TWtZ5B8lzgK_7ryLaQNUK546ElQ';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Function to fetch menu items from Supabase
// This function is now globally available and can be called from script.js
async function fetchMenuItems() {
    const { data, error } = await supabaseClient
        .from('menu_data')
        .select('*');

    if (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
    return data;
}

// Function to handle reservations
// This function is now globally available
async function createReservation(name, date, time, guests) {
    const { data, error } = await supabaseClient
        .from('reservations')
        .insert([{ name, date, time, guests }]);

    if (error) {
        console.error('Error creating reservation:', error);
        return null;
    }
    return data;
}