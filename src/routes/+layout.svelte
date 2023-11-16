
<script>
    import '../css/main.css';    
    import '../css/stylesheet.css';
    import 'bootstrap/dist/css/bootstrap.min.css';
</script>

<div class="set-font">
    <!--Navbar / Banner-->
    <nav class="navbar navbar-expand-lg navbar-light">
        <a class="navbar-link" href="/">
            <img src="../refBooruIcon.svg" alt="refBooru icon">
        </a>
        <a class="navbar-link-text text-center" href="/">
            Home
        </a>
        <a class="navbar-link-text text-center" href="/about">
            About
        </a>
        <a class="navbar-link-text text-center" href="/contact">
            Contact
        </a>
        <a class="navbar-link-text text-center" href="/database">
            Database
        </a>
    </nav>

    <slot />
</div>



