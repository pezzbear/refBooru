//import db from ''

// src/routes/your-page/+page.server.js

import { fetchData } from '$lib/data/db';

export async function load({ params }) {
  try {
    // Call the function from db.js to fetch data
    const data = await fetchData();

    // Return the data to be used in the page component
    return {
      props: {
        data,
      },
    };
  } catch (error) {
    // Handle errors
    console.error(error);

    // Return an error object if needed
    return {
      status: 500,
      error: 'Internal Server Error',
    };
  }
}
