
<script>
    import { goto } from '$app/navigation';
    import Cookies from 'js-cookie';
    export let data
    // Variable Initiation -----------------------------------------------------------------------------------------------------------
    
      // Data references from the database
    const references = data.images

    const tags = data.tags

    const imageTags = data.imageTags

    const tagType = data.tagTypes

      // # of tags displayed to the user on the side bar
    const numberOfTagsDisplayed = 20;

      // tracks the current page the user is on
    let currentPage = 0;
      
      // images shown to the user per page
    let itemsPerPage = 10;

      // gets the total # of pages that can be depending on the # of images shown to the user
    $: totalPages = Math.ceil(references.length/itemsPerPage);

    /**
     * @type {any[]} 
     * array used to display tag suggestions to the user
     */
    let tagSuggestions = [];

      // flag to keep track if the user is tabbed into the search bar 
    let isInputFocused = false;

      // tracks the users current search input query
    let searchQuery = data.query ?? "";


      /**
     * Initializes cookies for when a user first enters the site
     */
    function initCookies() {
      if (getCookie('itemsPerPage') == undefined) {
        setCookie('itemsPerPage', itemsPerPage, { expires: 365 });
        savedItemsPerPage = itemsPerPage;
      }
    }

    // TAG SEARCH UTILITY --------------------------------------------------------------------------------------------------------------

    /**
     * Handles the user's search input and routes them to the home page with the search query 
     * @param event Default input event to be disabled. Don't pass an argument
     */
    function handleSearch(/** @type {{ preventDefault: () => void; }} */ event) {
      event.preventDefault();
      goto(`/${searchQuery.toLowerCase()}`);
    };

    // Returns all of the visible images that get displayed on the page
    $: getVisibleImages = () => {
      const start = currentPage * itemsPerPage;
      const end = Math.min(start + itemsPerPage, references.length);
      totalPages = Math.ceil(references.length/itemsPerPage);
      return references.slice(start, end);
    }

    // Returns all of the visible images that get displayed on the page sorted by tag
    function getVisibleImagesByTag(searchTags = "") {
        //Search Logic
        /**
           * @type {{ imageID: number; imageURL: string; }[]}
           */
        let searchedRefArray = [];
        //First take the tags and convert them into an array with each entry being a tagID.
        const tagArray = searchTags.split(' ');
        /**
           * @type {number[]}
        */
        let tagIDArray = [];

        tags.forEach((/** @type {{ tagName: string; tagID: number; }} */ getTag) => {
          tagArray.forEach(name => {
            if (getTag.tagName == name) {
              tagIDArray.push(getTag.tagID);
            }
          });
        });

        //Looping through all off the reference images and checking if they have the included tags
        references.forEach((/** @type {{ imageID: any; imageURL: string; }} */ ref) => {
          let refIsValid = true; // Initialize a flag for each ref

          for (let i = 0; i < tagIDArray.length; i++) {
            if (!ImageHasTag(ref.imageID, tagIDArray[i])) {
              refIsValid = false; // Set the flag to false and break the loop
              break;
            }
          }

          if (refIsValid) {
            // Only if ref is valid for all tags, add it to the new array
            searchedRefArray.push(ref);
          }
        });

        //returning all of the tags to be displayed
        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, searchedRefArray.length);
        totalPages = Math.ceil(searchedRefArray.length/itemsPerPage);
        return searchedRefArray.slice(start, end);
    }
    
    /**
     * @param {number} imageID
     * @param {number} tagID
     */
     function ImageHasTag(imageID, tagID) {
        for (const imageTag of imageTags) {
          if (imageID == imageTag.imageID && tagID == imageTag.tagID) {
            return true;
          }
        }
        return false;
      }

    function handleInputChange() {
      const query = searchQuery.toLowerCase();
      const queryArray = query.split(" ");
      const nextTag = queryArray[queryArray.length-1];

      // Filter tags that match the input query
      tagSuggestions = tags.filter((/** @type {{ tagName: string; }} */ tag) => tag.tagName.startsWith(nextTag));

      if (searchQuery === "") {
        tagSuggestions = [];
      }
    }

    /**
     * @param {number} _tagID
     */
    function getTagColor(_tagID) {
      let tagColor;

      tags.forEach((/** @type {{ tagID: number; tagTypeID: any; }} */ t) => {
        tagType.forEach((/** @type {{ tagTypeID: any; typeColor: any; }} */ tt) => {
          if (t.tagID == _tagID && tt.tagTypeID == t.tagTypeID) {
            tagColor = tt.typeColor;
          }
        });
      });

      return tagColor;
    }

    /**
     * @param {number} _tagID
     */
    function getTagQuantity(_tagID) {
      
      let val = 0;
      
      imageTags.forEach((/** @type {{ tagID: any; }} */ imageTag) => {
        const TagID = imageTag.tagID;
        if (_tagID == TagID) {
            val++
        }
      });

      return val;
    }


    function selectTag(/** @type {{ tagName: string; }} */ tag) {
      // Handle selecting a tag from suggestions
      const queryArray = searchQuery.split(" ");
      searchQuery = "";
      if(queryArray.length == 1) {
        searchQuery = tag.tagName
      } else {
          for(let i = 0; i < queryArray.length; i++) {
            if(i == queryArray.length - 1) {
              searchQuery = searchQuery + tag.tagName
            } else {
              searchQuery = searchQuery + queryArray[i] + " "
          }
        }
      }
      
      tagSuggestions = []; // Clear suggestions
      goto(`/${searchQuery.toLowerCase()}`);
    }

    function handleInputFocus() {
      isInputFocused = true;
    }

    function handleInputBlur() {
      setTimeout(() => {
        isInputFocused = false;
      }, 1000);
    }
      

    // TAG UTILITY ----------------------------------------------------------------------------------------------------- 

    // Returns a list of the top 20 tags sorted by the amount of images that have that tag
    function getTagsByNumberOfEntry(tagsDisplayed = tags.length) {
        let tempMap = new Map();

        // Count the occurrences of each TagID in imageTags
        imageTags.forEach((/** @type {{ tagID: any; }} */ imageTag) => {
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

        //Take that array, and conver it to a new array with [TagID, Color]

        let exportMap = new Map();

        let count = 0;

        if(count < tagsDisplayed) {
          tempArray.forEach(a => {
            tags.forEach(t => {
              if(t.tagID === a[0]) {
                tagType.forEach((/** @type {{ tagTypeID: any; typeColor: any; }} */ tt) => {
                  if(tt.tagTypeID === t.tagTypeID) {
                    const arry = [tt.typeColor, a[1]]
                    exportMap.set(t.tagName, arry);
                    count ++;
                  }
                })
              }
            })
          });
        }

        return exportMap;
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

  initCookies()
  
  //Support functions for utility purposes
  /**
     * @param {string} string
     */
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  

</script>

<div class="container-fluid">
    <div class="row">
        <!-- SideBar Search and Tag Layout -->
        <nav class="col-md-3 d-md-block sidebar">
            <div class="position-sticky form-content">
                <!-- Search -->  
                <h5 id="search-for-images">Search for Images</h5>
                <form class="search-bar text-center" method="GET" on:submit={handleSearch}>
                    <input name="search" autocomplete="off" bind:value={searchQuery} on:input={handleInputChange} on:focus={handleInputFocus} on:blur={handleInputBlur}>

                    <!-- Search Suggestions -->
                    {#if isInputFocused && tagSuggestions.length !=0}
                    <ul class="tag-suggestion-list">
                      {#each tagSuggestions as tag (tag.tagID)}
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li class="tag-suggestion" on:keydown={() => selectTag(tag)} on:click={() => selectTag(tag)}>
                          <span style="color: {getTagColor(tag.tagID)}">{tag.tagName}</span>
                          <p>{getTagQuantity(tag.tagID)}</p>
                        </li>
                      {/each}
                    </ul>
                    {/if}
                    
                    <button on:click={handleSearch} type="button">Search</button>
                </form>

                <!-- Tags -->
                <h5 id="tags">Tags: </h5>
                <ul class="tags-list">
                    {#each getTagsByNumberOfEntry(numberOfTagsDisplayed) as imgTag}
                      <li>
                        <p class="tag-p">  
                          <a style="color: {imgTag[1][0]}" href="/{imgTag[0].toLowerCase()}" on:click={() => searchQuery = imgTag[0].toLowerCase()}>{imgTag[0]}</a>
                          {imgTag[1][1]}
                        </p>
                      </li>
                    {/each}
                </ul>

                <h5>Tag Legend</h5>
                <ul class="tag-legend">
                  {#each tagType as tt}
                    <li class="row">
                      <div class="circle text-center" style="background:{tt.typeColor}">{capitalizeFirstLetter(tt.typeName)}</div>
                    </li>
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
                {#if !data.query}
                {#each getVisibleImages() as image, index (image.imageID)}
                    <div class="col-md-2"> 
                      <a href="/image/{image.imageID}">
                        <img class="img-thumbnail" src="Images/{image.imageURL}" alt={`Image ${image.imageID}`} />
                      </a>
                    </div>
                {/each}
                {:else}
                  {#if getVisibleImagesByTag(data.query).length != 0}
                    {#each getVisibleImagesByTag(data.query) as image, index (image.imageID)}
                      <div class="col-md-2"> 
                        <a href="/image/{image.imageID}">
                          <img class="img-thumbnail" src="Images/{image.imageURL}" alt={`Image ${image.imageID}`} />
                        </a>
                      </div>
                    {/each}
                  {:else}
                    <p class="text-center">No Results Found</p>
                  {/if}
                {/if}
              
            </div>

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
        </main>
    </div>
</div>