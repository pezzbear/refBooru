<script>
    export let data;

    const showImg = data.images.slice(0, 10);
</script>


<div class="about col-6">
    <h2>Database</h2>
    <div class="row">
        <p>
            This page is here to show that my database api script works. These images below were loaded using that script.
        </p>
    </div>

    {#each showImg as img }
        <img class="img-thumbnail" src="../Images/{img.imageURL}" alt="{img.imageID.toString()}">
    {/each}

</div>