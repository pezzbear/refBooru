
<script>
    //Image Data stuff
    export let data;

    const references = data.images

    const tags = data.tags

    const imageTags = data.imageTags

    const tagType = data.tagTypes

    let currentPage = 0;
    
    let itemsPerPage = 10;

    $: totalPages = Math.ceil(references.length/itemsPerPage);

    // Returns all of the visible images that get displayed on the page
    $: getVisibleImages = () => {
        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, references.length);
        return references.slice(start, end);
    }

    // Returns a list of the top 20 tags sorted by the amount of images that have that tag
    function getTagsByNumberOfEntry() {
        let tempMap = new Map();

        // Count the occurrences of each TagID in imageTags
        imageTags.forEach((imageTag) => {
            const TagID = imageTag.tagID;
            if (tempMap.has(TagID)) {
                let val = tempMap.get(TagID)
                val++
                tempMap.set(TagID, val);
            } else {
                tempMap.set(TagID, 1);
            }
        });

        // Converts the map to an array then sorts it by decending order (number of images per tag)
        const tempArray = [...new Set(tempMap)];

        tempArray.sort(compareSecondColumn)

        //Take that array, and figure
        
        return tempArray;
    }

    /** Function that is used to sort the tags array
         * @param {number[]} a
         * @param {number[]} b
         */
         function compareSecondColumn(a, b) {
            if (a[1] === b[1]) {
                return 0;
            }
            else {
                return (a[1] > b[1]) ? -1 : 1;
            }
        }

    /**
     * @param {number} page
     */
    function goToPage(page) {
        if (page >= 0 && page < totalPages) {
        currentPage = page;
        }
    }

    function nextPage() {
        if (currentPage != totalPages) {
            currentPage ++;
        }
    }

    function prevPage() {
        if (currentPage != 0) {
            currentPage --;
        }
    }

    
    //Cookies Manager Fuctions
    import Cookies from 'js-cookie';

  // Function to set a cookie
  /**
     * @param {any} name
     * @param {any} value
     * @param {any} options
     */
  function setCookie(name, value, options) {
    Cookies.set(name, value, options);
  }

  // Function to get the value of a cookie
  /**
     * @param {any} name
     */
  function getCookie(name) {
    return Cookies.get(name);
  }

  // Function to delete a cookie
  /**
     * @param {any} name
     */
  function deleteCookie(name) {
    Cookies.remove(name);
  }

  let savedItemsPerPage = getCookie('itemsPerPage');
  itemsPerPage = savedItemsPerPage

  function saveItemsPerPage() {
    if (itemsPerPage > 0) {
      setCookie('itemsPerPage', itemsPerPage, { expires: 365 });
      savedItemsPerPage = itemsPerPage;
    }
  }
    

</script>

<div class="container-fluid">
    <div class="row">
        <!-- SideBar Search and Tag Layout -->
        <nav class="col-md-3 d-md-block sidebar">
            <div class="position-sticky form-content">
                <!-- Search -->  
                <h5 id="search-for-images">Search for Images</h5>
                <form class="search-bar text-center" method="post">
                    <input name="search" autocomplete="off">
                    <button type="button">Search</button>
                </form>
                <!-- Tags -->
                <h5 id="tags">Tags: </h5>
                <ul>
                    {#each getTagsByNumberOfEntry() as imgTag}
                      
                      <li></li>
                    {/each}
                </ul>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="col-md-9 img-grid">
            <div class="item-per-dropdown justify-content-end">
                <div class="dropdown-container">
                    <label style="padding-bottom: 3px; padding-right: 5px;" for="itemsPerPage" class="align-middle">Images Per Page: </label>
                    <select placeholder=10 bind:value={itemsPerPage} on:change={() => saveItemsPerPage()}>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                    </select>
                </div>
                  
            </div>
            <div class="row">
                {#each getVisibleImages() as image, index (image.imageID)}
                    <div class="col-md-2"> 
                        <img class="img-thumbnail" src="images/{image.imageURL}" alt={`Image ${image.imageID}`} />
                    </div>
                {/each}
            </div>
        </main>

        <div class="col-md text-center button-container">
            <button on:click={prevPage} disabled={currentPage === 0}>&lt</button>
          
            <!-- Render page number buttons and ellipsis (...) -->
            {#if totalPages > 1}
              {#if currentPage > 1}
                <button on:click={() => goToPage(0)}>1</button>
              {/if}
          
              {#if currentPage > 2}
                <span>...</span>
              {/if}
          
              {#if currentPage > 0}
                <button on:click={() => goToPage(currentPage - 1)}>{currentPage}</button>
              {/if}
          
              <button disabled>{currentPage + 1}</button> 
          
              {#if currentPage < totalPages - 1}
                <button on:click={() => goToPage(currentPage + 1)}>{currentPage + 2}</button>
              {/if}
          
              {#if currentPage < totalPages - 3}
                <span>...</span>
              {/if}
          
              {#if currentPage < totalPages - 2}
                <button on:click={() => goToPage(totalPages - 1)}>{totalPages}</button>
              {/if}
            {/if}
          
            <button on:click={nextPage} disabled={currentPage >= totalPages - 1}>&gt</button>
          </div>
    </div>
</div>