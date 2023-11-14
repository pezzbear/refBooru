
<script>
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
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

    /**
     * @type {any[]} 
     * array used to display tag suggestions to the user
     */
    let tagSuggestions = [];

      // flag to keep track if the user is tabbed into the search bar 
    let isInputFocused = false;

      // tracks the users current search input query
    let searchQuery = "";

    let imageIsResized = false;

    let resizedPercent = 0;


    /**
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

    function setResizePercent() {

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

    /**
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