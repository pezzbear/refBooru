
<script>
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    export let data
    // Variable Initiation -----------------------------------------------------------------------------------------------------------
    
    /** Pointer to all of the reference images in the db */
    const references = data.images

    /** Pointer to all of the tags in the db */
    const tags = data.tags

    /** Pointer to all of the ImageTags (connection between the reference images and the tags) in the db*/
    const imageTags = data.imageTags

    /** Pointer to the all of the tagTypes TODO rename all references to tagGroups*/
    const tagType = data.tagTypes

    /**
     * @type {any[]} 
     * Array used to display tag suggestions to the user
     */
    let tagSuggestions = [];

    /** Flag to keep track if the user is tabbed into the search bar */
    let isInputFocused = false;

    /** Tracks the users current search input query */
    let searchQuery = data.query ?? "";


    /**
     * Gets the imageURL of the passed imageID
     * @param {string} imageID
     */
    function getImageURL(imageID) {
        let imageURL = "";
        for(const ref of references) {
            if(ref.imageID.toString() === imageID) {
                imageURL = ref.imageURL;
                break;
            }
        }
        
        return imageURL
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
     * Returns the tag color hexadecimal of the passed tagID
     * @param {number} _tagID
     */
     function getTagColor(_tagID) {
      let tagColor
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
     * Returns the number of times the passed TagID has been assigned to an image
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


    /**
     * Selects the tag the user clicked on in the suggestion list and adds it to the searchQuery
     * @param tag
     */
     function selectTag(/** @type {{ tagName: string; }} */ tag) {
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

    /**
     * Used to set the isInputFocused flag to true when the search bar is in focus
     */
     function handleInputFocus() {
      isInputFocused = true;
    }

    /**
     * Used to set the isInputFocused flag to false after a delay when the search bar is out of focus
     */
    function handleInputBlur() {
      setTimeout(() => {
        isInputFocused = false;
      }, 1000);
    }
      

    // TAG UTILITY ----------------------------------------------------------------------------------------------------- 

    /**
     * Returns all of the tags associated with the passed imageID
     * @param {number} imageID
     */
    function getSelectedImageTags(imageID) {
      /**
         * @type {number[]}
         */
      let tagArry = [];
      imageTags.forEach(imgTags => {
        if (imgTags.imageID === imageID) {
          tagArry.push(imgTags.tagID);
        }
      })

      let exportMap = new Map();

      tagArry.forEach(a => {
        tags.forEach(t => {
          if(t.tagID === a) {
            tagType.forEach((/** @type {{ tagTypeID: any; typeColor: any; }} */ tt) => {
              if(tt.tagTypeID === t.tagTypeID) {
                const arry = [tt.typeColor]
                exportMap.set(t.tagName, arry);
              }
            })
          }
        })
      });

        return exportMap;
    }
  
  //Support functions for utility purposes
  /**
   * Returns the passed string but with the first letter capitalized.
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
                    {#each getSelectedImageTags(parseInt(data.query)) as imgTag}
                      <li>
                        <p class="tag-p">  
                          <a style="color: {imgTag[1][0]}" href="/{imgTag[0].toLowerCase()}" on:click={() => searchQuery = imgTag[0].toLowerCase()}>{imgTag[0]}</a> 
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
            <img width="700" class="big-image" src="../Images/{getImageURL(data.query)}" alt="{getImageURL(data.query)}"/>
        </main>
    </div>
</div>