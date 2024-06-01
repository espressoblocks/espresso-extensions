<script>
    import { page } from '$app/stores';

    import Extension from "$lib/Extension/Component.svelte";
    import Footer from "$lib/Footer/Component.svelte";
    import Logo from "$lib/Logo/Component.svelte";

    import { searchQuery, searchRecommendations, selectedRecommendedExt, extensions } from '$lib/stores.js';
    import localforage from 'localforage';
    import { onMount } from 'svelte';

    let loadingExtensions = true;

    const searchable = (text = '') => {
        text = String(text);
        return text.toLowerCase().trim();
    };

    const loadexts = async () => {
        loadingExtensions = true;
        extensions.set(JSON.parse(await localforage.getItem("espresso:extensions") ?? "[]"));
        loadingExtensions = false;
    }

    let recommendedExtensions = [];
    let showNoExtensionsFound = false;
    searchQuery.subscribe((query) => {
        const matchingExts = $extensions
            .filter(extension => searchable(extension.name).includes(query));
        showNoExtensionsFound = matchingExts.length <= 0;

        $searchRecommendations = [];
        if (matchingExts.length > 5 || showNoExtensionsFound) {
            recommendedExtensions = [];
            return;
        }
        recommendedExtensions = matchingExts.slice(0, 2);
        $searchRecommendations = recommendedExtensions.map(ext => ({
            name: `Copy ${ext.name} to clipboard`,
            callback: () => {
                $selectedRecommendedExt = ''; // reset first
                $selectedRecommendedExt = ext.code;
            }
        }));
    });

    onMount(() => {
        console.log("loading extensions");
        loadexts();
    });
</script>

<div class="top">
    <div class="header">
        <Logo />
        <h1>Espresso Extra Extensions</h1>
    </div>
</div>
<div class="main">
    <p>See some cool extensions made by other people here.</p>
    <p>
        To use some of these extensions in your projects, click the "Copy URL"
        button on an extension and
        <a href="/load" target="_blank">load it into Espresso,</a>
        or click the "View" button to create a new project with the extension.
    </p>
    <p>
        To add a source, click the "Add Source" button on the navbar and then enter the URL.
    </p>

    <div class="extension-list">
        {#each $extensions as extension}
            {#if searchable(extension.name).includes($searchQuery)}
                <Extension
                    name={extension.name}
                    image={extension.image ?? "/images/noImage.png"}
                    creator={extension.creator}
                    url={extension.url}
                    isGitHub={String(extension.isGitHub) === "true"}
                >
                    {extension.description}
                </Extension>
            {/if}
        {/each}
        {#if $extensions.length == 0 && !loadingExtensions}
            <p class="no-exts">Nothing found.</p>
        {/if}
        {#if loadingExtensions}
            <p class="no-exts">Loading..</p>
        {/if}
    </div>

    <Footer />
    <div style="height: 64px" />
</div>

<style>
    :global(body.dark-mode) {
        color: white;
    }

    .top {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .header {
        display: flex;
        align-items: center;
        flex-direction: row;
        font-size: 1.35em;
    }

    .main {
        width: 80%;
        margin-left: 10%;
        display: flex;
        flex-direction: column;
    }

    .extension-list {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }
    .no-exts {
        padding: 8px 32px;
        border: 1px solid rgba(0, 0, 0, 0.25);
        border-radius: 4px;
    }
    :global(body.dark-mode) .no-exts {
        border-color: rgba(255, 255, 255, 0.25);
    }
</style>
