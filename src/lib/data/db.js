// api/db.js
import sql from 'mssql';

const config = {
    server: 'DESKTOP-OFA3G4J',
    database: 'RefBooru',
    options: {
      trustedConnection: true, // Use Windows Authentication
    },
  };
  

  export async function fetchData() {
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Query the database
      const result = await sql.query('SELECT * FROM your_table');
  
      // Return the data
      return result.recordset;
    } catch (error) {
      // Handle errors
      console.error(error);
      throw error; 
    } finally {
      // Close the connection
      await sql.close();
    }
  }
