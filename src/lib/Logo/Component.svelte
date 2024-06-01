<script>
    let clicks = 0;
    let visible = 0;
    let logoElement;
    let showGame = false;
    function click() {
        clicks += 1;
        visible = clicks - 5;
        showGame = clicks >= 5;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<img
    bind:this={logoElement}
    src="/espressoSmall.svg"
    alt="Espresso Logo"
    class="logo"
    on:click={click}
/>
{#if showGame}
<p>{visible}</p>
{/if}

<style>
    .logo {
        height: 3em;
        margin-right: 6px;
        cursor: pointer;
    }

    p {
        margin-right: 10px;
    }
</style>
