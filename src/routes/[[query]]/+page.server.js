// Returns the parameter from the url. Used for the search functionality 
export async function load({ params }) {
	return {
       query: params.query
    }
}

